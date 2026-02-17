"""Background scheduler for auto-publishing scheduled posts.

Runs as an asyncio background task inside FastAPI's lifespan.
Polls the database every 60 seconds for posts that are due for publishing.
"""

import asyncio
import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.publishing import ScheduledPost

logger = logging.getLogger(__name__)

# Maximum concurrent publish tasks
MAX_CONCURRENT = 5


async def _process_due_posts() -> int:
    """Find and publish all posts that are due.

    Returns the number of posts processed.
    """
    db: Session = SessionLocal()
    try:
        now_iso = datetime.utcnow().isoformat()

        due_posts = (
            db.query(ScheduledPost)
            .filter(
                ScheduledPost.status == "scheduled",
                ScheduledPost.scheduled_at <= now_iso,
            )
            .limit(MAX_CONCURRENT)
            .all()
        )

        if not due_posts:
            return 0

        logger.info(f"[scheduler] Found {len(due_posts)} due post(s) to publish")

        from app.services.publisher import publish_post

        # Process posts concurrently (up to MAX_CONCURRENT)
        tasks = []
        for post in due_posts:
            # Mark as publishing immediately to prevent double-processing
            post.status = "publishing"

        db.commit()

        for post in due_posts:
            tasks.append(_publish_single(post.id))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Log results
        for post, result in zip(due_posts, results):
            if isinstance(result, Exception):
                logger.error(f"[scheduler] Failed to publish post {post.id}: {result}")
            else:
                logger.info(f"[scheduler] Published post {post.id} → {result}")

        return len(due_posts)

    except Exception as e:
        logger.error(f"[scheduler] Error processing due posts: {e}")
        return 0
    finally:
        db.close()


async def _publish_single(post_id: str) -> str:
    """Publish a single post in its own DB session."""
    db: Session = SessionLocal()
    try:
        from app.services.publisher import publish_post
        event = await publish_post(post_id, db)
        return f"{event.status} (event={event.id})"
    except Exception as e:
        # On error, mark the post as failed
        post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
        if post and post.status == "publishing":
            post.status = "failed"
            db.commit()
        raise
    finally:
        db.close()


async def run_scheduler(poll_interval: int = 60) -> None:
    """Main scheduler loop. Polls for due posts every `poll_interval` seconds.

    This function runs forever as a background task.
    """
    logger.info(f"[scheduler] Started — polling every {poll_interval}s for due posts")

    while True:
        try:
            count = await _process_due_posts()
            if count > 0:
                logger.info(f"[scheduler] Processed {count} post(s)")
        except Exception as e:
            logger.error(f"[scheduler] Unhandled error: {e}")

        await asyncio.sleep(poll_interval)

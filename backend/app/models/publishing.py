"""SEO & publishing tables: seo_briefs, keywords, hashtags, social_accounts,
campaigns, scheduled_posts, publish_events."""

from sqlalchemy import Column, Text, Integer, Float, ForeignKey, UniqueConstraint, Index
from app.database import Base


class SeoBrief(Base):
    __tablename__ = "seo_briefs"

    id = Column(Text, primary_key=True)
    project_id = Column(Text, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    chapters = Column(Text, default="[]")
    thumbnail_text = Column(Text)
    alt_text = Column(Text)
    on_screen_text = Column(Text, default="[]")  # JSON array of strings
    engagement_hook = Column(Text)
    target_audience = Column(Text)
    platform = Column(Text)
    version = Column(Integer, nullable=False, default=1)
    created_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)


class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Text, primary_key=True)
    brief_id = Column(Text, ForeignKey("seo_briefs.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(Text, nullable=False)
    search_volume = Column(Integer)
    difficulty = Column(Float)
    intent = Column(Text)
    rank = Column(Integer)


class Hashtag(Base):
    __tablename__ = "hashtags"

    id = Column(Text, primary_key=True)
    brief_id = Column(Text, ForeignKey("seo_briefs.id", ondelete="CASCADE"), nullable=False)
    hashtag = Column(Text, nullable=False)
    platform = Column(Text)
    rank = Column(Integer)


class SocialAccount(Base):
    __tablename__ = "social_accounts"
    __table_args__ = (
        UniqueConstraint("org_id", "provider", "provider_uid", name="social_accounts_org_provider_uid_uniq"),
    )

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    provider = Column(Text, nullable=False)
    provider_uid = Column(Text, nullable=False)
    display_name = Column(Text)
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(Text)
    scopes = Column(Text)
    status = Column(Text, nullable=False, default="active")
    connected_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Text, primary_key=True)
    project_id = Column(Text, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    status = Column(Text, nullable=False, default="draft")
    start_date = Column(Text)
    end_date = Column(Text)
    created_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    __table_args__ = (
        Index("scheduled_posts_campaign_id_idx", "campaign_id"),
        Index("scheduled_posts_status_idx", "status"),
    )

    id = Column(Text, primary_key=True)
    campaign_id = Column(Text, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    export_id = Column(Text, ForeignKey("exports.id", ondelete="SET NULL"))
    account_id = Column(Text, ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Text, nullable=False)
    scheduled_at = Column(Text, nullable=False)
    timezone = Column(Text, nullable=False, default="UTC")
    title = Column(Text)
    description = Column(Text)
    hashtags = Column(Text)
    status = Column(Text, nullable=False, default="draft")
    approved_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)


class PublishEvent(Base):
    __tablename__ = "publish_events"

    id = Column(Text, primary_key=True)
    post_id = Column(Text, ForeignKey("scheduled_posts.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Text, nullable=False)
    platform_post_id = Column(Text)
    status = Column(Text, nullable=False)
    error_code = Column(Text)
    error_message = Column(Text)
    retry_count = Column(Integer, nullable=False, default=0)
    published_at = Column(Text)
    platform_url = Column(Text)
    created_at = Column(Text, nullable=False)

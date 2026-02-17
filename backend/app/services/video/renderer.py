"""Video clip cutting and concatenation — port of video/renderer.ts."""

import asyncio
import os


async def render_edited_video(
    input_file: str,
    scene_ranges: list[dict],
    output_file: str,
    work_dir: str,
) -> None:
    """
    Cut scenes from input_file according to scene_ranges and concatenate
    them into output_file.

    Each scene_range dict must have: start_ms, end_ms.
    """
    os.makedirs(work_dir, exist_ok=True)
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Step 1: Cut individual clips
    clip_paths: list[str] = []
    for idx, rng in enumerate(scene_ranges):
        start_s = rng["start_ms"] / 1000
        duration_s = (rng["end_ms"] - rng["start_ms"]) / 1000
        clip_path = os.path.join(work_dir, f"clip_{idx:04d}.mp4")

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_s),
            "-i", input_file,
            "-t", str(duration_s),
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac", "-b:a", "128k",
            clip_path,
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg clip cut failed for clip {idx}: {stderr.decode()}")
        clip_paths.append(clip_path)

    # Step 2: Write concat list
    concat_list_path = os.path.join(work_dir, "concat.txt")
    with open(concat_list_path, "w") as f:
        for cp in clip_paths:
            f.write(f"file '{cp}'\n")

    # Step 3: Concatenate clips
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        output_file,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg concat failed: {stderr.decode()}")

"""Video metadata extraction and thumbnail generation — port of video/processor.ts.

Requires ffprobe / ffmpeg on PATH.
"""

import asyncio
import json
import os
import re
import subprocess


async def extract_metadata(file_path: str) -> dict:
    """Use ffprobe to extract video metadata (duration, resolution, codec, size)."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", "-show_streams", file_path,
    ]

    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {stderr.decode()}")

    probe = json.loads(stdout.decode())

    video_stream = None
    for stream in probe.get("streams", []):
        if stream.get("codec_type") == "video":
            video_stream = stream
            break

    duration_secs = float(probe.get("format", {}).get("duration", 0))
    size_bytes = int(probe.get("format", {}).get("size", 0)) or os.path.getsize(file_path)

    resolution = None
    codec = None
    if video_stream:
        w = video_stream.get("width", 0)
        h = video_stream.get("height", 0)
        resolution = f"{w}x{h}" if w and h else None
        codec = video_stream.get("codec_name")

    return {
        "duration_ms": int(duration_secs * 1000),
        "resolution": resolution,
        "codec": codec,
        "size_bytes": size_bytes,
    }


async def generate_thumbnail(file_path: str, timestamp: float, output_path: str) -> None:
    """Generate a WebP thumbnail at the given timestamp in seconds."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    cmd = [
        "ffmpeg", "-y", "-ss", str(timestamp), "-i", file_path,
        "-vframes", "1", "-vf", "scale=480:-1",
        "-c:v", "libwebp", "-quality", "80",
        output_path,
    ]

    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg thumbnail failed: {stderr.decode()}")

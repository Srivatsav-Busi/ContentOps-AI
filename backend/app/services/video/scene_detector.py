"""Scene detection using ffmpeg — port of video/scene-detector.ts."""

import asyncio
import re


async def detect_scenes(file_path: str, threshold: float = 0.3) -> list[dict]:
    """
    Detect scene changes in a video using ffmpeg's scene filter.
    Returns a list of dicts with: start_ms, end_ms, score.
    """
    # First get the total duration
    probe_cmd = [
        "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
        "-of", "csv=p=0", file_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *probe_cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    total_duration_s = float(stdout.decode().strip() or "0")
    total_duration_ms = int(total_duration_s * 1000)

    if total_duration_ms == 0:
        return []

    # Detect scene changes
    cmd = [
        "ffmpeg", "-i", file_path,
        "-vf", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-",
    ]

    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    output = stderr.decode()

    # Parse pts_time from showinfo output
    pattern = re.compile(r"pts_time:\s*([\d.]+)")
    timestamps_s = [float(m.group(1)) for m in pattern.finditer(output)]

    # Build scene boundaries
    scenes: list[dict] = []
    boundaries_ms = [0] + [int(t * 1000) for t in timestamps_s] + [total_duration_ms]

    for i in range(len(boundaries_ms) - 1):
        start = boundaries_ms[i]
        end = boundaries_ms[i + 1]
        if end > start:
            scenes.append({
                "start_ms": start,
                "end_ms": end,
                "score": threshold,
            })

    return scenes

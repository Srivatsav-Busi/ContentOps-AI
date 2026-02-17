import ffmpeg from "fluent-ffmpeg";

export interface DetectedScene {
  startMs: number;
  endMs: number;
  score: number;
}

/**
 * Detects scene boundaries in a video using FFmpeg's scene detection filter.
 * Uses `select='gt(scene,THRESHOLD)'` with showinfo to find scene-change timestamps.
 *
 * @param filePath  Path to the video file
 * @param threshold Scene-change sensitivity (0–1). Lower = more scenes detected. Default 0.3.
 * @returns Array of detected scenes with start/end times and confidence scores.
 */
export function detectScenes(
  filePath: string,
  threshold: number = 0.3
): Promise<DetectedScene[]> {
  return new Promise((resolve, reject) => {
    const timestamps: { timeSec: number; score: number }[] = [];
    let durationMs = 0;

    ffmpeg.ffprobe(filePath, (probeErr, data) => {
      if (probeErr) {
        return reject(new Error(`ffprobe failed: ${probeErr.message}`));
      }

      durationMs = Math.round((data.format.duration ?? 0) * 1000);

      if (durationMs <= 0) {
        return resolve([]);
      }

      let stderrOutput = "";

      ffmpeg(filePath)
        .outputOptions([
          "-vf",
          `select='gt(scene\\,${threshold})',showinfo`,
          "-f",
          "null",
        ])
        .output("-")
        .on("stderr", (line: string) => {
          stderrOutput += line + "\n";
        })
        .on("end", () => {
          const lines = stderrOutput.split("\n");
          const showInfoRegex = /pts_time:(\d+\.?\d*)/;
          const sceneScoreRegex = /scene:(\d+\.?\d*)/;

          for (const line of lines) {
            if (!line.includes("showinfo") && !line.includes("pts_time")) continue;

            const timeMatch = showInfoRegex.exec(line);
            if (!timeMatch) continue;

            const timeSec = parseFloat(timeMatch[1]);
            let score = threshold;

            const scoreMatch = sceneScoreRegex.exec(line);
            if (scoreMatch) {
              score = parseFloat(scoreMatch[1]);
            }

            timestamps.push({ timeSec, score });
          }

          const scenes = buildScenes(timestamps, durationMs);
          resolve(scenes);
        })
        .on("error", (err) => {
          reject(new Error(`Scene detection failed: ${err.message}`));
        })
        .run();
    });
  });
}

/**
 * Converts a list of scene-change timestamps into scene segments.
 */
function buildScenes(
  timestamps: { timeSec: number; score: number }[],
  durationMs: number
): DetectedScene[] {
  if (timestamps.length === 0) {
    return [{ startMs: 0, endMs: durationMs, score: 0 }];
  }

  timestamps.sort((a, b) => a.timeSec - b.timeSec);

  const scenes: DetectedScene[] = [];
  let prevMs = 0;

  for (const ts of timestamps) {
    const currentMs = Math.round(ts.timeSec * 1000);
    if (currentMs > prevMs) {
      scenes.push({
        startMs: prevMs,
        endMs: currentMs,
        score: ts.score,
      });
    }
    prevMs = currentMs;
  }

  if (prevMs < durationMs) {
    scenes.push({
      startMs: prevMs,
      endMs: durationMs,
      score: 0,
    });
  }

  return scenes;
}

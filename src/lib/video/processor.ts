import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export interface VideoMetadata {
  durationMs: number;
  resolution: string;
  codec: string;
  sizeBytes: number;
  fps: number;
}

/**
 * Uses ffprobe to extract metadata from a video file.
 */
export function extractMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        return reject(new Error(`ffprobe failed for ${filePath}: ${err.message}`));
      }

      const videoStream = data.streams.find((s) => s.codec_type === "video");
      if (!videoStream) {
        return reject(new Error(`No video stream found in ${filePath}`));
      }

      const durationSec = data.format.duration ?? 0;
      const sizeBytes = data.format.size ?? 0;

      let fps = 0;
      if (videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split("/").map(Number);
        fps = den ? Math.round((num / den) * 100) / 100 : num;
      }

      resolve({
        durationMs: Math.round(durationSec * 1000),
        resolution: `${videoStream.width ?? 0}x${videoStream.height ?? 0}`,
        codec: videoStream.codec_name ?? "unknown",
        sizeBytes: typeof sizeBytes === "string" ? parseInt(sizeBytes, 10) : sizeBytes,
        fps,
      });
    });
  });
}

/**
 * Extracts a single frame as WebP at the given timestamp (in seconds).
 * Returns the output file path.
 */
export function generateThumbnail(
  filePath: string,
  timestampSec: number,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    ffmpeg(filePath)
      .seekInput(timestampSec)
      .frames(1)
      .outputOptions(["-vf", "scale=640:-1", "-c:v", "libwebp", "-q:v", "80"])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) =>
        reject(new Error(`Thumbnail generation failed: ${err.message}`))
      )
      .run();
  });
}

/**
 * Extracts N evenly-spaced thumbnails from a video.
 * Returns an array of output file paths.
 */
export async function generateThumbnailGrid(
  filePath: string,
  count: number,
  outputDir: string
): Promise<string[]> {
  if (count < 1) {
    throw new Error("Thumbnail count must be at least 1");
  }

  const metadata = await extractMetadata(filePath);
  const durationSec = metadata.durationMs / 1000;

  if (durationSec <= 0) {
    throw new Error("Video has zero or negative duration");
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const interval = durationSec / (count + 1);
  const paths: string[] = [];

  for (let i = 1; i <= count; i++) {
    const timestamp = interval * i;
    const outFile = path.join(outputDir, `thumb_${String(i).padStart(3, "0")}.webp`);
    await generateThumbnail(filePath, timestamp, outFile);
    paths.push(outFile);
  }

  return paths;
}

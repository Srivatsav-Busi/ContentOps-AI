import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

interface SceneRange {
  startMs: number;
  endMs: number;
}

function cutClip(
  inputFile: string,
  outputFile: string,
  startSec: number,
  durationSec: number
) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputFile)
      .setStartTime(startSec)
      .setDuration(durationSec)
      .outputOptions([
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
      ])
      .output(outputFile)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Clip cut failed: ${err.message}`)))
      .run();
  });
}

function concatClips(listFile: string, outputFile: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions([
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
      ])
      .output(outputFile)
      .on("end", () => resolve())
      .on("error", (err) =>
        reject(new Error(`Clip concatenation failed: ${err.message}`))
      )
      .run();
  });
}

export async function renderEditedVideo(params: {
  inputFilePath: string;
  scenes: SceneRange[];
  outputFilePath: string;
  workDir: string;
}) {
  const { inputFilePath, scenes, outputFilePath, workDir } = params;

  if (scenes.length === 0) {
    throw new Error("No scenes provided for rendering");
  }

  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

  const clipPaths: string[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const durationMs = Math.max(0, scene.endMs - scene.startMs);
    if (durationMs <= 0) continue;

    const clipPath = path.join(workDir, `clip_${String(i).padStart(3, "0")}.mp4`);
    await cutClip(inputFilePath, clipPath, scene.startMs / 1000, durationMs / 1000);
    clipPaths.push(clipPath);
  }

  if (clipPaths.length === 0) {
    throw new Error("All selected scenes had invalid duration");
  }

  const concatList = path.join(workDir, "concat.txt");
  const concatData = clipPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  fs.writeFileSync(concatList, concatData, "utf8");

  await concatClips(concatList, outputFilePath);

  return outputFilePath;
}


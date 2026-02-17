import { NextRequest } from "next/server";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  corsPreflightResponse,
} from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { extractMetadata } from "@/lib/video/processor";
import { generateThumbnail } from "@/lib/video/processor";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return errorResponse("Missing required field: file", 400);
    }
    if (!projectId) {
      return errorResponse("Missing required field: projectId", 400);
    }

    const assetId = crypto.randomUUID();
    const orgId = user.orgId;
    const filename = file.name;
    const mimeType = file.type || "video/mp4";

    // Build upload directory and write the file
    const uploadDir = path.join(
      process.cwd(),
      "data",
      "uploads",
      orgId,
      assetId,
      "original"
    );
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const storageKey = `uploads/${orgId}/${assetId}/original/${filename}`;

    // Create the asset record with status "processing"
    db.insert(videoAssets)
      .values({
        id: assetId,
        projectId,
        orgId,
        filename,
        storageKey,
        mimeType,
        status: "processing",
      })
      .run();

    // Extract video metadata
    let durationMs: number | undefined;
    let resolution: string | undefined;
    let codec: string | undefined;
    let sizeBytes: number | undefined;
    let thumbnailUrl: string | undefined;

    try {
      const metadata = await extractMetadata(filePath);
      durationMs = metadata.durationMs;
      resolution = metadata.resolution;
      codec = metadata.codec;
      sizeBytes = metadata.sizeBytes;

      // Generate a thumbnail at 25% of the video duration
      const thumbTimestamp = metadata.durationMs / 1000 * 0.25;
      const thumbDir = path.join(
        process.cwd(),
        "data",
        "uploads",
        orgId,
        assetId,
        "thumbnails"
      );
      fs.mkdirSync(thumbDir, { recursive: true });

      const thumbPath = path.join(thumbDir, "thumb.webp");
      await generateThumbnail(filePath, thumbTimestamp, thumbPath);
      thumbnailUrl = `uploads/${orgId}/${assetId}/thumbnails/thumb.webp`;
    } catch (processingError) {
      console.error("Video processing warning:", processingError);
      // Continue even if metadata/thumbnail extraction fails — mark ready anyway
    }

    // Update the asset with metadata and mark as ready
    db.update(videoAssets)
      .set({
        durationMs: durationMs ?? null,
        resolution: resolution ?? null,
        codec: codec ?? null,
        sizeBytes: sizeBytes ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        status: "ready",
      })
      .where(eq(videoAssets.id, assetId))
      .run();

    // Fetch the completed asset record
    const [asset] = db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.id, assetId))
      .limit(1)
      .all();

    return jsonResponse(asset, 201);
  } catch (e) {
    if (e instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

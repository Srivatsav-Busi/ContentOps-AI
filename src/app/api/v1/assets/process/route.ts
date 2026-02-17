import { NextRequest } from "next/server";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scenes, transcripts, videoAssets } from "@/lib/db/schema";
import { detectScenes } from "@/lib/video/scene-detector";
import { storageKeyToAbsolutePath } from "@/lib/video/storage";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    let body: { assetId?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.assetId) {
      return errorResponse("assetId is required", 422, "ERR_VALIDATION");
    }

    const [asset] = db
      .select()
      .from(videoAssets)
      .where(and(eq(videoAssets.id, body.assetId), eq(videoAssets.orgId, user.orgId)))
      .limit(1)
      .all();

    if (!asset) {
      return errorResponse("Asset not found", 404, "ERR_NOT_FOUND");
    }

    const inputPath = storageKeyToAbsolutePath(asset.storageKey);

    const detected = await detectScenes(inputPath, 0.3);
    if (detected.length === 0) {
      return errorResponse("No scenes detected", 422, "ERR_SCENE_DETECTION");
    }

    // Clear existing scene rows for idempotent processing.
    db.delete(scenes).where(eq(scenes.assetId, asset.id)).run();

    const sceneRows = detected.map((s, idx) => ({
      id: crypto.randomUUID(),
      assetId: asset.id,
      orgId: user.orgId,
      startMs: s.startMs,
      endMs: s.endMs,
      label: `Scene ${idx + 1}`,
      confidence: s.score,
      transcriptText: `Scene ${idx + 1}`,
      orderIndex: idx,
    }));

    db.insert(scenes).values(sceneRows).run();

    // For now we persist a deterministic fallback transcript so downstream
    // generation/render flows can run even without ASR integration.
    const transcriptSegments = sceneRows.map((s) => ({
      startMs: s.startMs,
      endMs: s.endMs,
      text: s.transcriptText,
      confidence: s.confidence ?? 0,
    }));
    const fullText = transcriptSegments.map((s) => s.text).join(". ");

    const [existingTranscript] = db
      .select()
      .from(transcripts)
      .where(eq(transcripts.assetId, asset.id))
      .limit(1)
      .all();

    if (existingTranscript) {
      db.update(transcripts)
        .set({
          fullText,
          segments: JSON.stringify(transcriptSegments),
          overallConfidence:
            transcriptSegments.reduce((sum, s) => sum + s.confidence, 0) /
            transcriptSegments.length,
        })
        .where(eq(transcripts.id, existingTranscript.id))
        .run();
    } else {
      db.insert(transcripts)
        .values({
          id: crypto.randomUUID(),
          assetId: asset.id,
          orgId: user.orgId,
          language: "en",
          fullText,
          segments: JSON.stringify(transcriptSegments),
          overallConfidence:
            transcriptSegments.reduce((sum, s) => sum + s.confidence, 0) /
            transcriptSegments.length,
        })
        .run();
    }

    db.update(videoAssets)
      .set({ status: "ready" })
      .where(eq(videoAssets.id, asset.id))
      .run();

    return jsonResponse({
      assetId: asset.id,
      scenesDetected: sceneRows.length,
      transcriptGenerated: true,
    });
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}


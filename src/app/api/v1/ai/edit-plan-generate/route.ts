import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scenes, videoAssets } from "@/lib/db/schema";
import { generateEditPlan } from "@/lib/ai/agents/edit-plan-generator";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const hasAIKey =
      !!process.env.LLM_API_KEY ||
      !!process.env.OPENROUTER_API_KEY ||
      !!process.env.OPENAI_API_KEY;
    if (!hasAIKey) {
      return errorResponse("LLM API key not configured", 503);
    }

    const authCtx = await requireAuth(request);

    const body = await request.json();
    const { projectId, assetId, targetFormat, targetDurationMs } = body;

    if (!projectId || !assetId || !targetFormat) {
      return errorResponse(
        "Missing required fields: projectId, assetId, targetFormat",
        400
      );
    }

    // Verify asset belongs to this org
    const [asset] = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.id, assetId))
      .limit(1);

    if (!asset || asset.orgId !== authCtx.org.id) {
      return errorResponse("Asset not found", 404);
    }

    // Look up scenes for the asset
    const assetScenes = await db
      .select()
      .from(scenes)
      .where(eq(scenes.assetId, assetId));

    if (assetScenes.length === 0) {
      return errorResponse(
        "No scenes found for this asset. Please run scene detection first.",
        404
      );
    }

    const sceneInputs = assetScenes.map((s) => ({
      id: s.id,
      startMs: s.startMs,
      endMs: s.endMs,
      label: s.label ?? "unlabeled",
      confidence: s.confidence ?? 0,
      transcriptText: s.transcriptText ?? "",
    }));

    const result = await generateEditPlan({
      scenes: sceneInputs,
      targetFormat,
      targetDurationMs: targetDurationMs ?? undefined,
      projectId,
      orgId: authCtx.org.id,
      userId: authCtx.user.id,
    });

    return jsonResponse(result, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, 401);
    }
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export async function OPTIONS() {
  return corsPreflightResponse();
}

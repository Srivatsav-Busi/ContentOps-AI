import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { transcripts, videoAssets } from "@/lib/db/schema";
import { generateSEOBrief } from "@/lib/ai/agents/seo-generator";
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
    const { projectId, assetId, platform, targetAudience } = body;

    if (!projectId || !assetId || !platform) {
      return errorResponse(
        "Missing required fields: projectId, assetId, platform",
        400
      );
    }

    if (!["youtube", "instagram", "both"].includes(platform)) {
      return errorResponse(
        "platform must be one of: youtube, instagram, both",
        400
      );
    }

    // Look up the asset to verify it belongs to this org
    const [asset] = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.id, assetId))
      .limit(1);

    if (!asset || asset.orgId !== authCtx.org.id) {
      return errorResponse("Asset not found", 404);
    }

    // Look up transcript for the asset
    const [transcript] = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.assetId, assetId))
      .limit(1);

    if (!transcript || !transcript.fullText) {
      return errorResponse(
        "No transcript found for this asset. Please transcribe the video first.",
        404
      );
    }

    const result = await generateSEOBrief({
      transcriptText: transcript.fullText,
      platform,
      targetAudience: targetAudience ?? undefined,
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

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { editPlans, exports_, renderJobs, scenes, videoAssets } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { extractMetadata } from "@/lib/video/processor";
import { renderEditedVideo } from "@/lib/video/renderer";
import { storageKeyToAbsolutePath } from "@/lib/video/storage";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  paginatedResponse,
  parseSearchParams,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { limit, status } = parseSearchParams(request);

    const conditions = [eq(renderJobs.orgId, user.orgId)];
    if (status) conditions.push(eq(renderJobs.status, status));

    const results = db
      .select()
      .from(renderJobs)
      .where(and(...conditions))
      .orderBy(desc(renderJobs.createdAt))
      .limit(limit)
      .all();

    return paginatedResponse(results, null, results.length === limit);
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    let body: {
      editPlanId?: string;
      format?: string;
      resolution?: string;
      aspectRatio?: string;
    };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.editPlanId) {
      return errorResponse("editPlanId is required", 422, "ERR_VALIDATION");
    }

    const format = (body.format ?? "mp4").toLowerCase();
    const resolution = body.resolution ?? "1920x1080";

    const [plan] = db
      .select()
      .from(editPlans)
      .where(and(eq(editPlans.id, body.editPlanId), eq(editPlans.orgId, user.orgId)))
      .limit(1)
      .all();

    if (!plan) {
      return errorResponse("Edit plan not found", 404, "ERR_NOT_FOUND");
    }

    const sceneIds: string[] = plan.sceneIds ? JSON.parse(plan.sceneIds) : [];
    if (sceneIds.length === 0) {
      return errorResponse("Edit plan has no scenes", 422, "ERR_VALIDATION");
    }

    const sceneRows = db
      .select()
      .from(scenes)
      .where(and(eq(scenes.orgId, user.orgId), inArray(scenes.id, sceneIds)))
      .all();

    if (sceneRows.length === 0) {
      return errorResponse("No matching scenes found for edit plan", 404, "ERR_NOT_FOUND");
    }

    const sceneById = new Map(sceneRows.map((s) => [s.id, s]));
    const orderedScenes = sceneIds
      .map((id) => sceneById.get(id))
      .filter((s): s is typeof sceneRows[number] => !!s);

    const firstAssetId = orderedScenes[0]?.assetId;
    if (!firstAssetId || orderedScenes.some((s) => s.assetId !== firstAssetId)) {
      return errorResponse(
        "All scenes in an edit plan must belong to one asset",
        422,
        "ERR_VALIDATION"
      );
    }

    const [asset] = db
      .select()
      .from(videoAssets)
      .where(and(eq(videoAssets.id, firstAssetId), eq(videoAssets.orgId, user.orgId)))
      .limit(1)
      .all();

    if (!asset) {
      return errorResponse("Source asset not found", 404, "ERR_NOT_FOUND");
    }

    const nowIso = new Date().toISOString();
    const renderJobId = crypto.randomUUID();

    db.insert(renderJobs)
      .values({
        id: renderJobId,
        editPlanId: plan.id,
        orgId: user.orgId,
        format: format.toUpperCase(),
        resolution,
        aspectRatio: body.aspectRatio ?? null,
        status: "processing",
        progressPct: 5,
        startedAt: nowIso,
      })
      .run();

    try {
      const inputFilePath = storageKeyToAbsolutePath(asset.storageKey);
      const outputDir = path.join(process.cwd(), "data", "exports", user.orgId, renderJobId);
      const workDir = path.join(outputDir, "work");
      const outputFilename = `edited.${format}`;
      const outputFilePath = path.join(outputDir, outputFilename);

      db.update(renderJobs)
        .set({ progressPct: 35 })
        .where(eq(renderJobs.id, renderJobId))
        .run();

      await renderEditedVideo({
        inputFilePath,
        scenes: orderedScenes.map((s) => ({ startMs: s.startMs, endMs: s.endMs })),
        outputFilePath,
        workDir,
      });

      db.update(renderJobs)
        .set({ progressPct: 85 })
        .where(eq(renderJobs.id, renderJobId))
        .run();

      const metadata = await extractMetadata(outputFilePath);
      const fileStat = fs.statSync(outputFilePath);

      const storageKey = path.join("exports", user.orgId, renderJobId, outputFilename);
      const publicUrl = `/${storageKey}`;

      const exportId = crypto.randomUUID();
      db.insert(exports_)
        .values({
          id: exportId,
          renderJobId,
          orgId: user.orgId,
          storageKey,
          publicUrl,
          format: format.toUpperCase(),
          sizeBytes: fileStat.size,
          durationMs: metadata.durationMs,
        })
        .run();

      db.update(renderJobs)
        .set({
          status: "completed",
          progressPct: 100,
          completedAt: new Date().toISOString(),
          errorMessage: null,
        })
        .where(eq(renderJobs.id, renderJobId))
        .run();

      const [job] = db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, renderJobId))
        .limit(1)
        .all();
      const [exportRow] = db
        .select()
        .from(exports_)
        .where(eq(exports_.renderJobId, renderJobId))
        .limit(1)
        .all();

      return jsonResponse({ job, export: exportRow }, 201);
    } catch (renderErr) {
      db.update(renderJobs)
        .set({
          status: "failed",
          progressPct: 100,
          completedAt: new Date().toISOString(),
          errorMessage:
            renderErr instanceof Error ? renderErr.message : "Rendering failed",
        })
        .where(eq(renderJobs.id, renderJobId))
        .run();
      throw renderErr;
    }
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

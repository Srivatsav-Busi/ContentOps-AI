import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  requireAuth,
  AuthError,
  errorResponse,
  paginatedResponse,
  parseSearchParams,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { limit, projectId } = parseSearchParams(request);

    const conditions = [eq(videoAssets.orgId, user.orgId)];
    if (projectId) conditions.push(eq(videoAssets.projectId, projectId));

    const results = db
      .select()
      .from(videoAssets)
      .where(and(...conditions))
      .orderBy(desc(videoAssets.createdAt))
      .limit(limit)
      .all();

    return paginatedResponse(results, null, results.length === limit);
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

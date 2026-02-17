import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exports_ } from "@/lib/db/schema";
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
    const { limit } = parseSearchParams(request);

    const url = new URL(request.url);
    const renderJobId = url.searchParams.get("render_job_id");

    const conditions = [eq(exports_.orgId, user.orgId)];
    if (renderJobId) conditions.push(eq(exports_.renderJobId, renderJobId));

    const results = db
      .select()
      .from(exports_)
      .where(and(...conditions))
      .orderBy(desc(exports_.createdAt))
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

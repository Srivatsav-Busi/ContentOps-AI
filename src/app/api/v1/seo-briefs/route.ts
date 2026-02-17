import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { seoBriefs } from "@/lib/db/schema";
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

    const url = new URL(request.url);
    const platform = url.searchParams.get("platform");

    const conditions = [eq(seoBriefs.orgId, user.orgId)];
    if (projectId) conditions.push(eq(seoBriefs.projectId, projectId));
    if (platform) conditions.push(eq(seoBriefs.platform, platform));

    const rows = db
      .select()
      .from(seoBriefs)
      .where(and(...conditions))
      .orderBy(desc(seoBriefs.createdAt))
      .limit(limit)
      .all();

    const results = rows.map((row) => ({
      ...row,
      chapters: row.chapters ? JSON.parse(row.chapters) : [],
    }));

    return paginatedResponse(results, null, results.length === limit);
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

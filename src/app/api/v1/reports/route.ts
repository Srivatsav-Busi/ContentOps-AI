import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
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
    const dashboardId = url.searchParams.get("dashboard_id");
    const frequency = url.searchParams.get("frequency");

    const conditions = [eq(reports.orgId, user.orgId)];
    if (dashboardId) conditions.push(eq(reports.dashboardId, dashboardId));
    if (frequency) conditions.push(eq(reports.frequency, frequency));

    const rows = db
      .select()
      .from(reports)
      .where(and(...conditions))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .all();

    const results = rows.map((row) => ({
      ...row,
      recipients: row.recipients ? JSON.parse(row.recipients) : [],
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

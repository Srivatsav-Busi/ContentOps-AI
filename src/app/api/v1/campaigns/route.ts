import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
    const { limit, status, projectId } = parseSearchParams(request);

    const conditions = [eq(campaigns.orgId, user.orgId)];
    if (status) conditions.push(eq(campaigns.status, status));
    if (projectId) conditions.push(eq(campaigns.projectId, projectId));

    const results = db
      .select()
      .from(campaigns)
      .where(and(...conditions))
      .orderBy(desc(campaigns.createdAt))
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

    let body: { name?: string; projectId?: string; startDate?: string; endDate?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.name || body.name.trim().length === 0) {
      return errorResponse("Campaign name is required", 422, "ERR_VALIDATION");
    }
    if (!body.projectId) {
      return errorResponse("projectId is required", 422, "ERR_VALIDATION");
    }

    const [created] = db
      .insert(campaigns)
      .values({
        orgId: user.orgId,
        projectId: body.projectId,
        name: body.name.trim(),
        status: "draft",
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
        createdBy: user.id,
      })
      .returning()
      .all();

    return jsonResponse(created, 201);
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

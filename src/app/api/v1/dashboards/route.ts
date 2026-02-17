import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dashboards } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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
    const { limit } = parseSearchParams(request);

    const rows = db
      .select()
      .from(dashboards)
      .where(eq(dashboards.orgId, user.orgId))
      .orderBy(desc(dashboards.createdAt))
      .limit(limit)
      .all();

    const results = rows.map((row) => ({
      ...row,
      layoutJson: row.layoutJson ? JSON.parse(row.layoutJson) : null,
    }));

    return paginatedResponse(results, null, results.length === limit);
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    let body: { name?: string; description?: string; template?: string; layoutJson?: unknown };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.name || body.name.trim().length === 0) {
      return errorResponse("Dashboard name is required", 422, "ERR_VALIDATION");
    }

    const [created] = db
      .insert(dashboards)
      .values({
        orgId: user.orgId,
        name: body.name.trim(),
        description: body.description ?? null,
        template: body.template ?? null,
        layoutJson: body.layoutJson ? JSON.stringify(body.layoutJson) : null,
        isDefault: false,
        createdBy: user.id,
      })
      .returning()
      .all();

    return jsonResponse(
      { ...created, layoutJson: created.layoutJson ? JSON.parse(created.layoutJson) : null },
      201,
    );
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

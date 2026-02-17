import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and, like, desc } from "drizzle-orm";
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
    const { limit, status, search } = parseSearchParams(request);

    const conditions = [eq(projects.orgId, user.orgId)];
    if (status) conditions.push(eq(projects.status, status));
    if (search) conditions.push(like(projects.name, `%${search}%`));

    const results = db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.createdAt))
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

    let body: { name?: string; template?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.name || body.name.trim().length === 0) {
      return errorResponse("Project name is required", 422, "ERR_VALIDATION");
    }

    const [created] = db
      .insert(projects)
      .values({
        orgId: user.orgId,
        name: body.name.trim(),
        template: body.template ?? null,
        status: "active",
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

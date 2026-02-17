import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, roles, orgs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Role, PaginationMeta } from "@/lib/types";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse<T>(data: T, status = 200, meta?: PaginationMeta) {
  return NextResponse.json(
    { data, meta: meta ?? null, errors: null },
    { status, headers: CORS_HEADERS }
  );
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { data: null, meta: null, errors: [{ code: code ?? `ERR_${status}`, message }] },
    { status, headers: CORS_HEADERS }
  );
}

export function paginatedResponse<T>(
  data: T[],
  cursor?: string | null,
  hasMore = false,
  total?: number
) {
  const meta: PaginationMeta = { cursor: cursor ?? undefined, hasMore, total };
  return NextResponse.json(
    { data, meta, errors: null },
    { status: 200, headers: CORS_HEADERS }
  );
}

export interface AuthContext {
  user: {
    id: string;
    orgId: string;
    email: string;
    displayName: string | null;
    role: string;
    avatarUrl: string | null;
  };
  org: {
    id: string;
    name: string;
    slug: string;
    planTier: string;
  };
}

export async function requireAuth(_request?: NextRequest): Promise<AuthContext> {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError("Unauthorized");
  }

  const userId = (session.user as any).id;
  const orgId = (session.user as any).orgId;
  const role = (session.user as any).role || "viewer";

  // Fetch org info
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);

  if (!org) {
    throw new AuthError("Organization not found");
  }

  // Get plan tier
  let planTier = "free";
  if (org.planId) {
    const { billingPlans } = await import("@/lib/db/schema");
    const [plan] = await db.select().from(billingPlans).where(eq(billingPlans.id, org.planId)).limit(1);
    if (plan) planTier = plan.tier;
  }

  return {
    user: {
      id: userId,
      orgId,
      email: session.user.email!,
      displayName: session.user.name ?? null,
      role,
      avatarUrl: session.user.image ?? null,
    },
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      planTier,
    },
  };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function requireRole(role: string, allowedRoles: Role[]): NextResponse | null {
  if (!allowedRoles.includes(role as Role)) {
    return errorResponse(
      `Forbidden – requires one of: ${allowedRoles.join(", ")}`,
      403,
      "ERR_FORBIDDEN"
    );
  }
  return null;
}

export function corsPreflightResponse() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function parseSearchParams(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const cursor = url.searchParams.get("cursor");
  const status = url.searchParams.get("status");
  const projectId = url.searchParams.get("project_id");
  const search = url.searchParams.get("search");
  return { limit, cursor, status, projectId, search };
}

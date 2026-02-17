import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
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
    const { limit } = parseSearchParams(request);

    const url = new URL(request.url);
    const severity = url.searchParams.get("severity");
    const isActiveParam = url.searchParams.get("is_active");

    const conditions = [eq(alerts.orgId, user.orgId)];
    if (severity) conditions.push(eq(alerts.severity, severity));
    if (isActiveParam !== null) {
      conditions.push(eq(alerts.isActive, isActiveParam === "true"));
    }

    const rows = db
      .select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt))
      .limit(limit)
      .all();

    const results = rows.map((row) => ({
      ...row,
      thresholdConfig: row.thresholdConfig ? JSON.parse(row.thresholdConfig) : null,
      channels: row.channels ? JSON.parse(row.channels) : [],
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

    let body: {
      name?: string;
      ruleType?: string;
      severity?: string;
      channels?: string[];
      kpiId?: string;
      thresholdConfig?: Record<string, unknown>;
      cooldownMinutes?: number;
    };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, "ERR_INVALID_BODY");
    }

    if (!body.name || body.name.trim().length === 0) {
      return errorResponse("Alert name is required", 422, "ERR_VALIDATION");
    }
    if (!body.ruleType) {
      return errorResponse("ruleType is required", 422, "ERR_VALIDATION");
    }
    if (!body.channels || body.channels.length === 0) {
      return errorResponse("At least one channel is required", 422, "ERR_VALIDATION");
    }

    const [created] = db
      .insert(alerts)
      .values({
        orgId: user.orgId,
        kpiId: body.kpiId ?? null,
        name: body.name.trim(),
        ruleType: body.ruleType,
        thresholdConfig: JSON.stringify(body.thresholdConfig ?? {}),
        severity: body.severity ?? "warning",
        channels: JSON.stringify(body.channels),
        isActive: true,
        cooldownMinutes: body.cooldownMinutes ?? 60,
      })
      .returning()
      .all();

    return jsonResponse(
      {
        ...created,
        thresholdConfig: created.thresholdConfig ? JSON.parse(created.thresholdConfig) : null,
        channels: created.channels ? JSON.parse(created.channels) : [],
      },
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

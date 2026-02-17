import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { billingPlans, usageEvents, orgs } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  try {
    const { user, org } = await requireAuth(request);

    const [orgRow] = db
      .select()
      .from(orgs)
      .where(eq(orgs.id, user.orgId))
      .limit(1)
      .all();

    if (!orgRow) {
      return errorResponse("Organization not found", 404);
    }

    let plan = null;
    if (orgRow.planId) {
      const [planRow] = db
        .select()
        .from(billingPlans)
        .where(eq(billingPlans.id, orgRow.planId))
        .limit(1)
        .all();
      if (planRow) {
        plan = {
          ...planRow,
          limitsJson: planRow.limitsJson ? JSON.parse(planRow.limitsJson) : null,
          features: planRow.features ? JSON.parse(planRow.features) : [],
        };
      }
    }

    const [usageCount] = db
      .select({ count: count() })
      .from(usageEvents)
      .where(eq(usageEvents.orgId, user.orgId))
      .all();

    const settings = orgRow.settings ? JSON.parse(orgRow.settings) : {};

    return jsonResponse({
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        planTier: org.planTier,
        settings,
      },
      plan,
      usageEventsCount: usageCount?.count ?? 0,
    });
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { anomalies, kpiConfigs, timeSeries } from "@/lib/db/schema";
import { explainAnomaly } from "@/lib/ai/agents/anomaly-explainer";
import {
  requireAuth,
  AuthError,
  jsonResponse,
  errorResponse,
  corsPreflightResponse,
} from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const hasAIKey =
      !!process.env.LLM_API_KEY ||
      !!process.env.OPENROUTER_API_KEY ||
      !!process.env.OPENAI_API_KEY;
    if (!hasAIKey) {
      return errorResponse("LLM API key not configured", 503);
    }

    const authCtx = await requireAuth(request);

    const body = await request.json();
    const { anomalyId } = body;

    if (!anomalyId) {
      return errorResponse("Missing required field: anomalyId", 400);
    }

    // Look up the anomaly
    const [anomaly] = await db
      .select()
      .from(anomalies)
      .where(eq(anomalies.id, anomalyId))
      .limit(1);

    if (!anomaly || anomaly.orgId !== authCtx.org.id) {
      return errorResponse("Anomaly not found", 404);
    }

    // Look up the KPI config
    const [kpi] = await db
      .select()
      .from(kpiConfigs)
      .where(eq(kpiConfigs.id, anomaly.kpiId))
      .limit(1);

    if (!kpi) {
      return errorResponse("Associated KPI not found", 404);
    }

    // Get recent time series data for context
    const recentData = await db
      .select()
      .from(timeSeries)
      .where(eq(timeSeries.kpiId, anomaly.kpiId))
      .orderBy(desc(timeSeries.timestamp))
      .limit(20);

    const recentDataPoints = recentData.map((dp) => ({
      timestamp: dp.timestamp,
      value: dp.value,
    }));

    const result = await explainAnomaly({
      kpiName: kpi.name,
      actualValue: anomaly.actualValue,
      expectedValue: anomaly.expectedValue,
      deviationPct: anomaly.deviationPct,
      severity: anomaly.severity,
      recentDataPoints,
    });

    // Update the anomaly's explanation in the database
    await db
      .update(anomalies)
      .set({ explanation: result.explanation })
      .where(eq(anomalies.id, anomalyId));

    return jsonResponse({
      anomalyId,
      kpiName: kpi.name,
      explanation: result.explanation,
      suggestedActions: result.suggestedActions,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, 401);
    }
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export async function OPTIONS() {
  return corsPreflightResponse();
}

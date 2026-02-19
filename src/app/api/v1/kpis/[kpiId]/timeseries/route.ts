import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

type RouteContext = { params: Promise<{ kpiId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { kpiId } = await context.params;
  return proxyToBackend(request, `/api/v1/kpis/${kpiId}/timeseries`);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { kpiId } = await context.params;
  return proxyToBackend(request, `/api/v1/kpis/${kpiId}/timeseries`);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { kpiId } = await context.params;
  return proxyToBackend(request, `/api/v1/kpis/${kpiId}/timeseries`);
}

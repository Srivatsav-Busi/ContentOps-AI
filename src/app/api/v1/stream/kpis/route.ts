import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/v1/stream/kpis", { stream: true });
}

export async function OPTIONS(request: NextRequest) {
  return proxyToBackend(request, "/api/v1/stream/kpis");
}

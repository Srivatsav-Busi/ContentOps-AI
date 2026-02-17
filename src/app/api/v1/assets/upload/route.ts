import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/v1/assets/upload");
}

export async function OPTIONS(request: NextRequest) {
  return proxyToBackend(request, "/api/v1/assets/upload");
}

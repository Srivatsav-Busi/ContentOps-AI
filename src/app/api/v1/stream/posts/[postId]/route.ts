import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { postId } = await context.params;
  return proxyToBackend(request, `/api/v1/stream/posts/${postId}`, { stream: true });
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { postId } = await context.params;
  return proxyToBackend(request, `/api/v1/stream/posts/${postId}`);
}

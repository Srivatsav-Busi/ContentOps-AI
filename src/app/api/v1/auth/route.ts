import { NextRequest } from "next/server";
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

    const permissions = derivePermissions(user.role);

    return jsonResponse({ user, org, permissions });
  } catch (e) {
    if (e instanceof AuthError) return errorResponse("Unauthorized", 401);
    throw e;
  }
}

export function OPTIONS() {
  return corsPreflightResponse();
}

function derivePermissions(role: string) {
  const base = ["project:read", "asset:read", "export:read", "dashboard:read"];

  const rolePermissions: Record<string, string[]> = {
    viewer: base,
    editor: [
      ...base,
      "project:write",
      "asset:write",
      "render:create",
      "seo:write",
      "campaign:write",
    ],
    admin: [
      ...base,
      "project:write",
      "project:delete",
      "asset:write",
      "asset:delete",
      "render:create",
      "seo:write",
      "campaign:write",
      "dashboard:write",
      "alert:write",
      "report:write",
      "billing:read",
      "org:settings",
    ],
    owner: [
      ...base,
      "project:write",
      "project:delete",
      "asset:write",
      "asset:delete",
      "render:create",
      "seo:write",
      "campaign:write",
      "dashboard:write",
      "alert:write",
      "report:write",
      "billing:read",
      "billing:write",
      "org:settings",
      "org:delete",
      "member:manage",
    ],
    billing: [...base, "billing:read", "billing:write"],
  };

  return rolePermissions[role] ?? base;
}

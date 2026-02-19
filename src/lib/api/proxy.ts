/**
 * Proxy helper — forwards authenticated requests from Next.js to the Python backend.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    requireAuth,
    AuthError,
    corsPreflightResponse,
    errorResponse,
} from "@/lib/api/helpers";

const PYTHON_BACKEND =
    process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

/**
 * Forward a request to the Python backend and return the Python response as-is.
 *
 * @param request  The incoming Next.js request
 * @param backendPath  The path on the Python backend, e.g. "/api/v1/projects"
 * @param opts  Options: skipAuth (for register), rawBody (pre-serialised body)
 */
export async function proxyToBackend(
    request: NextRequest,
    backendPath: string,
    opts?: { skipAuth?: boolean; stream?: boolean }
): Promise<NextResponse> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return corsPreflightResponse();
    }

    // Build headers to forward
    const headers: Record<string, string> = {};

    // Auth context
    if (!opts?.skipAuth) {
        try {
            const authCtx = await requireAuth(request);
            headers["X-Auth-Context"] = JSON.stringify(authCtx);
        } catch (err) {
            if (err instanceof AuthError) {
                return errorResponse("Unauthorized", 401);
            }
            throw err;
        }
    }

    // Forward content-type
    const ct = request.headers.get("content-type");
    if (ct) {
        headers["Content-Type"] = ct;
    }

    // Build fetch options
    const fetchOpts: RequestInit = {
        method: request.method,
        headers,
    };

    // Forward body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
        // For multipart (file uploads), pass the raw body through
        if (ct && ct.includes("multipart/form-data")) {
            fetchOpts.body = await request.arrayBuffer();
            // Let fetch set the boundary header from the original
            headers["Content-Type"] = ct;
        } else {
            try {
                const body = await request.text();
                if (body) {
                    fetchOpts.body = body;
                }
            } catch {
                // No body
            }
        }
    }

    // Forward query string
    const url = new URL(request.url);
    const qs = url.search; // includes leading ?

    const backendUrl = `${PYTHON_BACKEND}${backendPath}${qs}`;

    try {
        const resp = await fetch(backendUrl, fetchOpts);

        if (opts?.stream) {
            return new NextResponse(resp.body, {
                status: resp.status,
                headers: {
                    "Content-Type": resp.headers.get("Content-Type") || "text/event-stream",
                    "Cache-Control": resp.headers.get("Cache-Control") || "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods":
                        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        }

        const data = await resp.text();

        return new NextResponse(data, {
            status: resp.status,
            headers: {
                "Content-Type": resp.headers.get("Content-Type") || "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Proxy error → ${backendUrl}:`, message);
        return errorResponse(
            "Backend service unavailable",
            502,
            "ERR_BACKEND_DOWN"
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orgs, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { data: null, errors: [{ code: "VALIDATION", message: "Email and password are required" }] },
        { status: 422 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { data: null, errors: [{ code: "VALIDATION", message: "Password must be at least 8 characters" }] },
        { status: 422 }
      );
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { data: null, errors: [{ code: "CONFLICT", message: "An account with this email already exists" }] },
        { status: 409 }
      );
    }

    // Get the owner role
    const [ownerRole] = await db.select().from(roles).where(eq(roles.name, "owner")).limit(1);

    // Get the free plan
    const { billingPlans } = await import("@/lib/db/schema");
    const [freePlan] = await db.select().from(billingPlans).where(eq(billingPlans.tier, "free")).limit(1);

    // Create org
    const orgSlug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + crypto.randomUUID().slice(0, 6);
    const orgId = crypto.randomUUID();
    await db.insert(orgs).values({
      id: orgId,
      name: displayName ? `${displayName}'s Team` : "My Team",
      slug: orgSlug,
      planId: freePlan?.id ?? null,
      settings: JSON.stringify({ defaultTimezone: "UTC" }),
      region: "us-east-1",
    });

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      orgId,
      email,
      displayName: displayName || email.split("@")[0],
      passwordHash,
      roleId: ownerRole?.id ?? null,
      emailVerified: false,
    });

    return NextResponse.json(
      {
        data: { id: userId, email, orgId },
        meta: null,
        errors: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { data: null, errors: [{ code: "INTERNAL", message: "Registration failed" }] },
      { status: 500 }
    );
  }
}

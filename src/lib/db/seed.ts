import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Inline bcrypt-like hash for demo (just use a known hash for "password123")
// In production you'd use bcryptjs. For the seed we store a pre-computed bcrypt hash.
const DEMO_PASSWORD_HASH =
  "$2b$10$zzrsxZ.gSixnOxKfOAc9t.IYsLdgcrWu3JhOAZWG8vMohUQeOrHnW"; // "password123"

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "contentops.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding database...");

  // ── Roles ──
  const ownerRole = { id: crypto.randomUUID(), name: "owner", permissions: JSON.stringify(["*"]) };
  const adminRole = { id: crypto.randomUUID(), name: "admin", permissions: JSON.stringify(["projects:*", "assets:*", "render:*", "publish:*", "dashboards:*", "alerts:*", "team:*", "settings:*"]) };
  const editorRole = { id: crypto.randomUUID(), name: "editor", permissions: JSON.stringify(["projects:write", "assets:write", "render:trigger", "publish:write"]) };
  const viewerRole = { id: crypto.randomUUID(), name: "viewer", permissions: JSON.stringify(["projects:read", "assets:read", "dashboards:read"]) };
  const billingRole = { id: crypto.randomUUID(), name: "billing", permissions: JSON.stringify(["billing:*", "reports:read"]) };

  db.insert(schema.roles).values([ownerRole, adminRole, editorRole, viewerRole, billingRole]).run();
  console.log("  Roles created");

  // ── Billing Plans ──
  const freePlan = {
    id: crypto.randomUUID(),
    name: "Free",
    tier: "free",
    priceMonthly: 0,
    priceYearly: 0,
    limitsJson: JSON.stringify({ render_minutes: 10, storage_gb: 1, projects: 3, api_calls: 1000 }),
    features: JSON.stringify(["3 projects", "10 renders/mo", "1GB storage", "Basic SEO", "Email support"]),
    isActive: true,
  };
  const proPlan = {
    id: crypto.randomUUID(),
    name: "Pro",
    tier: "pro",
    priceMonthly: 49,
    priceYearly: 468,
    limitsJson: JSON.stringify({ render_minutes: 100, storage_gb: 50, projects: -1, api_calls: 50000 }),
    features: JSON.stringify(["Unlimited projects", "100 renders/mo", "50GB storage", "Advanced SEO", "Priority support", "Brand presets", "API access"]),
    isActive: true,
  };
  const enterprisePlan = {
    id: crypto.randomUUID(),
    name: "Enterprise",
    tier: "enterprise",
    priceMonthly: 0,
    priceYearly: 0,
    limitsJson: JSON.stringify({ render_minutes: -1, storage_gb: -1, projects: -1, api_calls: -1 }),
    features: JSON.stringify(["Everything in Pro", "Unlimited renders", "Dedicated support", "SSO/SAML", "Custom integrations", "SLA"]),
    isActive: true,
  };

  db.insert(schema.billingPlans).values([freePlan, proPlan, enterprisePlan]).run();
  console.log("  Billing plans created");

  // ── Demo Org ──
  const demoOrg = {
    id: crypto.randomUUID(),
    name: "Acme Content Co",
    slug: "acme-content",
    planId: proPlan.id,
    settings: JSON.stringify({ defaultTimezone: "America/New_York", watermark: false }),
    region: "us-east-1",
  };
  db.insert(schema.orgs).values(demoOrg).run();
  console.log("  Demo org created");

  // ── Demo Users ──
  const demoUser = {
    id: crypto.randomUUID(),
    orgId: demoOrg.id,
    email: "demo@contentops.ai",
    displayName: "Alex Rivera",
    passwordHash: DEMO_PASSWORD_HASH,
    roleId: ownerRole.id,
    emailVerified: true,
  };
  const editorUser = {
    id: crypto.randomUUID(),
    orgId: demoOrg.id,
    email: "editor@contentops.ai",
    displayName: "Jordan Chen",
    passwordHash: DEMO_PASSWORD_HASH,
    roleId: editorRole.id,
    emailVerified: true,
  };
  db.insert(schema.users).values([demoUser, editorUser]).run();
  console.log("  Demo users created");

  // ── Sample Projects ──
  const projectIds = Array.from({ length: 4 }, () => crypto.randomUUID());
  const projectNames = ["Q1 Product Launch", "Weekly Vlogs", "Tutorial Series", "Brand Campaign 2026"];
  const templates = ["youtube_long", "youtube_short", "instagram_reel", null];

  db.insert(schema.projects)
    .values(
      projectIds.map((id, i) => ({
        id,
        orgId: demoOrg.id,
        name: projectNames[i],
        template: templates[i],
        status: "active",
        createdBy: demoUser.id,
      }))
    )
    .run();
  console.log("  Sample projects created");

  // ── Sample Video Assets ──
  const assetIds = Array.from({ length: 3 }, () => crypto.randomUUID());
  db.insert(schema.videoAssets)
    .values([
      {
        id: assetIds[0],
        projectId: projectIds[0],
        orgId: demoOrg.id,
        filename: "product-launch-raw.mp4",
        storageKey: `${demoOrg.id}/assets/${assetIds[0]}/original/product-launch-raw.mp4`,
        mimeType: "video/mp4",
        durationMs: 185000,
        resolution: "1920x1080",
        codec: "h264",
        sizeBytes: 256000000,
        status: "ready",
      },
      {
        id: assetIds[1],
        projectId: projectIds[0],
        orgId: demoOrg.id,
        filename: "behind-the-scenes.mov",
        storageKey: `${demoOrg.id}/assets/${assetIds[1]}/original/behind-the-scenes.mov`,
        mimeType: "video/quicktime",
        durationMs: 420000,
        resolution: "3840x2160",
        codec: "prores",
        sizeBytes: 1200000000,
        status: "ready",
      },
      {
        id: assetIds[2],
        projectId: projectIds[1],
        orgId: demoOrg.id,
        filename: "vlog-ep-42.mp4",
        storageKey: `${demoOrg.id}/assets/${assetIds[2]}/original/vlog-ep-42.mp4`,
        mimeType: "video/mp4",
        durationMs: 900000,
        resolution: "1920x1080",
        codec: "h264",
        sizeBytes: 480000000,
        status: "ready",
      },
    ])
    .run();
  console.log("  Sample video assets created");

  // ── Sample Dashboard ──
  const dashboardId = crypto.randomUUID();
  db.insert(schema.dashboards)
    .values({
      id: dashboardId,
      orgId: demoOrg.id,
      name: "Channel Overview",
      description: "Cross-platform content performance metrics",
      template: "cross_platform",
      isDefault: true,
      createdBy: demoUser.id,
    })
    .run();

  const kpiIds = Array.from({ length: 4 }, () => crypto.randomUUID());
  db.insert(schema.kpiConfigs)
    .values([
      { id: kpiIds[0], dashboardId, orgId: demoOrg.id, name: "Total Views", metricType: "views", source: "youtube", targetValue: 50000, comparison: "wow", vizType: "number" },
      { id: kpiIds[1], dashboardId, orgId: demoOrg.id, name: "Engagement Rate", metricType: "engagement_rate", source: "youtube", targetValue: 5.0, comparison: "wow", vizType: "number" },
      { id: kpiIds[2], dashboardId, orgId: demoOrg.id, name: "Watch Time (hrs)", metricType: "watch_time", source: "youtube", targetValue: 1500, comparison: "mom", vizType: "line" },
      { id: kpiIds[3], dashboardId, orgId: demoOrg.id, name: "New Subscribers", metricType: "subscribers", source: "youtube", targetValue: 1000, comparison: "wow", vizType: "bar" },
    ])
    .run();
  console.log("  Dashboard + KPIs created");

  // ── Sample Time Series (last 30 days for Total Views) ──
  const tsRows = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    tsRows.push({
      kpiId: kpiIds[0],
      orgId: demoOrg.id,
      timestamp: d.toISOString(),
      value: Math.round(1200 + Math.random() * 600 + (30 - i) * 15),
    });
  }
  db.insert(schema.timeSeries).values(tsRows).run();
  console.log("  Time series data created");

  // ── Sample Alert ──
  db.insert(schema.alerts)
    .values({
      orgId: demoOrg.id,
      kpiId: kpiIds[0],
      name: "Views drop alert",
      ruleType: "threshold",
      thresholdConfig: JSON.stringify({ operator: "lt", value: 800, window_minutes: 1440 }),
      severity: "warning",
      channels: JSON.stringify(["in_app", "email"]),
      isActive: true,
    })
    .run();
  console.log("  Sample alert created");

  console.log("\nSeed complete! Demo login:");
  console.log("  Email: demo@contentops.ai");
  console.log("  Password: password123");
}

seed().catch(console.error);

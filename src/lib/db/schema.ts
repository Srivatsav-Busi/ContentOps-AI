import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import crypto from "crypto";

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ════════════════════════════════════════════════════════════════════════════
//  SYSTEM TABLES
// ════════════════════════════════════════════════════════════════════════════

export const billingPlans = sqliteTable("billing_plans", {
  id: text("id").primaryKey().$defaultFn(uid),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  priceMonthly: real("price_monthly").notNull(),
  priceYearly: real("price_yearly").notNull(),
  limitsJson: text("limits_json"),
  features: text("features"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    orgId: text("org_id").notNull(),
    userId: text("user_id"),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    changesJson: text("changes_json"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    timestamp: text("timestamp").$defaultFn(now).notNull(),
  },
  (table) => [
    index("audit_logs_org_id_idx").on(table.orgId),
    index("audit_logs_timestamp_idx").on(table.timestamp),
  ]
);

export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    orgId: text("org_id").notNull(),
    eventType: text("event_type").notNull(),
    quantity: real("quantity").notNull(),
    unit: text("unit").notNull(),
    metadata: text("metadata"),
    timestamp: text("timestamp").$defaultFn(now).notNull(),
  },
  (table) => [
    index("usage_events_org_id_idx").on(table.orgId),
    index("usage_events_timestamp_idx").on(table.timestamp),
  ]
);

// ════════════════════════════════════════════════════════════════════════════
//  CORE TENANT TABLES
// ════════════════════════════════════════════════════════════════════════════

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey().$defaultFn(uid),
  name: text("name").notNull().unique(),
  permissions: text("permissions").notNull().default("[]"),
});

export const orgs = sqliteTable("orgs", {
  id: text("id").primaryKey().$defaultFn(uid),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  planId: text("plan_id").references(() => billingPlans.id, { onDelete: "set null" }),
  settings: text("settings").default("{}"),
  region: text("region"),
  logoUrl: text("logo_url"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
  updatedAt: text("updated_at").$defaultFn(now).notNull(),
});

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    roleId: text("role_id").references(() => roles.id, { onDelete: "set null" }),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").$defaultFn(now).notNull(),
    updatedAt: text("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [
    uniqueIndex("users_org_email_uniq").on(table.orgId, table.email),
    index("users_email_idx").on(table.email),
  ]
);

// ════════════════════════════════════════════════════════════════════════════
//  VIDEO & EDITING TABLES
// ════════════════════════════════════════════════════════════════════════════

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    template: text("template"),
    status: text("status").default("active").notNull(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").$defaultFn(now).notNull(),
    updatedAt: text("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [
    index("projects_org_id_idx").on(table.orgId),
    index("projects_status_idx").on(table.status),
  ]
);

export const videoAssets = sqliteTable(
  "video_assets",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    durationMs: integer("duration_ms"),
    resolution: text("resolution"),
    codec: text("codec"),
    sizeBytes: integer("size_bytes"),
    thumbnailUrl: text("thumbnail_url"),
    status: text("status").default("uploading").notNull(),
    createdAt: text("created_at").$defaultFn(now).notNull(),
  },
  (table) => [
    index("video_assets_project_id_idx").on(table.projectId),
    index("video_assets_org_id_idx").on(table.orgId),
  ]
);

export const transcripts = sqliteTable("transcripts", {
  id: text("id").primaryKey().$defaultFn(uid),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => videoAssets.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  language: text("language").default("en").notNull(),
  fullText: text("full_text"),
  srtUrl: text("srt_url"),
  vttUrl: text("vtt_url"),
  segments: text("segments").default("[]"),
  overallConfidence: real("overall_confidence"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

export const scenes = sqliteTable(
  "scenes",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    assetId: text("asset_id")
      .notNull()
      .references(() => videoAssets.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    startMs: integer("start_ms").notNull(),
    endMs: integer("end_ms").notNull(),
    label: text("label"),
    confidence: real("confidence"),
    thumbnailUrl: text("thumbnail_url"),
    transcriptText: text("transcript_text"),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    index("scenes_asset_id_idx").on(table.assetId),
    index("scenes_order_idx").on(table.assetId, table.orderIndex),
  ]
);

export const editPlans = sqliteTable("edit_plans", {
  id: text("id").primaryKey().$defaultFn(uid),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sceneIds: text("scene_ids").default("[]"),
  transitions: text("transitions").default("[]"),
  captions: text("captions"),
  overlays: text("overlays").default("[]"),
  musicTrack: text("music_track"),
  status: text("status").default("draft").notNull(),
  approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").$defaultFn(now).notNull(),
  updatedAt: text("updated_at").$defaultFn(now).notNull(),
});

export const renderJobs = sqliteTable(
  "render_jobs",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    editPlanId: text("edit_plan_id")
      .notNull()
      .references(() => editPlans.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    format: text("format").notNull(),
    resolution: text("resolution").notNull(),
    aspectRatio: text("aspect_ratio"),
    status: text("status").default("queued").notNull(),
    progressPct: integer("progress_pct").default(0),
    workerId: text("worker_id"),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0).notNull(),
    createdAt: text("created_at").$defaultFn(now).notNull(),
  },
  (table) => [
    index("render_jobs_edit_plan_id_idx").on(table.editPlanId),
    index("render_jobs_status_idx").on(table.status),
  ]
);

export const exports_ = sqliteTable("exports", {
  id: text("id").primaryKey().$defaultFn(uid),
  renderJobId: text("render_job_id")
    .notNull()
    .unique()
    .references(() => renderJobs.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  publicUrl: text("public_url"),
  format: text("format").notNull(),
  sizeBytes: integer("size_bytes"),
  durationMs: integer("duration_ms"),
  downloadCount: integer("download_count").default(0).notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

// ════════════════════════════════════════════════════════════════════════════
//  SEO & PUBLISHING TABLES
// ════════════════════════════════════════════════════════════════════════════

export const seoBriefs = sqliteTable("seo_briefs", {
  id: text("id").primaryKey().$defaultFn(uid),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  chapters: text("chapters").default("[]"),
  thumbnailText: text("thumbnail_text"),
  targetAudience: text("target_audience"),
  platform: text("platform"),
  version: integer("version").default(1).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

export const keywords = sqliteTable("keywords", {
  id: text("id").primaryKey().$defaultFn(uid),
  briefId: text("brief_id")
    .notNull()
    .references(() => seoBriefs.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume"),
  difficulty: real("difficulty"),
  intent: text("intent"),
  rank: integer("rank"),
});

export const hashtags = sqliteTable("hashtags", {
  id: text("id").primaryKey().$defaultFn(uid),
  briefId: text("brief_id")
    .notNull()
    .references(() => seoBriefs.id, { onDelete: "cascade" }),
  hashtag: text("hashtag").notNull(),
  platform: text("platform"),
  rank: integer("rank"),
});

export const socialAccounts = sqliteTable(
  "social_accounts",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUid: text("provider_uid").notNull(),
    displayName: text("display_name"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: text("token_expires_at"),
    scopes: text("scopes"),
    status: text("status").default("active").notNull(),
    connectedBy: text("connected_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").$defaultFn(now).notNull(),
  },
  (table) => [
    uniqueIndex("social_accounts_org_provider_uid_uniq").on(
      table.orgId,
      table.provider,
      table.providerUid
    ),
  ]
);

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(uid),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").default("draft").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").$defaultFn(now).notNull(),
  updatedAt: text("updated_at").$defaultFn(now).notNull(),
});

export const scheduledPosts = sqliteTable(
  "scheduled_posts",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    exportId: text("export_id").references(() => exports_.id, { onDelete: "set null" }),
    accountId: text("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    scheduledAt: text("scheduled_at").notNull(),
    timezone: text("timezone").default("UTC").notNull(),
    title: text("title"),
    description: text("description"),
    hashtags: text("hashtags"),
    status: text("status").default("draft").notNull(),
    approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").$defaultFn(now).notNull(),
  },
  (table) => [
    index("scheduled_posts_campaign_id_idx").on(table.campaignId),
    index("scheduled_posts_status_idx").on(table.status),
  ]
);

export const publishEvents = sqliteTable("publish_events", {
  id: text("id").primaryKey().$defaultFn(uid),
  postId: text("post_id")
    .notNull()
    .references(() => scheduledPosts.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  platformPostId: text("platform_post_id"),
  status: text("status").notNull(),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0).notNull(),
  publishedAt: text("published_at"),
  platformUrl: text("platform_url"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

// ════════════════════════════════════════════════════════════════════════════
//  ANALYTICS & KPI TABLES
// ════════════════════════════════════════════════════════════════════════════

export const dashboards = sqliteTable("dashboards", {
  id: text("id").primaryKey().$defaultFn(uid),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template"),
  layoutJson: text("layout_json"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").$defaultFn(now).notNull(),
  updatedAt: text("updated_at").$defaultFn(now).notNull(),
});

export const kpiConfigs = sqliteTable("kpi_configs", {
  id: text("id").primaryKey().$defaultFn(uid),
  dashboardId: text("dashboard_id")
    .notNull()
    .references(() => dashboards.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  metricType: text("metric_type").notNull(),
  source: text("source"),
  queryConfig: text("query_config"),
  targetValue: real("target_value"),
  comparison: text("comparison"),
  vizType: text("viz_type"),
  positionJson: text("position_json"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

export const timeSeries = sqliteTable(
  "time_series",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    kpiId: text("kpi_id")
      .notNull()
      .references(() => kpiConfigs.id, { onDelete: "cascade" }),
    timestamp: text("timestamp").notNull(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    value: real("value").notNull(),
    metadata: text("metadata"),
  },
  (table) => [
    uniqueIndex("time_series_kpi_ts_uniq").on(table.kpiId, table.timestamp),
    index("time_series_org_id_idx").on(table.orgId),
  ]
);

export const anomalies = sqliteTable("anomalies", {
  id: text("id").primaryKey().$defaultFn(uid),
  kpiId: text("kpi_id")
    .notNull()
    .references(() => kpiConfigs.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  detectedAt: text("detected_at").$defaultFn(now).notNull(),
  severity: text("severity").notNull(),
  actualValue: real("actual_value").notNull(),
  expectedValue: real("expected_value").notNull(),
  deviationPct: real("deviation_pct").notNull(),
  explanation: text("explanation"),
  status: text("status").default("open").notNull(),
  resolvedAt: text("resolved_at"),
  resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey().$defaultFn(uid),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  kpiId: text("kpi_id").references(() => kpiConfigs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ruleType: text("rule_type").notNull(),
  thresholdConfig: text("threshold_config").notNull(),
  severity: text("severity").default("warning").notNull(),
  channels: text("channels"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  lastFiredAt: text("last_fired_at"),
  cooldownMinutes: integer("cooldown_minutes").default(60).notNull(),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(uid),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  dashboardId: text("dashboard_id").references(() => dashboards.id, { onDelete: "set null" }),
  frequency: text("frequency").notNull(),
  recipients: text("recipients").notNull(),
  format: text("format").default("pdf").notNull(),
  aiSummary: text("ai_summary"),
  pdfUrl: text("pdf_url"),
  sentAt: text("sent_at"),
  openedCount: integer("opened_count").default(0).notNull(),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  createdAt: text("created_at").$defaultFn(now).notNull(),
});

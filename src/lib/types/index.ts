// ============================================
// Core Types for ContentOps AI
// ============================================

export type Role = "owner" | "admin" | "editor" | "viewer" | "billing";

export interface UserProfile {
  id: string;
  orgId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: Role;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface OrgProfile {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planTier: "free" | "pro" | "enterprise";
  logoUrl?: string;
  settings: Record<string, unknown>;
  region: string;
  createdAt: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  template?: string;
  status: "active" | "archived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assetCount?: number;
  thumbnailUrl?: string;
}

export interface VideoAsset {
  id: string;
  projectId: string;
  orgId: string;
  filename: string;
  storageKey: string;
  mimeType?: string;
  durationMs?: number;
  resolution?: string;
  codec?: string;
  sizeBytes?: number;
  thumbnailUrl?: string;
  status: "uploading" | "processing" | "ready" | "error";
  createdAt: string;
}

export interface Transcript {
  id: string;
  assetId: string;
  language: string;
  fullText?: string;
  srtUrl?: string;
  vttUrl?: string;
  segments?: TranscriptSegment[];
  overallConfidence?: number;
  createdAt: string;
}

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
}

export interface Scene {
  id: string;
  assetId: string;
  startMs: number;
  endMs: number;
  label?: string;
  confidence: number;
  thumbnailUrl?: string;
  transcriptText?: string;
  orderIndex: number;
}

export interface EditPlan {
  id: string;
  projectId: string;
  name: string;
  sceneIds: string[];
  transitions?: Transition[];
  captions?: CaptionConfig;
  overlays?: Overlay[];
  musicTrack?: MusicTrack;
  status: "draft" | "pending_review" | "approved" | "rejected";
  approvedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transition {
  type: string;
  durationMs: number;
  position: number;
}

export interface CaptionConfig {
  style: string;
  font: string;
  color: string;
  position: string;
}

export interface Overlay {
  type: string;
  url: string;
  position: string;
  duration: number;
}

export interface MusicTrack {
  url: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface RenderJob {
  id: string;
  editPlanId: string;
  orgId: string;
  format: string;
  resolution: string;
  aspectRatio?: string;
  status: "queued" | "processing" | "completed" | "failed";
  progressPct: number;
  workerId?: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export interface Export {
  id: string;
  renderJobId: string;
  orgId: string;
  storageKey: string;
  publicUrl?: string;
  format: string;
  sizeBytes?: number;
  durationMs?: number;
  downloadCount: number;
  expiresAt?: string;
  createdAt: string;
}

export interface SEOBrief {
  id: string;
  projectId: string;
  title?: string;
  description?: string;
  chapters?: { time: string; title: string }[];
  thumbnailText?: string;
  targetAudience?: string;
  platform: "youtube" | "instagram" | "both";
  version: number;
  keywords?: Keyword[];
  hashtags?: Hashtag[];
  altText?: string;
  onScreenText?: string[];
  engagementHook?: string;
  createdBy: string;
  createdAt: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent?: string;
  rank?: number;
}

export interface Hashtag {
  id: string;
  hashtag: string;
  platform?: string;
  rank?: number;
}

export interface Campaign {
  id: string;
  projectId: string;
  orgId: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  postCount?: number;
}

export interface ScheduledPost {
  id: string;
  campaignId: string;
  exportId: string;
  accountId: string;
  platform: "youtube" | "instagram";
  scheduledAt: string;
  timezone: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  status: "scheduled" | "publishing" | "published" | "failed" | "cancelled";
  approvedBy?: string;
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  orgId: string;
  provider: "youtube" | "instagram";
  displayName?: string;
  status: "active" | "expired" | "revoked";
  connectedBy: string;
  createdAt: string;
}

export interface Dashboard {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  template?: string;
  layoutJson?: Record<string, unknown>;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIConfig {
  id: string;
  dashboardId: string;
  name: string;
  metricType: string;
  source: string;
  queryConfig: Record<string, unknown>;
  targetValue?: number;
  comparison: "wow" | "mom" | "yoy";
  vizType: "line" | "bar" | "number" | "gauge" | "sparkline";
  positionJson?: { x: number; y: number; w: number; h: number };
  createdAt: string;
}

export interface Anomaly {
  id: string;
  kpiId: string;
  detectedAt: string;
  severity: "info" | "warning" | "critical";
  actualValue: number;
  expectedValue: number;
  deviationPct: number;
  explanation?: string;
  status: "open" | "acknowledged" | "resolved";
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Alert {
  id: string;
  orgId: string;
  kpiId?: string;
  name: string;
  ruleType: "threshold" | "anomaly" | "trend";
  thresholdConfig?: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
  channels: string[];
  isActive: boolean;
  lastFiredAt?: string;
  cooldownMinutes: number;
  createdAt: string;
}

export interface Report {
  id: string;
  orgId: string;
  dashboardId: string;
  frequency: "weekly" | "biweekly" | "monthly";
  recipients: { email: string; channelType: string }[];
  format: string;
  aiSummary?: string;
  pdfUrl?: string;
  sentAt?: string;
  openedCount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  roles?: Role[];
  planRequired?: "pro" | "enterprise";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PaginationMeta {
  cursor?: string;
  hasMore: boolean;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  errors?: { code: string; message: string }[];
}

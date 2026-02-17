"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Upload,
  Settings,
  MoreHorizontal,
  Video,
  Play,
  Film,
  Globe,
  Megaphone,
  Hash,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Pencil,
  Loader2,
} from "lucide-react";
import type {
  VideoAsset,
  EditPlan,
  SEOBrief,
  Campaign,
} from "@/lib/types";
import {
  useAssets,
  useSeoBriefs,
  useCampaigns,
  useUploadAsset,
  useProcessAsset,
  useGenerateSEO,
} from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms?: number) {
  if (!ms) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  processing: "secondary",
  uploading: "outline",
  error: "destructive",
  approved: "default",
  pending_review: "secondary",
  draft: "outline",
  rejected: "destructive",
  active: "default",
  paused: "secondary",
  completed: "default",
};

const statusColorMap: Record<string, string> = {
  ready: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  approved: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  active: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  completed: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  processing: "bg-amber-500/90 text-white hover:bg-amber-500",
  pending_review: "bg-amber-500/90 text-white hover:bg-amber-500",
  uploading: "bg-sky-500/90 text-white hover:bg-sky-500",
  error: "",
  rejected: "",
  draft: "",
  paused: "bg-slate-500/90 text-white hover:bg-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge
      variant={statusVariantMap[status] ?? "outline"}
      className={statusColorMap[status] ?? ""}
    >
      {label}
    </Badge>
  );
}

const platformColors: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-600 border-red-200",
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  both: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

function TabLoading() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function TabError({ message }: { message?: string }) {
  return (
    <div className="p-8 text-center text-destructive">
      {message || "Failed to load data"}
    </div>
  );
}

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
      <p className="text-muted-foreground text-sm">No {label} found for this project.</p>
    </div>
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: assets, isLoading: assetsLoading, error: assetsError } = useAssets(projectId);
  const { data: seoBriefs, isLoading: seoLoading, error: seoError } = useSeoBriefs(projectId);
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useCampaigns(projectId);
  const uploadAsset = useUploadAsset();
  const processAsset = useProcessAsset();
  const generateSEO = useGenerateSEO();

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAsset.mutateAsync({ file, projectId });
      toast.success(`Uploaded ${file.name}`);

      try {
        await processAsset.mutateAsync({ assetId: uploaded.id });
        toast.success("Asset processing complete");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Asset processing failed";
        toast.error(message);
        return;
      }

      try {
        await generateSEO.mutateAsync({
          projectId,
          assetId: uploaded.id,
          platform: "both",
        });
        toast.success("SEO brief generated");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "SEO generation failed";
        toast.error(message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      // Allow selecting the same file again.
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Header */}
      <PageHeader title={`Project ${projectId}`}>
        <Button
          variant="outline"
          onClick={handleUploadClick}
          disabled={
            uploadAsset.isPending ||
            processAsset.isPending ||
            generateSEO.isPending
          }
        >
          {uploadAsset.isPending || processAsset.isPending || generateSEO.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploadAsset.isPending
            ? "Uploading..."
            : processAsset.isPending
            ? "Processing..."
            : generateSEO.isPending
            ? "Generating SEO..."
            : "Upload Asset"}
        </Button>
        <Button variant="outline">
          <Settings className="size-4" />
          Settings
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="size-4" />
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate Project</DropdownMenuItem>
            <DropdownMenuItem>Export All</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Archive Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="flex items-center gap-2">
        <StatusBadge status="active" />
        <span className="text-muted-foreground text-sm">
          {(assets || []).length} assets
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets">
        <TabsList variant="line" className="border-b">
          <TabsTrigger value="assets" className="gap-1.5">
            <Video className="size-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5">
            <Globe className="size-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Megaphone className="size-4" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="pt-6">
          {assetsLoading ? (
            <TabLoading />
          ) : assetsError ? (
            <TabError message="Failed to load assets" />
          ) : (assets || []).length === 0 ? (
            <TabEmpty label="assets" />
          ) : (
            <AssetsGrid assets={assets || []} />
          )}
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="pt-6">
          {seoLoading ? (
            <TabLoading />
          ) : seoError ? (
            <TabError message="Failed to load SEO briefs" />
          ) : (seoBriefs || []).length === 0 ? (
            <TabEmpty label="SEO briefs" />
          ) : (
            <SEOBriefsList briefs={seoBriefs || []} />
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="pt-6">
          {campaignsLoading ? (
            <TabLoading />
          ) : campaignsError ? (
            <TabError message="Failed to load campaigns" />
          ) : (campaigns || []).length === 0 ? (
            <TabEmpty label="campaigns" />
          ) : (
            <CampaignsTable campaigns={campaigns || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Assets Grid ──────────────────────────────────────────────────────────────

function AssetsGrid({ assets }: { assets: VideoAsset[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          className="group cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:shadow-md hover:ring-1 hover:ring-indigo-500/20"
        >
          <div className="bg-muted relative aspect-video w-full overflow-hidden">
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-500/5 to-purple-500/10">
              <Play className="text-muted-foreground/40 size-8 transition-transform group-hover:scale-110" />
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {formatDuration(asset.durationMs)}
            </div>
            <div className="absolute left-2 top-2">
              <StatusBadge status={asset.status} />
            </div>
          </div>
          <CardContent className="space-y-1 px-4 py-3">
            <p className="truncate text-sm font-medium">{asset.filename}</p>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{asset.resolution}</span>
              <span>&middot;</span>
              <span>{formatBytes(asset.sizeBytes)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── SEO Briefs List ──────────────────────────────────────────────────────────

function SEOBriefsList({ briefs }: { briefs: SEOBrief[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {briefs.map((brief) => (
        <Card
          key={brief.id}
          className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-indigo-500/20"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-snug">
                  {brief.title}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={platformColors[brief.platform] ?? ""}
              >
                {brief.platform === "both"
                  ? "YouTube + IG"
                  : brief.platform.charAt(0).toUpperCase() +
                    brief.platform.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {brief.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {brief.keywords?.map((kw) => (
                <span
                  key={kw.id}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  <Hash className="size-3" />
                  {kw.keyword}
                </span>
              ))}
            </div>

            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <FileText className="size-3" />
                v{brief.version}
              </span>
              <span>{brief.keywords?.length ?? 0} keywords</span>
              <span>{brief.hashtags?.length ?? 0} hashtags</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Campaigns Table ──────────────────────────────────────────────────────────

function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead className="text-center">Posts</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id} className="cursor-pointer">
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-center">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-600">
                  {c.postCount ?? 0}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {c.startDate ? formatDate(c.startDate) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {c.endDate ? formatDate(c.endDate) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(c.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

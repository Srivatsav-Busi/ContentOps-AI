"use client";

import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  Zap,
} from "lucide-react";
import type { RenderJob } from "@/lib/types";
import { useRenderJobs } from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  RenderJob["status"],
  { label: string; icon: React.ElementType; color: string; badgeClass: string }
> = {
  queued: {
    label: "Queued",
    icon: Clock,
    color: "text-slate-500",
    badgeClass: "",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-amber-500",
    badgeClass: "bg-amber-500/90 text-white hover:bg-amber-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-500",
    badgeClass: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-500",
    badgeClass: "",
  },
};

function formatDuration(start?: string, end?: string) {
  if (!start) return "—";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diffSec = Math.floor((e - s) / 1000);
  const m = Math.floor(diffSec / 60);
  const sec = diffSec % 60;
  return `${m}m ${sec}s`;
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function RenderQueuePage() {
  const { data: renderJobs, isLoading, error } = useRenderJobs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load render jobs
      </div>
    );
  }

  const jobs: RenderJob[] = renderJobs || [];

  const queued = jobs.filter((j) => j.status === "queued");
  const active = jobs.filter((j) => j.status === "processing");
  const completed = jobs.filter(
    (j) => j.status === "completed" || j.status === "failed"
  );

  const summaryCards = [
    {
      label: "Queued",
      count: queued.length,
      icon: Clock,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    },
    {
      label: "Active",
      count: active.length,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Completed",
      count: completed.length,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Render Queue" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.label}
              </CardTitle>
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${card.bg}`}
              >
                <card.icon className={`size-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Render Jobs Table */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground text-sm">No render jobs found.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Edit Plan</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead className="min-w-[200px]">Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const config = statusConfig[job.status];
                const StatusIcon = config.icon;

                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {job.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {job.editPlanId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.format}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {job.resolution}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`size-4 ${config.color} ${
                              job.status === "processing" ? "animate-spin" : ""
                            }`}
                          />
                          <Badge
                            variant={
                              job.status === "failed"
                                ? "destructive"
                                : job.status === "queued"
                                ? "outline"
                                : "default"
                            }
                            className={config.badgeClass}
                          >
                            {config.label}
                          </Badge>
                          {job.status === "processing" && (
                            <span className="text-muted-foreground text-xs">
                              {job.progressPct}%
                            </span>
                          )}
                        </div>
                        {(job.status === "processing" ||
                          job.status === "failed") && (
                          <Progress
                            value={job.progressPct}
                            className="h-1.5"
                          />
                        )}
                        {job.status === "failed" && job.errorMessage && (
                          <p className="text-xs text-red-500">
                            {job.errorMessage}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {job.status === "failed" && (
                          <Button variant="ghost" size="xs">
                            <RotateCcw className="size-3" />
                            Retry
                          </Button>
                        )}
                        {(job.status === "queued" ||
                          job.status === "processing") && (
                          <Button variant="ghost" size="xs">
                            <Ban className="size-3" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

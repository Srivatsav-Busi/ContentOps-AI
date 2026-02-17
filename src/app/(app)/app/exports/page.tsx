"use client";

import {
  Download,
  Share2,
  Trash2,
  FileVideo,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import type { Export } from "@/lib/types";
import { useExports } from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const formatBadgeColors: Record<string, string> = {
  MP4: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  MOV: "bg-purple-500/10 text-purple-600 border-purple-200",
  WEBM: "bg-teal-500/10 text-teal-600 border-teal-200",
};

// ── Page Component ───────────────────────────────────────────────────────────

export default function ExportsPage() {
  const { data: exports, isLoading, error } = useExports();

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
        Failed to load exports
      </div>
    );
  }

  const allExports = exports || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Exports" description="All rendered and exported video files ready for download or sharing." />

      {allExports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <FileVideo className="text-muted-foreground size-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No exports yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Exported videos will appear here once your render jobs complete.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allExports.map((exp: any) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <FileVideo className="text-indigo-500 size-4" />
                      </div>
                      <span className="truncate font-medium">
                        {exp.filename || exp.storageKey || exp.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={formatBadgeColors[exp.format] ?? ""}
                    >
                      {exp.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {exp.resolution || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatBytes(exp.sizeBytes)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-600">
                      {exp.downloadCount ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(exp.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm">
                        <Download className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Share2 className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="size-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="size-4" />
                            Copy Share Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

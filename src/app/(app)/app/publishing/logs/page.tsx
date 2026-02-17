"use client";

import { useState } from "react";
import {
  Video,
  Camera,
  MoreHorizontal,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PublishLog {
  id: string;
  title: string;
  platform: "youtube" | "instagram";
  account: string;
  status: "published" | "failed" | "cancelled";
  publishedAt: string;
  platformUrl?: string;
  errorMessage?: string;
}

const mockLogs: PublishLog[] = [
  {
    id: "log-1",
    title: "Product Launch Reel",
    platform: "instagram",
    account: "@contentops",
    status: "published",
    publishedAt: "2026-02-14T10:02:15Z",
    platformUrl: "https://instagram.com/p/abc123",
  },
  {
    id: "log-2",
    title: "Weekly Tutorial #12",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "published",
    publishedAt: "2026-02-14T14:01:30Z",
    platformUrl: "https://youtube.com/watch?v=xyz456",
  },
  {
    id: "log-3",
    title: "Behind the Scenes",
    platform: "instagram",
    account: "@contentops",
    status: "published",
    publishedAt: "2026-02-12T09:33:45Z",
    platformUrl: "https://instagram.com/p/def789",
  },
  {
    id: "log-4",
    title: "Tips & Tricks Carousel",
    platform: "instagram",
    account: "@contentops",
    status: "failed",
    publishedAt: "2026-02-13T18:00:12Z",
    errorMessage: "API rate limit exceeded",
  },
  {
    id: "log-5",
    title: "Deep Dive: SEO for Video",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "published",
    publishedAt: "2026-02-10T16:05:00Z",
    platformUrl: "https://youtube.com/watch?v=seo123",
  },
  {
    id: "log-6",
    title: "Q1 Campaign Preview",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "cancelled",
    publishedAt: "2026-02-09T11:00:00Z",
  },
];

const platformConfig = {
  youtube: {
    icon: Video,
    label: "YouTube",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  instagram: {
    icon: Camera,
    label: "Instagram",
    className: "bg-pink-500/10 text-pink-600 border-pink-200",
  },
};

const statusConfig: Record<PublishLog["status"], { label: string; className: string }> = {
  published: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PublishLogsPage() {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = mockLogs.filter((log) => {
    const matchesPlatform = platformFilter === "all" || log.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(log.publishedAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(log.publishedAt) <= new Date(dateTo + "T23:59:59Z");
    }
    return matchesPlatform && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Publish Logs" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
            placeholder="From"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
            placeholder="To"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Post Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead>Platform URL</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No logs match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => {
                const platform = platformConfig[log.platform];
                const status = statusConfig[log.status];
                const PlatformIcon = platform.icon;

                return (
                  <TableRow key={log.id}>
                    <TableCell className="pl-4">
                      <div>
                        <p className="font-medium">{log.title}</p>
                        {log.errorMessage && (
                          <p className="mt-0.5 text-xs text-red-600">
                            {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={platform.className}>
                        <PlatformIcon className="size-3" />
                        {platform.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.account}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.publishedAt)}
                    </TableCell>
                    <TableCell>
                      {log.platformUrl ? (
                        <a
                          href={log.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 transition-colors hover:text-indigo-800 hover:underline"
                        >
                          <ExternalLink className="size-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="size-4" />
                            View Details
                          </DropdownMenuItem>
                          {log.status === "failed" && (
                            <DropdownMenuItem>
                              <RotateCcw className="size-4" />
                              Retry
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="size-4" />
                            Export Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

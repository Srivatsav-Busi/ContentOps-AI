"use client";

import { useState } from "react";
import {
  Video,
  Camera,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
} from "lucide-react";
import type { ScheduledPost } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface QueueItem {
  id: string;
  title: string;
  platform: "youtube" | "instagram";
  account: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  scheduledAt: string;
  errorMessage?: string;
}

const mockQueue: QueueItem[] = [
  {
    id: "q-1",
    title: "Product Launch Reel",
    platform: "instagram",
    account: "@contentops",
    status: "completed",
    scheduledAt: "2026-02-14T10:00:00Z",
  },
  {
    id: "q-2",
    title: "Weekly Tutorial #12",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "completed",
    scheduledAt: "2026-02-14T14:00:00Z",
  },
  {
    id: "q-3",
    title: "Behind the Scenes",
    platform: "instagram",
    account: "@contentops",
    status: "in_progress",
    scheduledAt: "2026-02-16T09:30:00Z",
  },
  {
    id: "q-4",
    title: "Deep Dive: Analytics",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "pending",
    scheduledAt: "2026-02-18T16:00:00Z",
  },
  {
    id: "q-5",
    title: "Customer Story: Acme",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "pending",
    scheduledAt: "2026-02-20T11:00:00Z",
  },
  {
    id: "q-6",
    title: "Tips & Tricks Carousel",
    platform: "instagram",
    account: "@contentops",
    status: "failed",
    scheduledAt: "2026-02-13T18:00:00Z",
    errorMessage: "API rate limit exceeded. Please retry.",
  },
  {
    id: "q-7",
    title: "Feature Announcement",
    platform: "instagram",
    account: "@contentops",
    status: "pending",
    scheduledAt: "2026-02-22T12:00:00Z",
  },
  {
    id: "q-8",
    title: "Webinar: Content Strategy",
    platform: "youtube",
    account: "ContentOps Channel",
    status: "pending",
    scheduledAt: "2026-02-25T15:00:00Z",
  },
];

const statusConfig: Record<
  QueueItem["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 border-red-200",
  },
};

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PublishQueuePage() {
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all" ? mockQueue : mockQueue.filter((item) => item.status === tab);

  const counts = {
    all: mockQueue.length,
    pending: mockQueue.filter((i) => i.status === "pending").length,
    in_progress: mockQueue.filter((i) => i.status === "in_progress").length,
    completed: mockQueue.filter((i) => i.status === "completed").length,
    failed: mockQueue.filter((i) => i.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Publish Queue" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Post Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled At</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      No posts found in this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const platform = platformConfig[item.platform];
                    const status = statusConfig[item.status];
                    const PlatformIcon = platform.icon;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="pl-4">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.errorMessage && (
                              <p className="mt-0.5 text-xs text-red-600">
                                {item.errorMessage}
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
                          {item.account}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {item.status === "in_progress" && (
                              <span className="relative mr-1 flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
                              </span>
                            )}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.scheduledAt)}
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
                              {item.status === "pending" && (
                                <DropdownMenuItem>
                                  <Play className="size-4" />
                                  Publish Now
                                </DropdownMenuItem>
                              )}
                              {item.status === "in_progress" && (
                                <DropdownMenuItem>
                                  <Pause className="size-4" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {item.status === "failed" && (
                                <DropdownMenuItem>
                                  <RotateCcw className="size-4" />
                                  Retry
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">
                                <Trash2 className="size-4" />
                                Remove
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

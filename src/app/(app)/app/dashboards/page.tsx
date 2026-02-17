"use client";

import Link from "next/link";
import {
  Plus,
  BarChart3,
  MoreHorizontal,
  Star,
  Copy,
  Pencil,
  Trash2,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import type { Dashboard } from "@/lib/types";
import { useDashboards, useCreateDashboard } from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const templateColors: Record<string, string> = {
  youtube: "from-red-500/10 to-red-500/5",
  instagram: "from-pink-500/10 to-purple-500/5",
  overview: "from-indigo-500/10 to-blue-500/5",
};

export default function DashboardsPage() {
  const { data: dashboards, isLoading, error } = useDashboards();
  const createDashboard = useCreateDashboard();

  function handleCreateDashboard() {
    createDashboard.mutate({ name: `New Dashboard ${Date.now()}` });
  }

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
        Failed to load dashboards
      </div>
    );
  }

  const allDashboards = dashboards || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboards"
        actions={
          <Button onClick={handleCreateDashboard} disabled={createDashboard.isPending}>
            {createDashboard.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            New Dashboard
          </Button>
        }
      />

      {allDashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <LayoutDashboard className="text-muted-foreground size-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No dashboards yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Create your first dashboard to track KPIs and content performance.
          </p>
          <Button onClick={handleCreateDashboard}>
            <Plus className="size-4" />
            New Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allDashboards.map((dashboard: any) => (
            <Link key={dashboard.id} href={`/app/dashboards/${dashboard.id}`}>
              <Card className="group cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:shadow-md hover:ring-1 hover:ring-indigo-500/20">
                {/* Top gradient band */}
                <div
                  className={`h-2 bg-gradient-to-r ${
                    templateColors[dashboard.template ?? "overview"]
                  }`}
                />

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
                        <LayoutDashboard className="size-4 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          {dashboard.name}
                          {dashboard.isDefault && (
                            <Badge variant="secondary" className="text-[10px]">
                              <Star className="size-2.5" />
                              Default
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <BarChart3 className="size-3.5 text-indigo-500" />
                      <span className="font-medium">{dashboard.kpiCount ?? 0}</span>
                      <span className="text-muted-foreground text-xs">KPIs</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pb-4 pt-3">
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(dashboard.lastUpdated || dashboard.updatedAt || dashboard.createdAt)}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

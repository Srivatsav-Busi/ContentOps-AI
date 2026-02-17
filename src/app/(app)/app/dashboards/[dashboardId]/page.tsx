"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Users,
  Heart,
  Pencil,
  Plus,
  Share2,
  AlertTriangle,
  X,
  BarChart3,
  LineChart,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface KPIData {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const kpis: KPIData[] = [
  {
    id: "kpi-1",
    label: "Total Views",
    value: "42,300",
    change: 12.5,
    trend: "up",
    icon: Eye,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "kpi-2",
    label: "Engagement Rate",
    value: "4.2%",
    change: 2.1,
    trend: "down",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "kpi-3",
    label: "Watch Time",
    value: "1,234 hrs",
    change: 8.3,
    trend: "up",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "kpi-4",
    label: "New Subscribers",
    value: "892",
    change: 15.7,
    trend: "up",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
];

const anomaly = {
  id: "anom-1",
  severity: "warning" as const,
  message: "Engagement rate dropped 2.1% below expected range — this may be due to reduced posting frequency last week.",
  detectedAt: "2026-02-16T08:00:00Z",
};

function formatDateRange(from: string, to: string) {
  const f = new Date(from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const t = new Date(to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${f} – ${t}`;
}

export default function DashboardDetailPage() {
  const [showAnomaly, setShowAnomaly] = useState(true);
  const [dateFrom, setDateFrom] = useState("2026-02-01");
  const [dateTo, setDateTo] = useState("2026-02-16");

  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTube Performance"
        backLink="/app/dashboards"
        subtitle="Track video views, watch time, and engagement"
        actions={
          <>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <CalendarDays className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-auto border-0 p-0 text-xs shadow-none focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-auto border-0 p-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" size="sm">
              <Pencil className="size-3.5" />
              Edit Layout
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Add KPI
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="size-3.5" />
              Share
            </Button>
          </>
        }
      />

      {/* Anomaly Banner */}
      {showAnomaly && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Anomaly Detected
              </p>
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-100 text-amber-700 text-[10px]"
              >
                Warning
              </Badge>
            </div>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {anomaly.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowAnomaly(false)}
            className="shrink-0 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isUp = kpi.trend === "up";
          return (
            <Card key={kpi.id} className="gap-0 py-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`size-5 ${kpi.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isUp
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-red-500/10 text-red-700"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {isUp ? "+" : "-"}
                    {kpi.change}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Line Chart Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <LineChart className="size-4 text-indigo-500" />
                  Views Over Time
                </CardTitle>
                <CardDescription className="text-xs">
                  {formatDateRange(dateFrom, dateTo)}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">Daily</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-1 rounded-lg bg-muted/30 p-4">
              {/* Simulated line chart using bars with varying heights */}
              {[35, 42, 38, 55, 48, 62, 58, 71, 65, 78, 72, 85, 80, 92, 88, 95].map(
                (height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all hover:from-indigo-600 hover:to-indigo-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Feb 1</span>
              <span>Feb 8</span>
              <span>Feb 16</span>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="size-4 text-indigo-500" />
                  Posts Per Platform
                </CardTitle>
                <CardDescription className="text-xs">
                  Content distribution this period
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">This Month</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-4">
              {/* YouTube bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full bg-red-500" />
                    YouTube
                  </span>
                  <span className="text-muted-foreground">18 posts</span>
                </div>
                <div className="h-8 w-full overflow-hidden rounded-lg bg-muted/50">
                  <div
                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-red-500 to-red-400 px-3 text-xs font-medium text-white transition-all"
                    style={{ width: "72%" }}
                  >
                    72%
                  </div>
                </div>
              </div>

              {/* Instagram bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full bg-pink-500" />
                    Instagram
                  </span>
                  <span className="text-muted-foreground">12 posts</span>
                </div>
                <div className="h-8 w-full overflow-hidden rounded-lg bg-muted/50">
                  <div
                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-pink-500 to-purple-400 px-3 text-xs font-medium text-white transition-all"
                    style={{ width: "48%" }}
                  >
                    48%
                  </div>
                </div>
              </div>

              {/* Combined stats */}
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div className="text-center">
                  <p className="text-lg font-bold">30</p>
                  <p className="text-xs text-muted-foreground">Total Posts</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold">4.2</p>
                  <p className="text-xs text-muted-foreground">Avg. per Day</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">+23%</p>
                  <p className="text-xs text-muted-foreground">vs Last Period</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

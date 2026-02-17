"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Bell,
  Pencil,
  Copy,
  Trash2,
  Mail,
  MessageSquare,
  Webhook,
  AlertTriangle,
  Info,
  AlertCircle,
  TrendingUp,
  Target,
  Activity,
  Loader2,
} from "lucide-react";
import type { Alert } from "@/lib/types";
import { useAlerts } from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

interface AlertRow {
  id: string;
  name: string;
  kpiName: string;
  ruleType: "threshold" | "anomaly" | "trend";
  severity: "info" | "warning" | "critical";
  channels: string[];
  isActive: boolean;
  lastFiredAt: string | null;
}

const ruleTypeConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  threshold: {
    label: "Threshold",
    icon: Target,
    className: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  anomaly: {
    label: "Anomaly",
    icon: Activity,
    className: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  trend: {
    label: "Trend",
    icon: TrendingUp,
    className: "bg-teal-500/10 text-teal-700 border-teal-200",
  },
};

const severityConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  info: {
    label: "Info",
    icon: Info,
    className: "bg-sky-500/10 text-sky-700 border-sky-200",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  critical: {
    label: "Critical",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-700 border-red-200",
  },
};

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  slack: MessageSquare,
  webhook: Webhook,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AlertsPage() {
  const { data: alertsData, isLoading, error } = useAlerts();
  const [toggledAlerts, setToggledAlerts] = useState<Record<string, boolean>>({});

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
        Failed to load alerts
      </div>
    );
  }

  const alerts: AlertRow[] = (alertsData || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    kpiName: a.kpiName ?? "—",
    ruleType: a.ruleType ?? "threshold",
    severity: a.severity ?? "info",
    channels: a.channels ?? [],
    isActive: toggledAlerts[a.id] !== undefined ? toggledAlerts[a.id] : (a.isActive ?? true),
    lastFiredAt: a.lastFiredAt ?? null,
  }));

  function toggleAlert(id: string) {
    setToggledAlerts((prev) => {
      const current = alerts.find((a) => a.id === id);
      return { ...prev, [id]: !(current?.isActive ?? true) };
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        actions={
          <Button>
            <Plus className="size-4" />
            Create Alert
          </Button>
        }
      />

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <Bell className="text-muted-foreground size-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No alerts configured</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Set up alerts to get notified about important KPI changes.
          </p>
          <Button>
            <Plus className="size-4" />
            Create Alert
          </Button>
        </div>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Alert Name</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Fired</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => {
                const ruleType = ruleTypeConfig[alert.ruleType] ?? ruleTypeConfig.threshold;
                const severity = severityConfig[alert.severity] ?? severityConfig.info;
                const RuleIcon = ruleType.icon;
                const SeverityIcon = severity.icon;

                return (
                  <TableRow key={alert.id} className={!alert.isActive ? "opacity-60" : ""}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                          <Bell className="size-4 text-indigo-600" />
                        </div>
                        <span className="font-medium">{alert.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.kpiName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ruleType.className}>
                        <RuleIcon className="size-3" />
                        {ruleType.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severity.className}>
                        <SeverityIcon className="size-3" />
                        {severity.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {(alert.channels || []).map((channel) => {
                          const Icon = channelIcons[channel];
                          return Icon ? (
                            <div
                              key={channel}
                              className="flex size-7 items-center justify-center rounded-md bg-muted"
                              title={channel}
                            >
                              <Icon className="size-3.5 text-muted-foreground" />
                            </div>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => toggleAlert(alert.id)}
                          size="sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {alert.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.lastFiredAt ? formatDate(alert.lastFiredAt) : "Never"}
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

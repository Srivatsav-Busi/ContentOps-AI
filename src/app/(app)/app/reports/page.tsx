"use client";

import {
  Plus,
  MoreHorizontal,
  FileText,
  Send,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import type { Report } from "@/lib/types";
import { useReports } from "@/lib/hooks/use-api";
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
import { Card } from "@/components/ui/card";

const statusConfig: Record<string, { label: string; className: string }> = {
  sent: {
    label: "Sent",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Draft",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 border-red-200",
  },
};

const frequencyConfig: Record<string, { label: string; className: string }> = {
  weekly: {
    label: "Weekly",
    className: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  },
  biweekly: {
    label: "Bi-Weekly",
    className: "bg-violet-500/10 text-violet-700 border-violet-200",
  },
  monthly: {
    label: "Monthly",
    className: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
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

export default function ReportsPage() {
  const { data: reportsData, isLoading, error } = useReports();

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
        Failed to load reports
      </div>
    );
  }

  const reports = reportsData || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        actions={
          <Button>
            <Plus className="size-4" />
            Configure Report
          </Button>
        }
      />

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground size-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No reports configured</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Set up automated reports to share dashboard insights with your team.
          </p>
          <Button>
            <Plus className="size-4" />
            Configure Report
          </Button>
        </div>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Report Name</TableHead>
                <TableHead>Dashboard</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: any) => {
                const status = statusConfig[report.status] ?? statusConfig.draft;
                const freq = frequencyConfig[report.frequency] ?? frequencyConfig.weekly;

                return (
                  <TableRow key={report.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                          <FileText className="size-4 text-indigo-600" />
                        </div>
                        <span className="font-medium">{report.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.dashboardName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={freq.className}>
                        {freq.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(report.recipients || []).map((r: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="max-w-[160px] truncate text-[10px]"
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {report.status === "sent" && <Send className="size-2.5" />}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.sentAt ? formatDate(report.sentAt) : "—"}
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
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="size-4" />
                            Send Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="size-4" />
                            Download PDF
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

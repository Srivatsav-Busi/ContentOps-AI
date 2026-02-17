"use client";

import { useState } from "react";
import {
  Download,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Shield,
  Settings,
  Upload,
  Trash2,
  UserPlus,
  LogIn,
  Key,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  actionType: "auth" | "settings" | "content" | "team" | "api" | "security";
  resource: string;
  details: string;
  ipAddress: string;
}

const actionIcons: Record<string, typeof Shield> = {
  auth: LogIn,
  settings: Settings,
  content: Upload,
  team: UserPlus,
  api: Key,
  security: Shield,
};

const actionColors: Record<string, string> = {
  auth: "bg-blue-500/10 text-blue-600",
  settings: "bg-purple-500/10 text-purple-600",
  content: "bg-teal-500/10 text-teal-600",
  team: "bg-indigo-500/10 text-indigo-600",
  api: "bg-amber-500/10 text-amber-600",
  security: "bg-red-500/10 text-red-600",
};

const mockAuditEntries: AuditEntry[] = [
  {
    id: "al-1",
    timestamp: "2026-02-16T09:45:23Z",
    user: "Alex Morgan",
    action: "Updated organization settings",
    actionType: "settings",
    resource: "Organization: ContentOps Studio",
    details: "Changed default timezone from UTC to America/New_York. Updated organization name.",
    ipAddress: "192.168.1.42",
  },
  {
    id: "al-2",
    timestamp: "2026-02-16T08:30:11Z",
    user: "Jordan Lee",
    action: "Uploaded video asset",
    actionType: "content",
    resource: "Video: hero-reel-final.mp4",
    details: "Uploaded 156MB video file. Resolution: 1920x1080. Duration: 2:08.",
    ipAddress: "10.0.0.15",
  },
  {
    id: "al-3",
    timestamp: "2026-02-15T17:22:05Z",
    user: "Alex Morgan",
    action: "Invited team member",
    actionType: "team",
    resource: "Invite: freelancer@agency.com",
    details: "Sent invitation with Editor role. Expires in 7 days.",
    ipAddress: "192.168.1.42",
  },
  {
    id: "al-4",
    timestamp: "2026-02-15T14:10:00Z",
    user: "Taylor Chen",
    action: "Generated API key",
    actionType: "api",
    resource: "API Key: prod-render-***",
    details: "Created new API key with render and export scopes. No expiration set.",
    ipAddress: "172.16.0.8",
  },
  {
    id: "al-5",
    timestamp: "2026-02-15T11:05:44Z",
    user: "System",
    action: "Security alert triggered",
    actionType: "security",
    resource: "Alert: Unusual login location",
    details: "Login detected from new location: Berlin, DE. User: sam.patel@contentops.ai. MFA verified.",
    ipAddress: "85.214.132.117",
  },
  {
    id: "al-6",
    timestamp: "2026-02-14T22:18:33Z",
    user: "Jordan Lee",
    action: "Deleted export",
    actionType: "content",
    resource: "Export: draft-teaser-v1.mp4",
    details: "Permanently deleted export file (42MB). Render job rj-008 still available.",
    ipAddress: "10.0.0.15",
  },
  {
    id: "al-7",
    timestamp: "2026-02-14T16:00:12Z",
    user: "Alex Morgan",
    action: "Signed in",
    actionType: "auth",
    resource: "Session: sess_abc123",
    details: "Successful login via Google OAuth. MFA: enabled. Device: MacBook Pro, Chrome 122.",
    ipAddress: "192.168.1.42",
  },
  {
    id: "al-8",
    timestamp: "2026-02-14T10:30:00Z",
    user: "Sam Patel",
    action: "Changed role",
    actionType: "team",
    resource: "User: taylor.chen@contentops.ai",
    details: "Role changed from Viewer to Editor by organization admin.",
    ipAddress: "172.16.0.22",
  },
];

function formatTimestamp(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("all");

  const filteredEntries =
    actionFilter === "all"
      ? mockAuditEntries
      : mockAuditEntries.filter((e) => e.actionType === actionFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Track all actions and changes across your organization."
        actions={
          <Button variant="outline">
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search audit log..." className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-44">
            <Filter className="size-3.5" />
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => {
              const isExpanded = expandedRow === entry.id;
              const Icon = actionIcons[entry.actionType] ?? Shield;

              return (
                <>
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedRow(isExpanded ? null : entry.id)
                    }
                  >
                    <TableCell className="w-8 pr-0">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {entry.user}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex size-6 items-center justify-center rounded ${actionColors[entry.actionType]}`}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <span className="text-sm">{entry.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {entry.resource}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.ipAddress}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${entry.id}-detail`}>
                      <TableCell />
                      <TableCell colSpan={5}>
                        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                          {entry.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

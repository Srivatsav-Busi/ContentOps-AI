"use client";

import { useState } from "react";
import {
  UserPlus,
  MoreHorizontal,
  Trash2,
  Mail,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { Role } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  joinedAt: string;
  status: "active" | "inactive";
}

interface PendingInvite {
  id: string;
  email: string;
  sentAt: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "m-1",
    name: "Alex Morgan",
    email: "alex.morgan@contentops.ai",
    role: "owner",
    joinedAt: "2025-01-10T08:00:00Z",
    status: "active",
  },
  {
    id: "m-2",
    name: "Jordan Lee",
    email: "jordan.lee@contentops.ai",
    role: "admin",
    joinedAt: "2025-03-22T14:30:00Z",
    status: "active",
  },
  {
    id: "m-3",
    name: "Taylor Chen",
    email: "taylor.chen@contentops.ai",
    role: "editor",
    joinedAt: "2025-06-05T09:15:00Z",
    status: "active",
  },
  {
    id: "m-4",
    name: "Sam Patel",
    email: "sam.patel@contentops.ai",
    role: "viewer",
    joinedAt: "2025-09-18T11:00:00Z",
    status: "inactive",
  },
];

const mockPendingInvites: PendingInvite[] = [
  {
    id: "inv-1",
    email: "new.editor@example.com",
    sentAt: "2026-02-14T16:00:00Z",
  },
  {
    id: "inv-2",
    email: "freelancer@agency.com",
    sentAt: "2026-02-15T09:30:00Z",
  },
];

const roleBadgeColors: Record<string, string> = {
  owner: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  admin: "bg-purple-500/10 text-purple-600 border-purple-200",
  editor: "bg-teal-500/10 text-teal-600 border-teal-200",
  viewer: "bg-slate-500/10 text-slate-600 border-slate-200",
  billing: "bg-amber-500/10 text-amber-600 border-amber-200",
};

const statusBadgeColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  inactive: "bg-slate-500/10 text-slate-500 border-slate-200",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function TeamPage() {
  const [members] = useState(mockTeamMembers);
  const [invites] = useState(mockPendingInvites);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage who has access to your organization."
        actions={
          <Button>
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        }
      />

      <Separator />

      {/* Team Members Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="bg-indigo-500/10 text-xs text-indigo-600">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {member.role === "owner" ? (
                    <Badge
                      variant="outline"
                      className={roleBadgeColors[member.role]}
                    >
                      Owner
                    </Badge>
                  ) : (
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="h-7 w-24" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(member.joinedAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusBadgeColors[member.status]}
                  >
                    {member.status.charAt(0).toUpperCase() +
                      member.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="size-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Trash2 className="size-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pending Invites */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Pending Invites</h3>
          <p className="text-sm text-muted-foreground">
            Invitations that have been sent but not yet accepted.
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Mail className="size-3.5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {invite.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(invite.sentAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <RotateCcw className="size-3.5" />
                        Resend
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="size-3.5" />
                        Revoke
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Youtube,
  Instagram,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Unplug,
  Settings,
} from "lucide-react";
import type { SocialAccount } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Youtube;
  iconColor: string;
  iconBg: string;
  connected: boolean;
}

const integrations: Integration[] = [
  {
    id: "youtube",
    name: "YouTube",
    description:
      "Publish and schedule videos directly to your YouTube channel. Track views, engagement, and growth metrics.",
    icon: Youtube,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    connected: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    description:
      "Share reels and stories to Instagram. Auto-resize content for the platform and track reach metrics.",
    icon: Instagram,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Get notifications for render completions, approvals, and team activity right in your Slack channels.",
    icon: MessageSquare,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    connected: false,
  },
  {
    id: "analytics",
    name: "Google Analytics",
    description:
      "Import traffic and conversion data to correlate video content performance with website engagement.",
    icon: BarChart3,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    connected: false,
  },
];

interface ConnectedAccount extends SocialAccount {
  accountName: string;
}

const mockConnectedAccounts: ConnectedAccount[] = [
  {
    id: "sa-1",
    orgId: "org-1",
    provider: "youtube",
    displayName: "ContentOps Official",
    status: "active",
    connectedBy: "Alex Morgan",
    createdAt: "2025-08-12T10:00:00Z",
    accountName: "ContentOps Official",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const providerIcons: Record<string, { icon: typeof Youtube; color: string }> = {
  youtube: { icon: Youtube, color: "text-red-500" },
  instagram: { icon: Instagram, color: "text-pink-500" },
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  expired: "bg-amber-500/10 text-amber-600 border-amber-200",
  revoked: "bg-red-500/10 text-red-600 border-red-200",
};

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Integrations"
        subtitle="Connect your favorite tools and platforms to supercharge your content workflow."
      />

      <Separator />

      {/* Integration Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;

          return (
            <Card key={integration.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${integration.iconBg}`}
                    >
                      <Icon className={`size-5 ${integration.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {integration.name}
                      </CardTitle>
                    </div>
                  </div>
                  {integration.connected ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-200"
                    >
                      <CheckCircle2 className="size-3" />
                      Connected
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {integration.description}
                </CardDescription>
                {integration.connected ? (
                  <Button variant="outline" size="sm">
                    <Settings className="size-3.5" />
                    Configure
                  </Button>
                ) : (
                  <Button size="sm">
                    <ExternalLink className="size-3.5" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Accounts Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Connected Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Accounts currently linked to your organization.
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected By</TableHead>
                <TableHead>Connected At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockConnectedAccounts.map((account) => {
                const provider = providerIcons[account.provider];
                const ProviderIcon = provider?.icon ?? Youtube;

                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProviderIcon
                          className={`size-4 ${provider?.color ?? ""}`}
                        />
                        <span className="text-sm font-medium capitalize">
                          {account.provider}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {account.accountName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadge[account.status]}
                      >
                        {account.status.charAt(0).toUpperCase() +
                          account.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.connectedBy}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(account.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Unplug className="size-3.5" />
                        Disconnect
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

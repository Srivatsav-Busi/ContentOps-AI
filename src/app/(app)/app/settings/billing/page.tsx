"use client";

import {
  CreditCard,
  Download,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useBilling } from "@/lib/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoiceStatusConfig: Record<string, { badge: string; icon: typeof CheckCircle2 }> = {
  paid: { badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  pending: { badge: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock },
  failed: { badge: "bg-red-500/10 text-red-600 border-red-200", icon: Clock },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BillingPage() {
  const { data: billing, isLoading, error } = useBilling();

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
        Failed to load billing information
      </div>
    );
  }

  const plan = billing?.plan ?? { name: "Free", price: "$0", interval: "month" };
  const usage = billing?.usage ?? [];
  const invoices = billing?.invoices ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, usage, and invoices.
        </p>
      </div>

      <Separator />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <CardTitle>{plan.name} Plan</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">{plan.price ?? "$0"}</span>
                  <span className="text-muted-foreground">/{plan.interval ?? "month"}</span>
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-200">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Bars */}
          {usage.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Usage this period</h4>
              {usage.map((item: any) => {
                const used = item.used ?? 0;
                const limit = item.limit ?? 1;
                const pct = Math.round((used / limit) * 100);
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.formatUsed ?? used} / {item.formatLimit ?? limit} {item.unit ?? ""}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button>
              <Sparkles className="size-4" />
              Upgrade Plan
            </Button>
            <Button variant="outline">
              <CreditCard className="size-4" />
              Manage Billing
              <ExternalLink className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Recent Invoices</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => {
                  const config = invoiceStatusConfig[invoice.status] ?? invoiceStatusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.number ?? invoice.id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.date ? formatDate(invoice.date) : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {invoice.amount ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.badge}>
                          <StatusIcon className="size-3" />
                          {(invoice.status ?? "pending").charAt(0).toUpperCase() +
                            (invoice.status ?? "pending").slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm">
                          <Download className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

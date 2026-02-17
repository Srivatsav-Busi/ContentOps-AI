"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import type { OrgProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockOrg: OrgProfile = {
  id: "org-1",
  name: "ContentOps Studio",
  slug: "contentops-studio",
  planId: "plan-pro",
  planTier: "pro",
  logoUrl: "",
  settings: { timezone: "America/New_York" },
  region: "us-east-1",
  createdAt: "2025-01-10T08:00:00Z",
};

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState(mockOrg.name);
  const [timezone, setTimezone] = useState(
    (mockOrg.settings.timezone as string) ?? "America/New_York"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Organization</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and branding.
        </p>
      </div>

      <Separator />

      <div className="max-w-lg space-y-8">
        {/* Org Name */}
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <Input
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your organization name"
          />
        </div>

        {/* Slug (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={mockOrg.slug} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">
            Organization slug is used in URLs and cannot be changed.
          </p>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Organization Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <Button variant="outline" size="sm">
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">
                SVG, PNG or JPG, max 1MB. Recommended 256x256px.
              </p>
            </div>
          </div>
        </div>

        {/* Default Timezone */}
        <div className="space-y-2">
          <Label>Default Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

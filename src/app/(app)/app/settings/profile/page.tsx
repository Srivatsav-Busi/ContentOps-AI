"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const mockUser: UserProfile = {
  id: "usr-001",
  orgId: "org-1",
  email: "alex.morgan@contentops.ai",
  displayName: "Alex Morgan",
  avatarUrl: "",
  role: "admin",
  emailVerified: true,
  lastLoginAt: "2026-02-16T10:00:00Z",
  createdAt: "2025-06-15T08:00:00Z",
};

const roleBadgeColors: Record<string, string> = {
  owner: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  admin: "bg-purple-500/10 text-purple-600 border-purple-200",
  editor: "bg-teal-500/10 text-teal-600 border-teal-200",
  viewer: "bg-slate-500/10 text-slate-600 border-slate-200",
  billing: "bg-amber-500/10 text-amber-600 border-amber-200",
};

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState(mockUser.displayName);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal information and profile picture.
        </p>
      </div>

      <Separator />

      <div className="max-w-lg space-y-8">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="size-20">
              <AvatarImage src={mockUser.avatarUrl} alt={mockUser.displayName} />
              <AvatarFallback className="text-lg bg-indigo-500/10 text-indigo-600">
                {mockUser.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Profile Photo</p>
            <p className="text-xs text-muted-foreground">
              Click the avatar to upload a new photo. JPG, PNG or GIF, max 2MB.
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
        </div>

        {/* Email (disabled) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={mockUser.email}
            disabled
            className="opacity-60"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        {/* Role (read-only badge) */}
        <div className="space-y-2">
          <Label>Role</Label>
          <div>
            <Badge
              variant="outline"
              className={roleBadgeColors[mockUser.role] ?? ""}
            >
              {mockUser.role.charAt(0).toUpperCase() + mockUser.role.slice(1)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Your role is managed by the organization owner.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

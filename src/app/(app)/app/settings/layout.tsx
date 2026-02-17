"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Users,
  CreditCard,
  Palette,
  Bell,
  Key,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const settingsNav = [
  { label: "Profile", href: "/app/settings/profile", icon: User },
  { label: "Organization", href: "/app/settings/organization", icon: Building2 },
  { label: "Team", href: "/app/settings/team", icon: Users },
  { label: "Billing", href: "/app/settings/billing", icon: CreditCard },
  { label: "Brand", href: "/app/settings/brand", icon: Palette },
  { label: "Notifications", href: "/app/settings/notifications", icon: Bell },
  { label: "API Keys", href: "/app/settings/api-keys", icon: Key },
  { label: "Audit Log", href: "/app/settings/audit-log", icon: ScrollText },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, organization, and preferences.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <nav className="w-full shrink-0 lg:w-56">
          <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

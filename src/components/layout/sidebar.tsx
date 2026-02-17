"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FolderKanban,
  ListVideo,
  Download,
  Calendar,
  SendHorizonal,
  ScrollText,
  LayoutDashboard,
  FileBarChart2,
  BellRing,
  Plug,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/app-store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string | number;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Render Queue", href: "/render-queue", icon: ListVideo },
      { label: "Exports", href: "/exports", icon: Download },
    ],
  },
  {
    label: "Publishing",
    items: [
      { label: "Calendar", href: "/calendar", icon: Calendar },
      { label: "Publish Queue", href: "/publish-queue", icon: SendHorizonal },
      { label: "Publish Logs", href: "/publish-logs", icon: ScrollText },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Dashboards", href: "/dashboards", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileBarChart2 },
      { label: "Alerts", href: "/alerts", icon: BellRing },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? undefined;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b px-4",
          sidebarCollapsed && "justify-center px-0"
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Zap className="size-4" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-tight">
            ContentOps AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav aria-label="Sidebar navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              {!sidebarCollapsed && (
                <p className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              {sidebarCollapsed && (
                <Separator className="mx-auto my-2 w-8" />
              )}
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive && "text-indigo-600 dark:text-indigo-400"
                        )}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {sidebarCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground",
            sidebarCollapsed && "justify-center"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User / Org */}
      <div
        className={cn(
          "flex items-center gap-3 border-t px-4 py-3",
          sidebarCollapsed && "justify-center px-0"
        )}
      >
        <Avatar size="sm">
          {userImage && (
            <AvatarImage src={userImage} alt={userName} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

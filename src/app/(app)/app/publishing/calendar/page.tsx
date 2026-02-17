"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  Camera,
  Clock,
  CalendarDays,
  X,
  ExternalLink,
} from "lucide-react";
import type { ScheduledPost } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CalendarView = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  platform: "youtube" | "instagram";
  scheduledAt: string;
  status: ScheduledPost["status"];
  account: string;
  description?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Product Launch Reel",
    platform: "instagram",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 3, 10, 0).toISOString(),
    status: "published",
    account: "@contentops",
    description: "Showcasing our new AI features with a 30s reel",
  },
  {
    id: "ev-2",
    title: "Weekly Tutorial #12",
    platform: "youtube",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 14, 0).toISOString(),
    status: "published",
    account: "ContentOps Channel",
    description: "How to use AI-powered editing",
  },
  {
    id: "ev-3",
    title: "Behind the Scenes",
    platform: "instagram",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 9, 30).toISOString(),
    status: "published",
    account: "@contentops",
    description: "Office tour and team introduction",
  },
  {
    id: "ev-4",
    title: "Deep Dive: Analytics",
    platform: "youtube",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 16, 0).toISOString(),
    status: "scheduled",
    account: "ContentOps Channel",
    description: "Complete walkthrough of the analytics dashboard",
  },
  {
    id: "ev-5",
    title: "Customer Story: Acme",
    platform: "youtube",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 11, 0).toISOString(),
    status: "scheduled",
    account: "ContentOps Channel",
    description: "How Acme Corp increased engagement by 300%",
  },
  {
    id: "ev-6",
    title: "Tips & Tricks Carousel",
    platform: "instagram",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 18, 0).toISOString(),
    status: "scheduled",
    account: "@contentops",
    description: "5 tips for better video thumbnails",
  },
  {
    id: "ev-7",
    title: "Feature Announcement",
    platform: "instagram",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 19, 12, 0).toISOString(),
    status: "scheduled",
    account: "@contentops",
    description: "New scheduling features launch",
  },
  {
    id: "ev-8",
    title: "Webinar: Content Strategy",
    platform: "youtube",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 15, 0).toISOString(),
    status: "scheduled",
    account: "ContentOps Channel",
    description: "Live webinar on content strategy for 2026",
  },
  {
    id: "ev-9",
    title: "Monthly Recap",
    platform: "youtube",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 26, 10, 0).toISOString(),
    status: "scheduled",
    account: "ContentOps Channel",
    description: "Highlights and metrics from this month",
  },
  {
    id: "ev-10",
    title: "Reel: Quick Edit Tips",
    platform: "instagram",
    scheduledAt: new Date(new Date().getFullYear(), new Date().getMonth(), 28, 17, 0).toISOString(),
    status: "scheduled",
    account: "@contentops",
    description: "60-second editing tips compilation",
  },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const platformConfig = {
  youtube: {
    icon: Video,
    color: "bg-red-500/10 text-red-600 border-red-200",
    dotColor: "bg-red-500",
    label: "YouTube",
  },
  instagram: {
    icon: Camera,
    color: "bg-pink-500/10 text-pink-600 border-pink-200",
    dotColor: "bg-pink-500",
    label: "Instagram",
  },
};

const statusConfig: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-700 border-blue-200",
  publishing: "bg-amber-500/10 text-amber-700 border-amber-200",
  published: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  failed: "bg-red-500/10 text-red-700 border-red-200",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function PublishingCalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) days.push(null);
    }
    return days;
  }, [firstDay, daysInMonth]);

  function getEventsForDay(day: number) {
    return mockEvents.filter((e) => {
      const d = new Date(e.scheduledAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });
  }

  function navigateMonth(delta: number) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function goToToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }

  const upcomingPosts = mockEvents
    .filter((e) => new Date(e.scheduledAt) >= today && e.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publishing Calendar"
        actions={
          <>
            <div className="flex items-center rounded-lg border p-0.5">
              {(["month", "week", "day"] as CalendarView[]).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView(v)}
                  className="capitalize"
                >
                  {v}
                </Button>
              ))}
            </div>
            <Button>
              <Plus className="size-4" />
              Schedule Post
            </Button>
          </>
        }
      />

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500" />
                  YouTube
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-pink-500" />
                  Instagram
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const events = day ? getEventsForDay(day) : [];
                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] border-b border-r p-1.5 ${
                        idx % 7 === 0 ? "border-l" : ""
                      } ${day === null ? "bg-muted/30" : "hover:bg-accent/30"} transition-colors`}
                    >
                      {day !== null && (
                        <>
                          <div
                            className={`mb-1 flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                              isToday(day)
                                ? "bg-indigo-600 text-white"
                                : "text-foreground"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-1">
                            {events.map((event) => {
                              const config = platformConfig[event.platform];
                              const Icon = config.icon;
                              return (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-all hover:opacity-80 ${config.color}`}
                                >
                                  <Icon className="size-3 shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 shrink-0 space-y-4">
          {/* Event Preview */}
          {selectedEvent && (
            <Card className="border-indigo-200 bg-indigo-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{selectedEvent.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {selectedEvent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={platformConfig[selectedEvent.platform].color}>
                    {platformConfig[selectedEvent.platform].label}
                  </Badge>
                  <Badge variant="outline" className={statusConfig[selectedEvent.status]}>
                    {selectedEvent.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <span className="text-xs">{formatDate(selectedEvent.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ExternalLink className="size-3.5" />
                  <span className="text-xs">{selectedEvent.account}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1">
                    View Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Posts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-indigo-500" />
                Upcoming Posts
              </CardTitle>
              <CardDescription className="text-xs">
                Next {upcomingPosts.length} scheduled posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPosts.map((post) => {
                  const config = platformConfig[post.platform];
                  const Icon = config.icon;
                  return (
                    <button
                      key={post.id}
                      onClick={() => setSelectedEvent(post)}
                      className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/50"
                    >
                      <div
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.scheduledAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">{post.account}</p>
                      </div>
                    </button>
                  );
                })}
                {upcomingPosts.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No upcoming posts scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

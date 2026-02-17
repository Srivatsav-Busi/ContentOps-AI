import type { Metadata } from "next";
import Link from "next/link";
import {
  Video,
  Search,
  Share2,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Features — ContentOps AI",
  description:
    "Explore the full ContentOps AI platform: AI video editing, SEO generation, social publishing, KPI dashboards, and governance tools.",
};

const features = [
  {
    slug: "video-editing",
    icon: Video,
    title: "Video Editing",
    description:
      "Intelligent AI agents auto-cut silences, add captions, apply brand overlays, and produce platform-optimized exports — no timeline scrubbing required.",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    gradient: "from-violet-500/10 to-transparent",
  },
  {
    slug: "seo-generation",
    icon: Search,
    title: "SEO Generation",
    description:
      "Automatically generate optimized titles, descriptions, tags, and thumbnails tailored for each platform's algorithm and audience.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    slug: "social-publishing",
    icon: Share2,
    title: "Social Publishing",
    description:
      "Schedule and publish to YouTube, TikTok, Instagram, LinkedIn, and X from a single dashboard with platform-native formatting.",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    slug: "kpi-dashboards",
    icon: BarChart3,
    title: "KPI Dashboards",
    description:
      "AI-driven analytics surface engagement patterns, predict performance, and recommend content optimizations in real time.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    slug: "governance",
    icon: Shield,
    title: "Governance & Collaboration",
    description:
      "Enterprise-grade approval workflows, brand safety checks, audit trails, and role-based access controls built for teams.",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    gradient: "from-rose-500/10 to-transparent",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.15),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-3 py-1 text-sm font-medium shadow-sm"
            >
              <Sparkles className="size-3.5 text-primary" />
              Platform
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                scale content
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Five AI-powered modules working in harmony — from raw footage to
              published, tracked results across every channel.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Feature Cards Grid ───────── */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className="group"
                >
                  <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="pt-0">
                      <div
                        className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${feature.color}`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:gap-2.5">
                        Learn more
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${feature.gradient}`}
                    />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Bottom CTA ───────── */}
      <section className="border-t bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see it in action?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free today and experience the full power of ContentOps AI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              Start Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket,
  Users,
  Building2,
  LineChart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Use Cases — ContentOps AI",
  description:
    "Discover how growth marketing, social media teams, content agencies, and RevOps teams use ContentOps AI to scale their content operations.",
};

const useCases = [
  {
    slug: "growth-marketing",
    icon: Rocket,
    title: "Growth Marketing",
    description:
      "Scale your content output without scaling your team. Automate video editing, SEO metadata, and multi-platform publishing to drive organic growth across every channel.",
    highlights: [
      "10x content output without extra headcount",
      "AI-generated SEO metadata for maximum discoverability",
      "Automated A/B testing for thumbnails and titles",
    ],
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    gradient: "from-violet-500/10 to-transparent",
  },
  {
    slug: "social-media-teams",
    icon: Users,
    title: "Social Media Teams",
    description:
      "Manage all your social channels from a single dashboard. Schedule, publish, and track performance across YouTube, TikTok, Instagram, LinkedIn, and X with platform-native formatting.",
    highlights: [
      "Unified calendar for every platform",
      "Auto-format content for each channel",
      "Real-time engagement analytics",
    ],
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    slug: "content-agencies",
    icon: Building2,
    title: "Content Agencies",
    description:
      "Manage multiple client accounts with enterprise-grade governance. Separate brand presets, approval workflows, and analytics dashboards keep every client's content on-brand and on-time.",
    highlights: [
      "Multi-tenant workspaces for each client",
      "Role-based access with approval workflows",
      "White-label reporting dashboards",
    ],
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    slug: "revops-analytics",
    icon: LineChart,
    title: "RevOps & Analytics",
    description:
      "Connect content performance to revenue outcomes. AI-powered dashboards track content attribution, predict performance, and surface optimization opportunities your team would otherwise miss.",
    highlights: [
      "Cross-platform content attribution",
      "Predictive performance scoring",
      "Automated anomaly detection and alerts",
    ],
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    gradient: "from-amber-500/10 to-transparent",
  },
];

export default function UseCasesPage() {
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
              Use Cases
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Built for teams{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                like yours
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Whether you&apos;re a lean startup or an enterprise agency,
              ContentOps AI adapts to your workflow and accelerates your content
              pipeline.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Use Case Cards ───────── */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <Link key={uc.slug} href="#" className="group">
                  <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="pt-0">
                      <div
                        className={`mb-5 inline-flex size-12 items-center justify-center rounded-xl ${uc.color}`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {uc.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {uc.description}
                      </p>
                      <ul className="mt-5 space-y-2">
                        {uc.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:gap-2.5">
                        Learn more
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${uc.gradient}`}
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
            Don&apos;t see your use case?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ContentOps AI is flexible enough for any content workflow. Talk to
            our team to explore a custom solution.
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
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

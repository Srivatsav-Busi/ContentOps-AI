import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Video,
  Search,
  Share2,
  BarChart3,
  Shield,
  Upload,
  Wand2,
  Rocket,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ContentOps AI — Raw Video to Published Content in Minutes",
  description:
    "Multi-agent SaaS platform that converts raw video assets into platform-ready content, generates SEO-optimized metadata, automates social publishing, and provides AI-driven KPI dashboards.",
};

const features = [
  {
    icon: Video,
    title: "AI Video Editing",
    description:
      "Intelligent agents auto-cut silences, add captions, apply brand overlays, and produce platform-optimized exports — no timeline scrubbing required.",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
  {
    icon: Search,
    title: "SEO Generation",
    description:
      "Automatically generate optimized titles, descriptions, tags, and thumbnails tailored for each platform's algorithm and audience.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    icon: Share2,
    title: "Social Publishing",
    description:
      "Schedule and publish to YouTube, TikTok, Instagram, LinkedIn, and X from a single dashboard with platform-native formatting.",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "KPI Dashboards",
    description:
      "AI-driven analytics surface engagement patterns, predict performance, and recommend content optimizations in real time.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    icon: Shield,
    title: "Governance & Compliance",
    description:
      "Enterprise-grade approval workflows, brand safety checks, audit trails, and role-based access controls built for teams.",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  },
];

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload",
    description:
      "Drop your raw video files — any format, any length. Our AI ingests and analyzes footage automatically.",
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI Edits",
    description:
      "Multi-agent AI handles editing, captioning, SEO metadata, and platform formatting in parallel.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Publish",
    description:
      "Review, approve, and publish across all platforms simultaneously. Track performance from day one.",
  },
];

const testimonials = [
  {
    quote:
      "ContentOps AI cut our video-to-publish time from 4 hours to 12 minutes. The SEO generation alone has doubled our organic reach.",
    author: "Sarah Chen",
    role: "Head of Content",
    company: "ScaleUp Media",
    avatar: "SC",
  },
  {
    quote:
      "We manage 200+ video pieces a month across 6 channels. Without ContentOps, we'd need triple the team. It's our content multiplier.",
    author: "Marcus Rivera",
    role: "VP of Marketing",
    company: "NovaBrand",
    avatar: "MR",
  },
  {
    quote:
      "The governance features give our legal team peace of mind. Every piece of content is tracked, approved, and compliant before it goes live.",
    author: "Emily Nakamura",
    role: "Director of Operations",
    company: "FinTech Global",
    avatar: "EN",
  },
];

const logoPlaceholders = [
  "TechCorp",
  "ScaleUp",
  "MediaFlow",
  "NovaBrand",
  "Velocity",
  "Pinnacle",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://contentops.ai/#organization",
      name: "ContentOps AI",
      url: "https://contentops.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://contentops.ai/logo.png",
      },
      sameAs: [
        "https://twitter.com/contentopsai",
        "https://linkedin.com/company/contentopsai",
        "https://github.com/contentopsai",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "ContentOps AI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://contentops.ai",
      description:
        "Multi-agent SaaS platform that converts raw video assets into platform-ready content, generates SEO-optimized metadata, automates social publishing, and provides AI-driven KPI dashboards.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "312",
        bestRating: "5",
      },
      provider: {
        "@type": "Organization",
        "@id": "https://contentops.ai/#organization",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.15),transparent)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pb-32 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-3 py-1 text-sm font-medium shadow-sm"
            >
              <Sparkles className="size-3.5 text-primary" />
              Now in Public Beta
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Raw Video{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                &rarr; Published Content
              </span>{" "}
              in Minutes
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The multi-agent AI platform that edits your videos, generates
              SEO-optimized metadata, publishes across every channel, and tracks
              performance — all on autopilot.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/signup">
                  Start Free — No Credit Card
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/demo">
                  <Play className="size-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Free forever up to 10 videos/month &middot; No credit card required
            </p>
          </div>

          {/* Hero Visual Placeholder */}
          <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="relative rounded-xl border bg-gradient-to-b from-muted/50 to-muted p-2 shadow-2xl shadow-primary/10">
              <div className="overflow-hidden rounded-lg border bg-background">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <div className="size-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="mx-auto h-5 w-48 rounded-md bg-muted text-xs leading-5 text-muted-foreground">
                      app.contentops.ai
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4 p-6">
                  <div className="col-span-8 space-y-4">
                    <div className="h-48 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Video className="size-10 text-primary/40" />
                        <span className="text-sm font-medium">Video Preview</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-full rounded-full bg-primary/20">
                        <div className="h-2 w-3/5 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 space-y-3">
                    <div className="rounded-lg border p-3">
                      <div className="h-3 w-20 rounded bg-muted mb-2" />
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded bg-muted" />
                        <div className="h-2 w-4/5 rounded bg-muted" />
                        <div className="h-2 w-3/5 rounded bg-muted" />
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="h-3 w-16 rounded bg-muted mb-2" />
                      <div className="flex flex-wrap gap-1.5">
                        <div className="h-5 w-14 rounded-full bg-primary/10" />
                        <div className="h-5 w-10 rounded-full bg-primary/10" />
                        <div className="h-5 w-16 rounded-full bg-primary/10" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <div className="h-3 w-14 rounded bg-primary/20 mb-2" />
                      <div className="h-8 rounded-md bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">Publish</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Social Proof ───────── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Trusted by{" "}
            <span className="font-semibold text-foreground">500+</span> content
            teams worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logoPlaceholders.map((name) => (
              <div
                key={name}
                className="flex h-8 items-center text-lg font-bold tracking-tight text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Features Grid ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
              <Wand2 className="size-3.5 text-primary" />
              Platform
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ship content faster
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Five AI-powered modules that work together as one seamless content
              pipeline — from raw footage to published, tracked results.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    i >= 3 ? "sm:col-span-1 lg:col-span-1" : ""
                  }`}
                >
                  <CardContent className="pt-0">
                    <div
                      className={`mb-4 inline-flex size-11 items-center justify-center rounded-lg ${feature.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.03] to-transparent" />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ───────── */}
      <section className="relative border-y bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
              <Rocket className="size-3.5 text-primary" />
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps. Zero complexity.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Go from raw video to live, optimized content across every platform
              in minutes — not hours.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-10 left-[calc(50%+40px)] hidden h-0.5 w-[calc(100%-80px)] bg-gradient-to-r from-primary/30 to-primary/10 md:block" />
                  )}

                  <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-background shadow-lg shadow-primary/5">
                    <Icon className="size-8 text-primary" />
                    <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Testimonials ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
              <Star className="size-3.5 text-primary" />
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by content teams everywhere
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See how leading brands use ContentOps AI to transform their
              content workflows.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card
                key={t.author}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="pt-0">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Pricing Teaser ───────── */}
      <section className="border-y bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Plans starting at{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                $0/mo
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free with 10 videos per month. Scale as your content
              operations grow — no surprise fees.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/pricing">
                  View Pricing
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                Free tier forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Final CTA Banner ───────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(79,70,229,0.15),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-8 shadow-xl sm:p-12 lg:p-16">
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <Sparkles className="size-7 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start creating in under 2 minutes
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                Join 500+ content teams already using ContentOps AI to publish
                faster, rank higher, and scale smarter.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 px-8 text-base"
                  asChild
                >
                  <Link href="/demo">Schedule a Demo</Link>
                </Button>
              </div>
            </div>

            {/* Decorative grid dots */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

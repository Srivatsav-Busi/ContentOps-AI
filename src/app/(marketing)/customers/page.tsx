import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Customers — ContentOps AI",
  description:
    "See how leading content teams use ContentOps AI to scale their video production, boost SEO performance, and automate multi-platform publishing.",
};

const caseStudies = [
  {
    company: "ScaleUp Media",
    industry: "Digital Media",
    quote:
      "ContentOps AI cut our video-to-publish time from 4 hours to 12 minutes. The SEO generation alone has doubled our organic reach in under 6 months.",
    author: "Sarah Chen",
    role: "Head of Content",
    avatar: "SC",
    metric: "20x",
    metricLabel: "Faster publishing",
    results: [
      "Reduced production time by 95%",
      "2x organic reach growth",
      "Eliminated 3 point tools from their stack",
    ],
  },
  {
    company: "NovaBrand",
    industry: "E-Commerce",
    quote:
      "We manage 200+ video pieces a month across 6 channels. Without ContentOps, we'd need triple the team. It's our content multiplier.",
    author: "Marcus Rivera",
    role: "VP of Marketing",
    avatar: "MR",
    metric: "200+",
    metricLabel: "Videos per month",
    results: [
      "3x content output with same team size",
      "Unified 6 channels into one workflow",
      "40% increase in engagement rate",
    ],
  },
  {
    company: "FinTech Global",
    industry: "Financial Services",
    quote:
      "The governance features give our legal team peace of mind. Every piece of content is tracked, approved, and compliant before it goes live.",
    author: "Emily Nakamura",
    role: "Director of Operations",
    avatar: "EN",
    metric: "100%",
    metricLabel: "Compliance rate",
    results: [
      "Zero compliance incidents since adoption",
      "50% faster approval cycles",
      "Complete audit trail for every asset",
    ],
  },
];

const logoPlaceholders = [
  "TechCorp",
  "ScaleUp",
  "MediaFlow",
  "NovaBrand",
  "Velocity",
  "Pinnacle",
  "Apex Digital",
  "Luminary",
];

export default function CustomersPage() {
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
              Customers
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Trusted by content teams{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                worldwide
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              From fast-moving startups to enterprise media companies, see how
              teams use ContentOps AI to transform their content pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Logo Cloud ───────── */}
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

      {/* ───────── Case Studies ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-sm font-medium"
            >
              <TrendingUp className="size-3.5 text-primary" />
              Case Studies
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Real results from real teams
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover how leading organizations are achieving measurable ROI
              with ContentOps AI.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Card
                key={study.company}
                className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="flex flex-1 flex-col pt-0">
                  {/* Metric highlight */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10">
                      <span className="text-xl font-extrabold text-primary">
                        {study.metric}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{study.metricLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {study.company} &middot; {study.industry}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mb-3 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{study.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {study.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{study.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {study.role}, {study.company}
                      </p>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="mt-6 border-t pt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Key Results
                    </p>
                    <ul className="space-y-1.5">
                      {study.results.map((result) => (
                        <li
                          key={result}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Link */}
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:gap-2.5">
                      Read case study
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </CardContent>
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.03] to-transparent" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA Banner ───────── */}
      <section className="border-t bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-14 text-center text-white shadow-xl sm:px-16">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Join 500+ teams already using ContentOps AI
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-indigo-100">
                Start free today. See results in minutes, not months.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contact">Talk to Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

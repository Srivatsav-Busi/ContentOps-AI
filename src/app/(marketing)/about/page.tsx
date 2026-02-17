import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  BrainCircuit,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About — ContentOps AI",
  description:
    "Learn about ContentOps AI's mission to transform content operations with multi-agent AI. Meet the team behind the platform.",
};

const team = [
  {
    name: "Alex Morgan",
    role: "CEO & Co-Founder",
    initials: "AM",
    bio: "Previously led product at a top video platform. Passionate about removing friction from creative workflows.",
  },
  {
    name: "Priya Sharma",
    role: "CTO & Co-Founder",
    initials: "PS",
    bio: "Former ML engineer at a leading AI lab. Architect of ContentOps' multi-agent orchestration engine.",
  },
  {
    name: "Jordan Lee",
    role: "Head of Design",
    initials: "JL",
    bio: "Design leader with 12 years crafting intuitive SaaS experiences. Obsessed with making powerful tools feel simple.",
  },
  {
    name: "Mia Chen",
    role: "Head of Growth",
    initials: "MC",
    bio: "Growth veteran who's scaled three startups from seed to Series B. Data-driven marketer at heart.",
  },
];

const values = [
  {
    icon: Zap,
    title: "Speed",
    description:
      "We believe content teams shouldn't wait. Every feature we build is designed to eliminate bottlenecks and ship content faster — from raw idea to live across every platform.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    icon: BrainCircuit,
    title: "Intelligence",
    description:
      "AI should amplify human creativity, not replace it. Our multi-agent system handles the tedious work so your team can focus on strategy, storytelling, and what actually moves the needle.",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No black boxes. Every AI decision is explainable, every action is logged, and every metric is verifiable. We earn trust by showing our work — in product and as a company.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
];

export default function AboutPage() {
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
              About Us
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                ContentOps AI
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We&apos;re on a mission to make world-class content production
              accessible to every team — powered by multi-agent AI that handles
              the complexity so creators can focus on what matters.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Mission ───────── */}
      <section className="border-y bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Mission
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Content is the backbone of modern marketing, yet the production
                pipeline is broken. Teams spend more time editing, tagging,
                scheduling, and reporting than actually creating. Every new
                platform adds another workflow, another format, another tool.
              </p>
              <p>
                We built ContentOps AI to fix this. Our multi-agent platform
                collapses the entire content lifecycle — from raw video to
                published, tracked results — into a single, intelligent system.
                AI agents handle the tedious, repetitive work while humans stay
                in control of creative decisions and strategy.
              </p>
              <p className="font-medium text-foreground">
                The result: 10x the output, a fraction of the friction, and
                content teams that finally have time to think.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Team ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-sm font-medium"
            >
              Team
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The people behind the platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A team of builders, designers, and AI researchers passionate about
              transforming content operations.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card
                key={member.name}
                className="group relative overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="pt-0">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 text-2xl font-bold text-primary">
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.03] to-transparent" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Values ───────── */}
      <section className="border-t bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-sm font-medium"
            >
              Values
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What drives us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three principles that guide every decision we make — from product
              roadmap to company culture.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <CardContent className="pt-0">
                    <div
                      className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${value.color}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                  <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.03] to-transparent" />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Join us on the journey
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re building the future of content operations and we&apos;d
            love for you to be part of it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

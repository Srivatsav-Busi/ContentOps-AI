import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Video,
  Search,
  Share2,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
  Scissors,
  Captions,
  Palette,
  FileText,
  Tags,
  ImageIcon,
  CalendarDays,
  Globe,
  Megaphone,
  TrendingUp,
  BellRing,
  PieChart,
  Users,
  Lock,
  ClipboardCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface FeatureCapability {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeatureData {
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  capabilities: FeatureCapability[];
}

const featureData: Record<string, FeatureData> = {
  "video-editing": {
    slug: "video-editing",
    icon: Video,
    title: "AI Video Editing",
    subtitle: "From raw footage to polished content — automatically",
    description:
      "Our multi-agent AI handles the tedious parts of video editing so your team can focus on creative strategy. Auto-cut silences, generate captions, apply brand overlays, and export platform-optimized formats in minutes.",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    capabilities: [
      {
        icon: Scissors,
        title: "Intelligent Scene Detection & Auto-Cut",
        description:
          "AI agents analyze your footage frame-by-frame, automatically removing silences, detecting scene changes, and cutting dead air. What used to take hours of timeline scrubbing now happens in seconds — preserving the best moments while trimming the rest.",
      },
      {
        icon: Captions,
        title: "Auto-Generated Captions & Subtitles",
        description:
          "Generate highly accurate captions in 50+ languages using state-of-the-art speech recognition. Customize fonts, positioning, and animation styles to match your brand. Burn-in or export as SRT/VTT for platform-native subtitles.",
      },
      {
        icon: Palette,
        title: "Brand Overlays & Template System",
        description:
          "Apply consistent brand elements across every video: lower thirds, intro/outro sequences, watermarks, and color grading. Save custom templates and let AI agents apply them automatically to every new project.",
      },
    ],
  },
  "seo-generation": {
    slug: "seo-generation",
    icon: Search,
    title: "SEO Generation",
    subtitle: "Rank higher on every platform with AI-optimized metadata",
    description:
      "ContentOps AI analyzes your video content, understands your audience, and generates platform-specific titles, descriptions, tags, and thumbnails engineered to maximize discoverability and click-through rates.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    capabilities: [
      {
        icon: FileText,
        title: "AI-Crafted Titles & Descriptions",
        description:
          "Generate compelling, keyword-rich titles and descriptions for every platform. Our AI understands the nuances between YouTube SEO, TikTok discoverability, and LinkedIn engagement — crafting metadata that resonates with each algorithm.",
      },
      {
        icon: Tags,
        title: "Smart Tag & Hashtag Optimization",
        description:
          "Automatically research trending tags and hashtags in your niche. The AI analyzes competitor content, identifies gaps, and suggests the optimal tag mix to maximize reach without diluting relevance.",
      },
      {
        icon: ImageIcon,
        title: "Thumbnail Generation & A/B Testing",
        description:
          "AI extracts the most engaging frames from your video, generates thumbnail variations with text overlays, and supports A/B testing to find the highest-performing creative for each piece of content.",
      },
    ],
  },
  "social-publishing": {
    slug: "social-publishing",
    icon: Share2,
    title: "Social Publishing",
    subtitle: "One dashboard. Every platform. Zero context-switching.",
    description:
      "Schedule, publish, and manage content across YouTube, TikTok, Instagram, LinkedIn, and X from a single unified interface. Platform-native formatting ensures every post looks perfect wherever it lands.",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    capabilities: [
      {
        icon: CalendarDays,
        title: "Unified Content Calendar",
        description:
          "Plan and visualize your entire content pipeline in one calendar. Drag-and-drop scheduling, timezone support, and team coordination features make it easy to maintain a consistent publishing cadence across all platforms.",
      },
      {
        icon: Globe,
        title: "Cross-Platform Publishing",
        description:
          "Publish to YouTube, TikTok, Instagram Reels, LinkedIn, and X simultaneously with format-specific optimizations. Each platform gets the right aspect ratio, caption format, and metadata — automatically.",
      },
      {
        icon: Megaphone,
        title: "Campaign Management",
        description:
          "Organize content into campaigns with shared goals, tags, and performance benchmarks. Track which campaigns drive the most engagement and let AI recommend optimal posting times and content mixes.",
      },
    ],
  },
  "kpi-dashboards": {
    slug: "kpi-dashboards",
    icon: BarChart3,
    title: "KPI Dashboards",
    subtitle: "AI-powered analytics that predict and prescribe",
    description:
      "Move beyond vanity metrics. ContentOps AI surfaces engagement patterns, predicts content performance before publishing, and recommends optimizations based on real-time data from every connected platform.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    capabilities: [
      {
        icon: TrendingUp,
        title: "Predictive Performance Scoring",
        description:
          "Before you hit publish, our AI scores your content based on historical performance, trending topics, and audience behavior patterns. Get actionable recommendations to improve engagement before your content goes live.",
      },
      {
        icon: BellRing,
        title: "Anomaly Detection & Smart Alerts",
        description:
          "Set custom KPI thresholds and let AI monitor them around the clock. Get instant alerts when engagement spikes, drops, or deviates from expected patterns — with root cause analysis and suggested actions.",
      },
      {
        icon: PieChart,
        title: "Cross-Platform Attribution",
        description:
          "Understand the true impact of your content across platforms. Track how a single video performs on YouTube vs. TikTok vs. LinkedIn, identify audience overlap, and optimize your distribution strategy accordingly.",
      },
    ],
  },
  governance: {
    slug: "governance",
    icon: Shield,
    title: "Governance & Collaboration",
    subtitle: "Enterprise-grade controls for content teams at scale",
    description:
      "Built for organizations that need compliance without complexity. Role-based access, multi-stage approval workflows, complete audit trails, and brand safety checks keep your content pipeline secure and consistent.",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    capabilities: [
      {
        icon: Users,
        title: "Role-Based Access Controls",
        description:
          "Define granular roles for creators, editors, reviewers, and publishers. Control who can create, edit, approve, and publish content at every stage. Integrates with SSO/SAML providers for enterprise identity management.",
      },
      {
        icon: ClipboardCheck,
        title: "Multi-Stage Approval Workflows",
        description:
          "Design custom approval pipelines that match your organization's process. Sequential or parallel approvals, automatic escalation, deadline tracking, and in-context feedback ensure nothing goes live without proper review.",
      },
      {
        icon: Lock,
        title: "Audit Trails & Compliance",
        description:
          "Every action is logged with timestamps and user attribution. Generate compliance reports, track revision history, and maintain a complete chain of custody for every piece of content from creation to publication.",
      },
    ],
  },
};

export function generateStaticParams() {
  return [
    { slug: "video-editing" },
    { slug: "seo-generation" },
    { slug: "social-publishing" },
    { slug: "kpi-dashboards" },
    { slug: "governance" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = featureData[slug];
  if (!feature) return { title: "Feature Not Found" };

  return {
    title: `${feature.title} — ContentOps AI`,
    description: feature.description,
  };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = featureData[slug];

  if (!feature) {
    notFound();
  }

  const Icon = feature.icon;

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.15),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/features">Features</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{feature.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mx-auto max-w-3xl text-center">
            <div
              className={`mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-2xl ${feature.color}`}
            >
              <Icon className="size-8" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              {feature.title}
            </h1>

            <p className="mt-4 text-xl text-muted-foreground">
              {feature.subtitle}
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {feature.description}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Capabilities ───────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-sm font-medium"
            >
              <Sparkles className="size-3.5 text-primary" />
              Capabilities
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What&apos;s included
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Deep-dive into the powerful features that make {feature.title}{" "}
              best-in-class.
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-5xl space-y-24">
            {feature.capabilities.map((cap, idx) => {
              const CapIcon = cap.icon;
              const isReversed = idx % 2 !== 0;

              return (
                <div
                  key={cap.title}
                  className={`flex flex-col items-center gap-12 lg:flex-row ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Visual placeholder */}
                  <div className="flex-1">
                    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted p-8 shadow-lg">
                      <div className="flex aspect-[4/3] items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <div
                            className={`inline-flex size-16 items-center justify-center rounded-2xl ${feature.color}`}
                          >
                            <CapIcon className="size-8" />
                          </div>
                          <span className="text-sm font-medium">
                            {cap.title}
                          </span>
                        </div>
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, currentColor 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div
                      className={`inline-flex size-11 items-center justify-center rounded-lg ${feature.color}`}
                    >
                      <CapIcon className="size-5" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {cap.title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {cap.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
                Ready to supercharge your {feature.title.toLowerCase()}?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-indigo-100">
                Start for free today. No credit card required. See results in
                minutes, not months.
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

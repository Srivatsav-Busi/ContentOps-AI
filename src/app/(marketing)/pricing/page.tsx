"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  highlighted: boolean;
  badge?: string;
  cta: string;
  ctaHref: string;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out ContentOps on personal projects.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlighted: false,
    cta: "Get Started Free",
    ctaHref: "/signup",
    features: [
      { text: "3 projects", included: true },
      { text: "10 renders / month", included: true },
      { text: "1 GB storage", included: true },
      { text: "Basic SEO generation", included: true },
      { text: "Email support", included: true },
      { text: "Brand presets", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For creators and teams shipping content every week.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    highlighted: true,
    badge: "Most Popular",
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "100 renders / month", included: true },
      { text: "50 GB storage", included: true },
      { text: "Advanced SEO & analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Brand presets", included: true },
      { text: "API access", included: true },
      { text: "SSO / SAML", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large teams and agencies.",
    monthlyPrice: null,
    yearlyPrice: null,
    highlighted: false,
    cta: "Contact Sales",
    ctaHref: "/contact",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited renders", included: true },
      { text: "Unlimited storage", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Custom integrations", included: true },
      { text: "99.9% SLA", included: true },
      { text: "On-premise option", included: true },
    ],
  },
];

interface ComparisonRow {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

interface ComparisonSection {
  title: string;
  rows: ComparisonRow[];
}

const comparisonSections: ComparisonSection[] = [
  {
    title: "Content Creation",
    rows: [
      { feature: "Projects", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Monthly renders", free: "10", pro: "100", enterprise: "Unlimited" },
      { feature: "Storage", free: "1 GB", pro: "50 GB", enterprise: "Unlimited" },
      { feature: "Scene detection", free: true, pro: true, enterprise: true },
      { feature: "Auto captions", free: true, pro: true, enterprise: true },
      { feature: "Custom transitions", free: false, pro: true, enterprise: true },
      { feature: "Brand presets", free: false, pro: true, enterprise: true },
    ],
  },
  {
    title: "SEO & Distribution",
    rows: [
      { feature: "Basic SEO titles", free: true, pro: true, enterprise: true },
      { feature: "Advanced keyword research", free: false, pro: true, enterprise: true },
      { feature: "Hashtag optimization", free: false, pro: true, enterprise: true },
      { feature: "Multi-platform scheduling", free: false, pro: true, enterprise: true },
      { feature: "Campaign management", free: false, pro: true, enterprise: true },
    ],
  },
  {
    title: "Analytics & Reporting",
    rows: [
      { feature: "Basic dashboard", free: true, pro: true, enterprise: true },
      { feature: "Advanced KPI dashboards", free: false, pro: true, enterprise: true },
      { feature: "Anomaly detection", free: false, pro: true, enterprise: true },
      { feature: "Scheduled reports", free: false, pro: true, enterprise: true },
      { feature: "Custom alerts", free: false, pro: "5 alerts", enterprise: "Unlimited" },
    ],
  },
  {
    title: "Platform & Support",
    rows: [
      { feature: "API access", free: false, pro: true, enterprise: true },
      { feature: "SSO / SAML", free: false, pro: false, enterprise: true },
      { feature: "Custom integrations", free: false, pro: false, enterprise: true },
      { feature: "SLA", free: false, pro: false, enterprise: "99.9%" },
      { feature: "Support", free: "Email", pro: "Priority", enterprise: "Dedicated" },
    ],
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing period. When downgrading, the new rate kicks in at your next billing cycle.",
  },
  {
    question: "What counts as a render?",
    answer:
      "A render is counted each time you export a final video from an edit plan. Previews and draft exports don't count toward your monthly limit. Failed renders are automatically refunded to your quota.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Absolutely. Every new Pro subscription includes a 14-day free trial with full access to all Pro features. No credit card is required to start your trial.",
  },
  {
    question: "How does the yearly billing discount work?",
    answer:
      "When you choose yearly billing, you save 20% compared to monthly pricing. You'll be billed once per year at the discounted rate. For Pro, that's $39/month billed annually ($468/year) instead of $49/month ($588/year).",
  },
  {
    question: "Can I use ContentOps with my team?",
    answer:
      "Yes! All plans support team collaboration. Free plans include up to 2 team members, Pro supports up to 10, and Enterprise offers unlimited seats with role-based access controls and SSO.",
  },
  {
    question: "What happens when I exceed my render limit?",
    answer:
      "You'll receive a notification when you reach 80% of your monthly limit. Once you hit the cap, you can either wait for the next billing cycle or upgrade your plan. We never charge overage fees without your explicit approval.",
  },
];

/* ────────────────────────────────────────────────────────────
   JSON-LD
   ──────────────────────────────────────────────────────────── */

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "ContentOps AI",
  description:
    "Multi-agent SaaS platform that converts raw video assets into platform-ready content.",
  brand: { "@type": "Brand", name: "ContentOps AI" },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-indigo-600" />
    ) : (
      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          {/* ── Header ── */}
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <Sparkles className="h-3 w-3" />
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm">
              <Label
                htmlFor="billing-toggle"
                className={`cursor-pointer text-sm transition-colors ${
                  !yearly ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={yearly}
                onCheckedChange={setYearly}
              />
              <Label
                htmlFor="billing-toggle"
                className={`cursor-pointer text-sm transition-colors ${
                  yearly ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </Label>
              {yearly && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>

          {/* ── Pricing Cards ── */}
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const price =
                plan.monthlyPrice === null
                  ? null
                  : yearly
                    ? plan.yearlyPrice
                    : plan.monthlyPrice;

              return (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col transition-shadow ${
                    plan.highlighted
                      ? "border-indigo-600 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-600"
                      : "hover:shadow-md"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 px-3 py-0.5 text-xs font-semibold shadow-sm">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    {/* Price */}
                    <div className="mb-6">
                      {price !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight">
                            ${price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / month
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight">
                            Custom
                          </span>
                        </div>
                      )}
                      {yearly && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="line-through">
                            ${plan.monthlyPrice}/mo
                          </span>{" "}
                          billed annually
                        </p>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f.text}
                          className={`flex items-center gap-2.5 text-sm ${
                            f.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {f.included ? (
                            <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                          ) : (
                            <X className="h-4 w-4 shrink-0" />
                          )}
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      asChild
                      size="lg"
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link href={plan.ctaHref}>
                        {plan.name === "Enterprise" && (
                          <Building2 className="h-4 w-4" />
                        )}
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* ── Feature Comparison Table ── */}
          <div className="mx-auto mt-24 max-w-5xl">
            <div className="text-center">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {showComparison ? "Hide" : "View"} full feature comparison
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showComparison ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {showComparison && (
              <div className="mt-10 rounded-xl border bg-card shadow-sm overflow-hidden">
                {comparisonSections.map((section, idx) => (
                  <div key={section.title}>
                    {idx > 0 && <Separator />}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-[40%] font-semibold text-foreground">
                            {section.title}
                          </TableHead>
                          <TableHead className="text-center font-semibold text-foreground">
                            Free
                          </TableHead>
                          <TableHead className="text-center font-semibold text-indigo-600">
                            Pro
                          </TableHead>
                          <TableHead className="text-center font-semibold text-foreground">
                            Enterprise
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows.map((row) => (
                          <TableRow key={row.feature}>
                            <TableCell className="font-medium">
                              {row.feature}
                            </TableCell>
                            <TableCell className="text-center">
                              <CellValue value={row.free} />
                            </TableCell>
                            <TableCell className="text-center bg-indigo-50/50">
                              <CellValue value={row.pro} />
                            </TableCell>
                            <TableCell className="text-center">
                              <CellValue value={row.enterprise} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── FAQ ── */}
          <div className="mx-auto mt-24 max-w-3xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-muted-foreground">
                Can&apos;t find what you&apos;re looking for?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Contact our team
                </Link>
                .
              </p>
            </div>

            <Accordion
              type="single"
              collapsible
              className="mt-10"
            >
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* ── CTA Banner ── */}
          <div className="mx-auto mt-24 max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-14 text-center text-white shadow-xl sm:px-16">
              <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Ready to transform your video workflow?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-indigo-100">
                  Start for free today. No credit card required. Upgrade
                  seamlessly when you&apos;re ready.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
                  >
                    <Link href="/signup">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
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
        </div>
      </section>
    </>
  );
}

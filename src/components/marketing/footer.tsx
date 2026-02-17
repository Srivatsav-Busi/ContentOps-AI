"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  ArrowRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Video Editing", href: "/features/video-editing" },
      { label: "SEO Generation", href: "/features/seo-generation" },
      { label: "Social Publishing", href: "/features/social-publishing" },
      { label: "KPI Dashboards", href: "/features/kpi-dashboards" },
      { label: "Governance", href: "/features/governance" },
      { label: "Integrations", href: "/integrations" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "https://status.contentops.ai" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Customers", href: "/customers" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Security", href: "/security" },
      { label: "DPA", href: "/dpa" },
    ],
  },
};

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/contentopsai", icon: Twitter },
  { label: "GitHub", href: "https://github.com/contentopsai", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/company/contentopsai", icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com/@contentopsai", icon: Youtube },
];

export function MarketingFooter() {
  const [email, setEmail] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="border-t bg-muted/30">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b py-12 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold tracking-tight">
              Stay up to date
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get the latest product updates, tips, and content ops insights delivered to your inbox.
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex w-full max-w-sm gap-2"
          >
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
            <Button type="submit" size="lg" className="shrink-0 shadow-md shadow-primary/25">
              Subscribe
              <ArrowRight className="size-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Links Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:gap-12">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold tracking-tight">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary shadow-sm">
                <Sparkles className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">
                ContentOps <span className="text-primary">AI</span>
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ContentOps AI, Inc. All rights reserved.
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-1">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon-sm"
                  asChild
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <Icon className="size-4" />
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

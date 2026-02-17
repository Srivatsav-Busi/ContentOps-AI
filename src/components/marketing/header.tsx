"use client";

import * as React from "react";
import Link from "next/link";
import {
  Video,
  Search,
  Share2,
  BarChart3,
  Shield,
  Menu,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const features = [
  {
    title: "AI Video Editing",
    description: "Auto-cut, trim, and enhance raw footage with intelligent agents",
    href: "/features/video-editing",
    icon: Video,
  },
  {
    title: "SEO Generation",
    description: "Generate optimized titles, descriptions, and tags automatically",
    href: "/features/seo-generation",
    icon: Search,
  },
  {
    title: "Social Publishing",
    description: "One-click publish to YouTube, TikTok, Instagram, and more",
    href: "/features/social-publishing",
    icon: Share2,
  },
  {
    title: "KPI Dashboards",
    description: "Real-time analytics and AI-driven performance insights",
    href: "/features/kpi-dashboards",
    icon: BarChart3,
  },
  {
    title: "Governance & Compliance",
    description: "Brand safety, approval workflows, and audit trails",
    href: "/features/governance",
    icon: Shield,
  },
];

const navLinks = [
  { title: "Pricing", href: "/pricing" },
  { title: "Use Cases", href: "/use-cases" },
  { title: "Customers", href: "/customers" },
  { title: "Docs", href: "/docs" },
];

function ListItem({
  className,
  title,
  children,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            "group flex select-none gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          {Icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm transition-colors group-hover:border-primary/20 group-hover:bg-primary/5">
              <Icon className="size-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b bg-background/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/25">
            <Sparkles className="size-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            ContentOps <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* Features Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[540px] p-2">
                  <div className="mb-2 px-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Platform Features</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Everything you need to turn raw video into published content
                    </p>
                  </div>
                  <ul className="grid w-full grid-cols-1 gap-1">
                    {features.map((feature) => (
                      <ListItem
                        key={feature.title}
                        title={feature.title}
                        href={feature.href}
                        icon={feature.icon}
                      >
                        {feature.description}
                      </ListItem>
                    ))}
                  </ul>
                  <div className="mt-2 border-t pt-2">
                    <Link
                      href="/features"
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                    >
                      View all features
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Static Links */}
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.title}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {link.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" className="shadow-md shadow-primary/25" asChild>
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/25">
                    <Sparkles className="size-4.5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    ContentOps <span className="text-primary">AI</span>
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4">
              {/* Features Section */}
              <div className="py-2">
                <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Globe className="size-3.5" />
                  Features
                </p>
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Icon className="size-4 text-primary" />
                      {feature.title}
                    </Link>
                  );
                })}
              </div>

              <div className="my-1 h-px bg-border" />

              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {link.title}
                </Link>
              ))}

              <div className="my-1 h-px bg-border" />

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="shadow-md shadow-primary/25" asChild>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Start Free Trial
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

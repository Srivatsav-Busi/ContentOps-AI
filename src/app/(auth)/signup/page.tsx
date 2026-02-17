"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Video,
  Sparkles,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;
const strengthColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-400",
  "bg-emerald-500",
];

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    label: "One special character",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const displayName = formData.get("displayName") as string;

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Registration failed. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created but sign-in failed. Please log in manually.");
        router.push("/login");
      } else {
        router.push("/app/onboarding");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ── Left: Brand Panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-10 text-white">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-violet-400/20 blur-3xl" />

        {/* Logo + tagline */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              ContentOps AI
            </span>
          </Link>

          <h2 className="mt-12 max-w-sm text-3xl font-bold leading-tight tracking-tight">
            Raw Video &rarr; Published Content in Minutes
          </h2>
          <p className="mt-4 max-w-sm text-indigo-100/90 leading-relaxed">
            Join thousands of creators and teams who ship content faster with
            AI-powered video editing, SEO optimization, and social publishing.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-5">
          {[
            {
              icon: Sparkles,
              title: "AI-Powered Editing",
              desc: "Scene detection, captions & transitions — generated in seconds.",
            },
            {
              icon: BarChart3,
              title: "SEO & Analytics",
              desc: "Keyword-optimized titles, descriptions & real-time KPI dashboards.",
            },
            {
              icon: Zap,
              title: "One-Click Publishing",
              desc: "Schedule & push to YouTube and Instagram from a single workflow.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-indigo-200/80">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <blockquote className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm italic leading-relaxed text-indigo-100">
            &ldquo;We onboarded our whole team in under ten minutes. The free
            tier alone saved us 20 hours a month on video repurposing.&rdquo;
          </p>
          <footer className="mt-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-400/40" />
            <div className="text-xs">
              <p className="font-semibold text-white">Marcus Rivera</p>
              <p className="text-indigo-200/70">
                Director of Marketing, LoopMedia
              </p>
            </div>
          </footer>
        </blockquote>
      </div>

      {/* ── Right: Signup Form ── */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Video className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              ContentOps AI
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Create your free account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No credit card required. Start creating in minutes.
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="grid gap-3">
            <Button variant="outline" size="lg" className="w-full gap-2.5 h-11">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <Button variant="outline" size="lg" className="w-full gap-2.5 h-11">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase text-muted-foreground">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < strength
                              ? strengthColors[strength - 1]
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {strength > 0
                        ? strengthLabels[strength - 1]
                        : strengthLabels[0]}
                    </span>
                  </div>

                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {passwordRules.map(({ test, label }) => {
                      const passed = test(password);
                      return (
                        <li
                          key={label}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            passed
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passed ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Legal */}
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* Footer link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

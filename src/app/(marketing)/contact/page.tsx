"use client";

import { useState } from "react";
import {
  Mail,
  Clock,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const infoCards = [
  {
    icon: Mail,
    title: "Email",
    description: "Our team typically replies within 4 hours.",
    detail: "hello@contentops.ai",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    icon: Clock,
    title: "Support Hours",
    description: "We're here when you need us.",
    detail: "Mon — Fri, 9 AM – 6 PM ET",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Come say hello.",
    detail: "San Francisco, CA",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

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
              Contact
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Get in{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent">
                touch
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Have a question, want a demo, or ready to get started? We&apos;d
              love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Contact Form + Info ───────── */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5">
            {/* ── Form ── */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <CardContent className="pt-0">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        <Send className="size-7" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">
                        Message sent!
                      </h3>
                      <p className="mt-2 max-w-sm text-muted-foreground">
                        Thanks for reaching out. Our team will get back to you
                        within 4 business hours.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setSubmitted(false)}
                      >
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your project, timeline, or any questions you have..."
                          className="min-h-[140px]"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base shadow-lg shadow-primary/25 sm:w-auto sm:px-8"
                      >
                        <Send className="size-4" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Info Cards ── */}
            <div className="space-y-6 lg:col-span-2">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.title}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <CardContent className="pt-0">
                      <div className="flex items-start gap-4">
                        <div
                          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg ${card.color}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold tracking-tight">
                            {card.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {card.description}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {card.detail}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.03] to-transparent" />
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

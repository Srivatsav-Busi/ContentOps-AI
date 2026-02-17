"use client";

import { useState } from "react";
import {
  User,
  Youtube,
  Instagram,
  FolderPlus,
  Upload,
  CheckCircle2,
  ArrowRight,
  SkipForward,
  Sparkles,
  Video,
  FileText,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TOTAL_STEPS = 4;

const stepMeta = [
  { title: "Tell us about yourself", icon: User },
  { title: "Connect your channels", icon: Youtube },
  { title: "Create your first project", icon: FolderPlus },
  { title: "Upload a video", icon: Upload },
];

const templates = [
  {
    id: "youtube-longform",
    name: "YouTube Long-form",
    description: "Ideal for tutorials, vlogs, and deep dives",
    icon: Video,
  },
  {
    id: "social-clips",
    name: "Social Clips",
    description: "Short-form content for Reels and Shorts",
    icon: Sparkles,
  },
  {
    id: "podcast-repurpose",
    name: "Podcast Repurpose",
    description: "Turn podcast episodes into video content",
    icon: FileText,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Slide-based video with voiceover",
    icon: Presentation,
  },
];

function StepAboutYou() {
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="onboard-name">Display Name</Label>
        <Input id="onboard-name" placeholder="Your name" />
      </div>

      <div className="space-y-2">
        <Label>Your Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="content-creator">Content Creator</SelectItem>
            <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
            <SelectItem value="video-editor">Video Editor</SelectItem>
            <SelectItem value="social-media-manager">
              Social Media Manager
            </SelectItem>
            <SelectItem value="founder">Founder / CEO</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Team Size</Label>
        <div className="grid grid-cols-2 gap-3">
          {["Just me", "2-5", "6-20", "20+"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setTeamSize(size)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                teamSize === size
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepConnectChannels() {
  const [connectedYouTube, setConnectedYouTube] = useState(false);
  const [connectedInstagram, setConnectedInstagram] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connect your social channels to publish and schedule content directly.
        You can always do this later.
      </p>

      <div className="space-y-3">
        {/* YouTube Card */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <Youtube className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">YouTube</p>
              <p className="text-xs text-muted-foreground">
                Publish videos and track performance
              </p>
            </div>
          </div>
          {connectedYouTube ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Connected
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConnectedYouTube(true)}
            >
              Connect
            </Button>
          )}
        </div>

        {/* Instagram Card */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Instagram className="size-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Instagram</p>
              <p className="text-xs text-muted-foreground">
                Share reels and stories automatically
              </p>
            </div>
          </div>
          {connectedInstagram ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Connected
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConnectedInstagram(true)}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCreateProject() {
  const [selectedTemplate, setSelectedTemplate] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input id="project-name" placeholder="e.g. Q1 Campaign Videos" />
      </div>

      <div className="space-y-3">
        <Label>Choose a Template</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === tpl.id;

            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tpl.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepUploadVideo() {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
        }`}
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-indigo-500/10">
          <Upload className="size-6 text-indigo-600" />
        </div>
        <p className="text-sm font-medium">
          Drag & drop your video here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          MP4, MOV, or WEBM up to 5GB
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          Browse Files
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <Sparkles className="size-4" />
        Try with a sample video
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const progressPct = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const meta = stepMeta[currentStep];
  const StepIcon = meta.icon;

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goSkip = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepAboutYou />;
      case 1:
        return <StepConnectChannels />;
      case 2:
        return <StepCreateProject />;
      case 3:
        return <StepUploadVideo />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-start justify-center pt-8 sm:pt-16">
      <Card className="w-full max-w-[600px]">
        <CardHeader className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {TOTAL_STEPS}
              </span>
              <span className="font-medium text-primary">
                {Math.round(progressPct)}%
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          {/* Step Header */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <StepIcon className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>{meta.title}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Help us personalize your experience."}
                {currentStep === 1 &&
                  "Link platforms to publish content seamlessly."}
                {currentStep === 2 &&
                  "Set up your workspace with a starter project."}
                {currentStep === 3 &&
                  "Add your first video to get started."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goSkip}
              disabled={currentStep === TOTAL_STEPS - 1}
              className="text-muted-foreground"
            >
              <SkipForward className="size-4" />
              Skip
            </Button>

            {currentStep < TOTAL_STEPS - 1 ? (
              <Button onClick={goNext}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button>
                <CheckCircle2 className="size-4" />
                Get Started
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

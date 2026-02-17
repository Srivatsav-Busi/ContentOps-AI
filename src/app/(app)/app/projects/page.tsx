"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FolderOpen,
  Video,
  MoreHorizontal,
  Archive,
  Loader2,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { useProjects, useCreateProject } from "@/lib/hooks/use-api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
      <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
        <FolderOpen className="text-muted-foreground size-7" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">No projects yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
        Create your first project to start uploading video assets and generating
        content.
      </p>
      <Button onClick={onCreateProject}>
        <Plus className="size-4" />
        New Project
      </Button>
    </div>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();

  function handleCreateProject() {
    createProject.mutate({ name: `New Project ${Date.now()}` });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load projects
      </div>
    );
  }

  const allProjects: Project[] = projects || [];

  const filtered = allProjects.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Projects">
        <Button onClick={handleCreateProject} disabled={createProject.isPending}>
          {createProject.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          New Project
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[240px] pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState onCreateProject={handleCreateProject} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/app/projects/${project.id}`}>
      <Card className="group cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:shadow-md hover:ring-1 hover:ring-indigo-500/20">
        {/* Thumbnail */}
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <Video className="text-muted-foreground/50 size-10 transition-transform group-hover:scale-110" />
          </div>
          <div className="absolute right-2 top-2">
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
              className={
                project.status === "active"
                  ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                  : ""
              }
            >
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <CardHeader className="gap-1 px-4 pb-1 pt-3">
          <CardTitle className="truncate text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <p className="text-muted-foreground text-xs">
            {project.assetCount ?? 0} assets
          </p>
        </CardContent>
        <CardFooter className="text-muted-foreground px-4 pb-3 pt-1 text-xs">
          Updated {formatDate(project.updatedAt)}
        </CardFooter>
      </Card>
    </Link>
  );
}

function ProjectListItem({ project }: { project: Project }) {
  return (
    <Link href={`/app/projects/${project.id}`}>
      <div className="group flex items-center gap-4 rounded-lg border p-3 transition-all hover:bg-accent/50 hover:shadow-sm">
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <Video className="text-muted-foreground/60 size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{project.name}</p>
          <p className="text-muted-foreground text-xs">
            {project.assetCount ?? 0} assets &middot; Updated{" "}
            {formatDate(project.updatedAt)}
          </p>
        </div>
        <Badge
          variant={project.status === "active" ? "default" : "secondary"}
          className={
            project.status === "active"
              ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
              : ""
          }
        >
          {project.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

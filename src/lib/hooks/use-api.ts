"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.errors?.[0]?.message || `API Error ${res.status}`);
  }
  return json.data;
}

// ── Projects ──

export function useProjects(status?: string) {
  return useQuery({
    queryKey: ["projects", status],
    queryFn: () => apiFetch<any[]>(`/api/v1/projects${status ? `?status=${status}` : ""}`),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; template?: string }) =>
      apiFetch<any>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ── Assets ──

export function useAssets(projectId?: string) {
  return useQuery({
    queryKey: ["assets", projectId],
    queryFn: () =>
      apiFetch<any[]>(`/api/v1/assets${projectId ? `?project_id=${projectId}` : ""}`),
    enabled: !!projectId,
  });
}

// ── Render Jobs ──

export function useRenderJobs(status?: string) {
  return useQuery({
    queryKey: ["render-jobs", status],
    queryFn: () =>
      apiFetch<any[]>(`/api/v1/render-jobs${status ? `?status=${status}` : ""}`),
    refetchInterval: 5000, // Poll every 5s for active jobs
  });
}

// ── Exports ──

export function useExports() {
  return useQuery({
    queryKey: ["exports"],
    queryFn: () => apiFetch<any[]>("/api/v1/exports"),
  });
}

// ── SEO Briefs ──

export function useSeoBriefs(projectId?: string) {
  return useQuery({
    queryKey: ["seo-briefs", projectId],
    queryFn: () =>
      apiFetch<any[]>(`/api/v1/seo-briefs${projectId ? `?project_id=${projectId}` : ""}`),
    enabled: !!projectId,
  });
}

// ── Campaigns ──

export function useCampaigns(projectId?: string) {
  return useQuery({
    queryKey: ["campaigns", projectId],
    queryFn: () =>
      apiFetch<any[]>(`/api/v1/campaigns${projectId ? `?project_id=${projectId}` : ""}`),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; projectId: string; startDate?: string; endDate?: string }) =>
      apiFetch<any>("/api/v1/campaigns", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

// ── Dashboards ──

export function useDashboards() {
  return useQuery({
    queryKey: ["dashboards"],
    queryFn: () => apiFetch<any[]>("/api/v1/dashboards"),
  });
}

export function useCreateDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; template?: string }) =>
      apiFetch<any>("/api/v1/dashboards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards"] }),
  });
}

// ── Alerts ──

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiFetch<any[]>("/api/v1/alerts"),
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; ruleType: string; kpiId?: string; channels: string[]; severity?: string }) =>
      apiFetch<any>("/api/v1/alerts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ── Reports ──

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => apiFetch<any[]>("/api/v1/reports"),
  });
}

// ── Billing ──

export function useBilling() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: () => apiFetch<any>("/api/v1/billing"),
  });
}

// ── AI Agents ──

export function useGenerateSEO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; assetId: string; platform: string; targetAudience?: string }) =>
      apiFetch<any>("/api/v1/ai/seo-generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["seo-briefs", vars.projectId] }),
  });
}

export function useGenerateEditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; assetId: string; targetFormat: string; targetDurationMs?: number }) =>
      apiFetch<any>("/api/v1/ai/edit-plan-generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["edit-plans"] }),
  });
}

export function useExplainAnomaly() {
  return useMutation({
    mutationFn: (data: { anomalyId: string }) =>
      apiFetch<any>("/api/v1/ai/anomaly-explain", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// ── Auth ──

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<any>("/api/v1/auth"),
    retry: false,
  });
}

// ── Upload ──

export function useUploadAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      const res = await fetch("/api/v1/assets/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.errors?.[0]?.message || "Upload failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useProcessAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { assetId: string }) =>
      apiFetch<any>("/api/v1/assets/process", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["seo-briefs"] });
    },
  });
}

export function useCreateRenderJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      editPlanId: string;
      format?: string;
      resolution?: string;
      aspectRatio?: string;
    }) =>
      apiFetch<any>("/api/v1/render-jobs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["render-jobs"] });
      qc.invalidateQueries({ queryKey: ["exports"] });
    },
  });
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Project, ProjectKPIs, AuditTelemetryEvent } from "@/types/project";
import { projectService, ProjectFilterOptions } from "../services/project.service";

export interface UseProjectsOptions extends ProjectFilterOptions {
  initialLoading?: boolean;
  initialData?: Project[];
}

export function useProjects(options?: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>(options?.initialData ?? []);
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [auditStream, setAuditStream] = useState<AuditTelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(options?.initialLoading ?? false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const status = options?.status;
  const search = options?.search;
  const statistician = options?.statistician;
  const page = options?.page;
  const pageSize = options?.pageSize;

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams();
          if (status && status !== "ALL") params.set("status", status);
          if (search && search.trim()) params.set("search", search.trim());
          if (statistician) params.set("statistician", statistician);
          if (page) params.set("page", String(page));
          if (pageSize) params.set("pageSize", String(pageSize));

          const query = params.toString();
          const endpoint = query ? `/api/v1/projects?${query}` : "/api/v1/projects";
          const res = await fetch(endpoint);
          if (!isMountedRef.current) return;
          if (res.ok) {
            const json = await res.json();
            if (!isMountedRef.current) return;
            if (json.success && json.data) {
              setProjects(json.data.projects || []);
              setKpis(json.data.kpis || null);
              setAuditStream(json.data.auditStream || []);
              return;
            }
          }
        }

        const [projectsData, kpisData, auditData] = await Promise.all([
          projectService.getProjects({ status, search, statistician, page, pageSize }),
          projectService.getKPIs(),
          projectService.getAuditStream(),
        ]);

        if (!isMountedRef.current) return;

        setProjects(projectsData);
        setKpis(kpisData);
        setAuditStream(auditData);
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load project telemetry");
        }
      } finally {
        if (isMountedRef.current && showLoading) setIsLoading(false);
      }
    },
    [status, search, statistician, page, pageSize]
  );

  const hasMountedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (options?.initialData && !hasMountedRef.current && !options?.initialLoading) {
      hasMountedRef.current = true;
      return;
    }
    hasMountedRef.current = true;
    fetchData(options?.initialLoading ?? false);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData, options?.initialLoading, options?.initialData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(false);
    setIsRefreshing(false);
  }, [fetchData]);

  return {
    projects,
    kpis,
    auditStream,
    isLoading,
    isRefreshing,
    error,
    refresh,
    setIsLoading,
  };
}

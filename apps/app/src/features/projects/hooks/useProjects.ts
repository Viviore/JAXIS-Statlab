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
        const [projectsData, kpisData, auditData] = await Promise.all([
          projectService.getProjects({ status, search, statistician, page, pageSize }),
          projectService.getKPIs(),
          projectService.getAuditStream(),
        ]);

        setProjects(projectsData);
        setKpis(kpisData);
        setAuditStream(auditData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project telemetry");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [status, search, statistician, page, pageSize]
  );

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (options?.initialData && !hasMountedRef.current && !options?.initialLoading) {
      hasMountedRef.current = true;
      return;
    }
    hasMountedRef.current = true;
    fetchData(options?.initialLoading ?? false);
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

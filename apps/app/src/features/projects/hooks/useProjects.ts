"use client";

import { useState, useEffect, useCallback } from "react";
import { Project, ProjectKPIs, AuditTelemetryEvent } from "@/types/project";
import { projectService, ProjectFilterOptions } from "../services/project.service";

export interface UseProjectsOptions extends ProjectFilterOptions {
  initialLoading?: boolean;
}

export function useProjects(options?: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [auditStream, setAuditStream] = useState<AuditTelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(options?.initialLoading ?? false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const status = options?.status;
  const search = options?.search;
  const statistician = options?.statistician;

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const [projectsData, kpisData, auditData] = await Promise.all([
          projectService.getProjects({ status, search, statistician }),
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
    [status, search, statistician]
  );

  useEffect(() => {
    fetchData(options?.initialLoading ?? false);
  }, [fetchData, options?.initialLoading]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(false);
    setIsRefreshing(false);
  }, [fetchData]);

  const simulateSync = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await fetchData(false);
    setIsLoading(false);
  }, [fetchData]);

  return {
    projects,
    kpis,
    auditStream,
    isLoading,
    isRefreshing,
    error,
    refresh,
    simulateSync,
    setIsLoading,
  };
}

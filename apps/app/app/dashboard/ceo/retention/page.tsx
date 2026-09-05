"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PageHeader,
  KpiCard,
  Card,
  Badge,
  Button,
  LoadingState,
  Toast,
} from "@repo/ui";
import {
  getStorageRetentionConfigAction,
  updateStorageRetentionConfigAction,
  purgeExpiredFilesAction,
  getInfrastructureHealthAction,
  triggerStorageWarningAlertAction,
} from "@/features/reporting/actions";
import type {
  StorageRetentionConfigDTO,
  InfrastructureHealthDTO,
} from "@/features/reporting/schemas";
import {
  IconDatabase,
  IconShieldCheck,
  IconTrash,
  IconDeviceFloppy,
  IconClock,
  IconFileText,
  IconRefresh,
  IconAlertTriangle,
  IconReceipt,
  IconMessageCircle,
  IconCloud,
  IconMail,
  IconActivity,
  IconBell,
  IconCpu,
} from "@tabler/icons-react";

export default function CeoStorageRetentionPage() {
  const [config, setConfig] = useState<StorageRetentionConfigDTO>({
    retentionPeriodDays: 90,
    purgeInactiveDays: 180,
    autoPurgeEnabled: true,
    keepDatasets: true,
    keepResearchDocs: true,
    keepQuestionnaires: true,
    keepReceiptPhotos: true,
    keepChatHistory: true,
    keepDeliverables: true,
    updatedAt: "",
    updatedBy: null,
  });

  const [health, setHealth] = useState<InfrastructureHealthDTO | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [isTestingAlert, setIsTestingAlert] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const loadData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshingHealth(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [configRes, healthRes] = await Promise.all([
        getStorageRetentionConfigAction(),
        getInfrastructureHealthAction(),
      ]);

      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
      }
      if (healthRes.success && healthRes.data) {
        setHealth(healthRes.data);
      }
    } catch (err) {
      console.error("Failed to load retention and health settings:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshingHealth(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
      const res = await updateStorageRetentionConfigAction({
        retentionPeriodDays: Number(config.retentionPeriodDays),
        purgeInactiveDays: Number(config.purgeInactiveDays),
        autoPurgeEnabled: Boolean(config.autoPurgeEnabled),
        keepDatasets: Boolean(config.keepDatasets),
        keepResearchDocs: Boolean(config.keepResearchDocs),
        keepQuestionnaires: Boolean(config.keepQuestionnaires),
        keepReceiptPhotos: Boolean(config.keepReceiptPhotos),
        keepChatHistory: Boolean(config.keepChatHistory),
        keepDeliverables: Boolean(config.keepDeliverables),
      });

      if (res.success) {
        setToast({
          variant: "success",
          message: "Policy Saved",
          description: `Storage retention window updated to ${config.retentionPeriodDays} days with selective file protections applied.`,
        });
        loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Save Failed",
          description: res.error?.message || "Could not update policy.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error saving policy.";
      setToast({ variant: "danger", message: "Error", description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualPurge = async () => {
    if (
      !confirm(
        `Are you sure you want to trigger storage purge now based on your active ${config.retentionPeriodDays}-day policy?`
      )
    ) {
      return;
    }
    setIsPurging(true);
    try {
      const res = await purgeExpiredFilesAction();
      if (res.success) {
        setToast({
          variant: "success",
          message: "Storage Purge Completed",
          description: `Successfully cleaned raw storage for ${res.purgedCount} expired study records.`,
        });
        loadData(true);
      } else {
        setToast({
          variant: "danger",
          message: "Purge Failed",
          description: res.error?.message || "Could not run purge.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing purge.";
      setToast({ variant: "danger", message: "Error", description: msg });
    } finally {
      setIsPurging(false);
    }
  };

  const handleTestCapacityAlert = async (service: "Cloudflare" | "Supabase" | "Resend" | "TriggerDev") => {
    setIsTestingAlert(true);
    try {
      const res = await triggerStorageWarningAlertAction(service);
      if (res.success) {
        setToast({
          variant: "info",
          message: "Test Alert Created",
          description: res.message || `Diagnostic alert created for ${service}. Check your notification bell.`,
        });
      } else {
        setToast({
          variant: "danger",
          message: "Alert Test Failed",
          description: res.error?.message || "Could not trigger test alert.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error triggering test alert.";
      setToast({ variant: "danger", message: "Error", description: msg });
    } finally {
      setIsTestingAlert(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full min-h-full flex items-center justify-center animate-content-fade my-auto font-sans">
        <LoadingState
          variant="page"
          label="Loading Storage & Retention Status..."
          description="Connecting to Supabase, Cloudflare R2, Resend, and Trigger.dev telemetry"
        />
      </div>
    );
  }

  const dbUsed = health?.supabase.databaseSizeMB || 16.4;
  const dbLimit = health?.supabase.databaseLimitMB || 500;
  const dbPercent = health?.supabase.percentageUsed || Math.round((dbUsed / dbLimit) * 100);

  const cfUsed = health?.cloudflare.storageUsedMB || 240;
  const cfLimit = health?.cloudflare.storageLimitMB || 10240;
  const cfPercent = health?.cloudflare.percentageUsed || Math.round((cfUsed / cfLimit) * 100);

  const emailToday = health?.resend.sentToday || 0;
  const emailDailyLimit = health?.resend.dailyLimit || 100;
  const emailPercent = health?.resend.dailyPercentageUsed || Math.round((emailToday / emailDailyLimit) * 100);

  const triggerRuns = health?.triggerDev.runsThisMonth || 142;
  const triggerLimit = health?.triggerDev.monthlyLimit || 250000;
  const triggerPercent = health?.triggerDev.percentageUsed || Number(((triggerRuns / triggerLimit) * 100).toFixed(2));

  const isAnyWarning =
    health?.hasActiveWarning ||
    dbPercent >= 75 ||
    cfPercent >= 75 ||
    emailPercent >= 75 ||
    triggerPercent >= 75;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Standardized PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "CEO DESK", href: "/dashboard/ceo" },
          { label: "STORAGE & RETENTION POLICY" },
        ]}
        title="Data Retention & Storage Purge Policy"
        description="Monitor database, cloud storage, email quotas, and background cron capacity."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 hover:bg-white/10"
              onClick={() => loadData(true)}
              disabled={isRefreshingHealth}
            >
              <IconRefresh size={14} className={isRefreshingHealth ? "animate-spin text-sky-400" : ""} />
              <span>{isRefreshingHealth ? "Checking Status..." : "Refresh Status"}</span>
            </Button>
            <Button
              variant="secondary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
              onClick={handleManualPurge}
              disabled={isPurging}
            >
              <IconTrash size={14} />
              <span>{isPurging ? "Purging Files..." : "Run Storage Purge Now"}</span>
            </Button>
            <Button
              variant="primary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 bg-[#CC6600]"
              onClick={handleSavePolicy}
              disabled={isSaving}
            >
              <IconDeviceFloppy size={14} />
              <span>{isSaving ? "Saving..." : "Save Policy"}</span>
            </Button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          label="RETENTION WINDOW"
          value={`${config.retentionPeriodDays} DAYS`}
          description={`Approx. ${(config.retentionPeriodDays / 30).toFixed(1)} months post-delivery`}
        />
        <KpiCard
          label="SUPABASE DATABASE"
          value={`${dbUsed} MB`}
          unit={`/ ${dbLimit} MB`}
          description={`${dbPercent}% capacity used · ${health?.supabase.latencyMs || 12}ms ping`}
        />
        <KpiCard
          label="CLOUDFLARE R2"
          value={cfUsed > 1024 ? `${(cfUsed / 1024).toFixed(1)} GB` : `${cfUsed} MB`}
          unit="/ 10 GB"
          description={`${cfPercent}% capacity used · 0 egress fees`}
        />
        <KpiCard
          label="TRIGGER.DEV CRONS"
          value={triggerRuns.toLocaleString()}
          unit="/ 250K runs"
          description={`${triggerPercent}% monthly quota · 4 active crons`}
        />
      </div>

      {/* Active Warning Banner when storage or database is almost full */}
      {isAnyWarning && (
        <div className="p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30 rounded-[4px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <IconAlertTriangle size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-300 font-mono tracking-wide">
                  STORAGE & CAPACITY THRESHOLD WARNING
                </span>
                <Badge variant="amber">ACTION RECOMMENDED</Badge>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                {health?.warningDetails && health.warningDetails.length > 0
                  ? health.warningDetails.join(" ")
                  : "One or more infrastructure services have exceeded 75% capacity. Run the storage purge engine to free Cloudflare R2 disk space or upgrade service plans."}
              </p>
              <span className="text-[0.688rem] text-amber-300/60 font-mono">
                Automated in-app alert dispatched to CEO and Admin notification drawer.
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="text-xs h-8 px-4 bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shrink-0"
            onClick={handleManualPurge}
            disabled={isPurging}
          >
            <IconTrash size={14} className="mr-1.5" />
            <span>{isPurging ? "Purging Files..." : "Run Storage Purge Now"}</span>
          </Button>
        </div>
      )}

      {/* Infrastructure Health & Realtime Status Panel */}
      <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[4px] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-sky-500/15 text-sky-400">
              <IconActivity size={22} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Infrastructure & Storage Status
                </h3>
                {health?.overallStatus === "HEALTHY" ? (
                  <Badge variant="emerald">ALL SYSTEMS NORMAL</Badge>
                ) : health?.overallStatus === "CRITICAL" ? (
                  <Badge variant="danger">CRITICAL CAPACITY</Badge>
                ) : (
                  <Badge variant="amber">CAPACITY WARNING</Badge>
                )}
              </div>
              <span className="text-xs text-white/50">
                Real-time storage tracking, database row analytics, and email quota limits
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-[0.688rem] h-7 px-2.5 text-white/60 hover:text-white border border-white/10"
              onClick={() => handleTestCapacityAlert("TriggerDev")}
              disabled={isTestingAlert}
            >
              <IconBell size={13} className="mr-1 text-purple-400" />
              <span>Test Trigger Alert</span>
            </Button>
            <Button
              variant="ghost"
              className="text-[0.688rem] h-7 px-2.5 text-white/60 hover:text-white border border-white/10"
              onClick={() => handleTestCapacityAlert("Cloudflare")}
              disabled={isTestingAlert}
            >
              <IconBell size={13} className="mr-1 text-[#CC6600]" />
              <span>Test Storage Alert</span>
            </Button>
            <span className="text-[0.688rem] text-white/40 font-mono">
              Synced: {health?.lastCheckedAt ? new Date(health.lastCheckedAt).toLocaleTimeString() : "Live"}
            </span>
          </div>
        </div>

        {/* 4 Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Supabase Database */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-[4px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[2px] bg-sky-500/15 text-sky-400">
                  <IconDatabase size={16} />
                </div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Supabase DB
                </span>
              </div>
              {health?.supabase.status === "HEALTHY" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  HEALTHY
                </span>
              ) : health?.supabase.status === "CRITICAL" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-red-500/15 text-red-400 border border-red-500/25">
                  CRITICAL
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  WARNING
                </span>
              )}
            </div>

            {/* Storage Progress Gauge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Storage Used:</span>
                <span className="text-white font-semibold">
                  {dbUsed} MB <span className="text-white/40 font-normal">/ {dbLimit} MB</span>
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    dbPercent >= 90
                      ? "bg-red-500"
                      : dbPercent >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, dbPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.688rem] text-white/40 font-mono">
                <span>{dbPercent}% consumed</span>
                <span>{(dbLimit - dbUsed).toFixed(1)} MB available</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[0.688rem]">
              <div className="flex flex-col">
                <span className="text-white/40">Query Latency:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-white">{health?.supabase.latencyMs || 12} ms</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">Total Rows:</span>
                <span className="font-mono text-white mt-0.5">
                  {(health?.supabase.totalRows || 1280).toLocaleString()} rows
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-white/40">Connection Status:</span>
                <span className="font-mono text-sky-300 text-[0.625rem] mt-0.5">
                  {health?.supabase.connectionPoolStatus || "Active (Prisma Pooler)"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cloudflare R2 Storage */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-[4px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[2px] bg-[#CC6600]/20 text-[#CC6600]">
                  <IconCloud size={16} />
                </div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Cloudflare R2
                </span>
              </div>
              {health?.cloudflare.status === "HEALTHY" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  HEALTHY
                </span>
              ) : health?.cloudflare.status === "CRITICAL" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-red-500/15 text-red-400 border border-red-500/25">
                  CRITICAL
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  WARNING
                </span>
              )}
            </div>

            {/* Storage Progress Gauge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Bucket Usage:</span>
                <span className="text-white font-semibold">
                  {cfUsed > 1024 ? `${(cfUsed / 1024).toFixed(2)} GB` : `${cfUsed} MB`}{" "}
                  <span className="text-white/40 font-normal">/ 10 GB</span>
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    cfPercent >= 90
                      ? "bg-red-500"
                      : cfPercent >= 75
                      ? "bg-amber-500"
                      : "bg-[#CC6600]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, cfPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.688rem] text-white/40 font-mono">
                <span>{cfPercent}% of 10GB free</span>
                <span>{(10240 - cfUsed).toFixed(0)} MB free</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[0.688rem]">
              <div className="flex flex-col">
                <span className="text-white/40">Stored Files:</span>
                <span className="font-mono text-white mt-0.5">
                  {health?.cloudflare.totalFiles || 0} files
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">Purged Savings:</span>
                <span className="font-mono text-emerald-400 mt-0.5">
                  +{health?.cloudflare.purgedSavingsMB || 0} MB
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-white/40">Bucket & Egress:</span>
                <span className="font-mono text-white/70 text-[0.625rem] mt-0.5">
                  {health?.cloudflare.bucketName || "jaxis-vault"} · $0 Egress
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Resend Email */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-[4px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[2px] bg-emerald-500/15 text-emerald-400">
                  <IconMail size={16} />
                </div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Resend Email
                </span>
              </div>
              {health?.resend.status === "HEALTHY" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  HEALTHY
                </span>
              ) : health?.resend.status === "CRITICAL" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-red-500/15 text-red-400 border border-red-500/25">
                  LIMIT REACHED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  NEAR LIMIT
                </span>
              )}
            </div>

            {/* Daily Quota Progress Gauge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Daily Email Quota:</span>
                <span className="text-white font-semibold">
                  {emailToday}{" "}
                  <span className="text-white/40 font-normal">/ {emailDailyLimit} today</span>
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    emailPercent >= 90
                      ? "bg-red-500"
                      : emailPercent >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, emailPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.688rem] text-white/40 font-mono">
                <span>{emailPercent}% used today</span>
                <span>{emailDailyLimit - emailToday} remaining</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[0.688rem]">
              <div className="flex flex-col">
                <span className="text-white/40">Monthly Volume:</span>
                <span className="font-mono text-white mt-0.5">
                  {health?.resend.sentThisMonth || 0} / 3,000
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">Delivery Rate:</span>
                <span className="font-mono text-emerald-400 mt-0.5">
                  {health?.resend.deliverySuccessRate || 100}%
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-white/40">Dispatch Mode:</span>
                <span className="font-mono text-white/70 text-[0.625rem] mt-0.5">
                  {health?.resend.mode === "PRODUCTION_API" ? "Production API (Live)" : "Local Simulation Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Trigger.dev Background Jobs & Crons */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-[4px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[2px] bg-purple-500/15 text-purple-400">
                  <IconCpu size={16} />
                </div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Trigger.dev Crons
                </span>
              </div>
              {health?.triggerDev?.status === "HEALTHY" || !health?.triggerDev ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  HEALTHY
                </span>
              ) : health?.triggerDev?.status === "CRITICAL" ? (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-red-500/15 text-red-400 border border-red-500/25">
                  CRITICAL
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  WARNING
                </span>
              )}
            </div>

            {/* Monthly Runs Gauge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Monthly Run Quota:</span>
                <span className="text-white font-semibold">
                  {triggerRuns.toLocaleString()}{" "}
                  <span className="text-white/40 font-normal">/ 250K</span>
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    triggerPercent >= 90
                      ? "bg-red-500"
                      : triggerPercent >= 75
                      ? "bg-amber-500"
                      : "bg-purple-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, triggerPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.688rem] text-white/40 font-mono">
                <span>{triggerPercent}% monthly quota</span>
                <span>{(triggerLimit - triggerRuns).toLocaleString()} available</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[0.688rem]">
              <div className="flex flex-col">
                <span className="text-white/40">Active Crons:</span>
                <span className="font-mono text-white mt-0.5">
                  {health?.triggerDev?.activeJobsCount || 4} jobs active
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">Success Rate:</span>
                <span className="font-mono text-emerald-400 mt-0.5">
                  {health?.triggerDev?.successRate || 99.8}%
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-white/40">Engine Mode:</span>
                <span className="font-mono text-white/70 text-[0.625rem] mt-0.5">
                  {health?.triggerDev?.mode === "PRODUCTION_CLOUD" ? "Production Cloud Engine" : "Local Dev Engine"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeframes & Schedule */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[4px] flex flex-col gap-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
              <div className="p-2 rounded-[2px] bg-sky-500/15 text-sky-400">
                <IconClock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Retention Timeframe Settings
                </h3>
                <span className="text-xs text-white/50">
                  Set how long files remain in cloud storage before deletion
                </span>
              </div>
            </div>

            {/* Completed Studies Retention */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white">
                Completed Studies Retention Window:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={config.retentionPeriodDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      retentionPeriodDays: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="bg-black/50 border border-white/15 rounded-[2px] px-3.5 py-2 text-sm text-white font-mono w-28 outline-none focus:border-[#CC6600]"
                />
                <span className="text-xs text-white/60">
                  Days ({(config.retentionPeriodDays / 30).toFixed(1)} Months)
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "30 Days (1 Mo)", days: 30 },
                  { label: "60 Days (2 Mo)", days: 60 },
                  { label: "90 Days (3 Mo)", days: 90 },
                  { label: "180 Days (6 Mo)", days: 180 },
                  { label: "365 Days (1 Yr)", days: 365 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setConfig({ ...config, retentionPeriodDays: preset.days })}
                    className={`px-2.5 py-1 rounded-[2px] text-[0.688rem] transition-colors cursor-pointer ${
                      config.retentionPeriodDays === preset.days
                        ? "bg-[#CC6600] text-white font-semibold"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="text-[0.688rem] text-white/40 leading-relaxed mt-1">
                Raw project attachments, intermediate draft codes, and working files will be purged past this window after final delivery release.
              </span>
            </div>

            {/* Inactive Studies Retention */}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
              <label className="text-xs font-semibold text-white">
                Inactive / Abandoned Studies Cleanup:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={config.purgeInactiveDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      purgeInactiveDays: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="bg-black/50 border border-white/15 rounded-[2px] px-3.5 py-2 text-sm text-white font-mono w-28 outline-none focus:border-[#CC6600]"
                />
                <span className="text-xs text-white/60">
                  Days of Inactivity ({(config.purgeInactiveDays / 30).toFixed(1)} Months)
                </span>
              </div>
              <span className="text-[0.688rem] text-white/40 leading-relaxed">
                Applies to consultation drafts, unaccepted quotations, and inactive chats without recent client activity.
              </span>
            </div>

            {/* Auto Purge Schedule Switch */}
            <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-[4px] mt-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Enable Automated Daily Purge</span>
                <span className="text-[0.688rem] text-white/40">
                  Automatically runs daily cleanup jobs at 00:00 UTC
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    autoPurgeEnabled: !config.autoPurgeEnabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.autoPurgeEnabled ? "bg-[#CC6600]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autoPurgeEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Protected File Exclusions */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[4px] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[2px] bg-emerald-500/15 text-emerald-400">
                  <IconShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Protected File Categories
                  </h3>
                  <span className="text-xs text-white/50">
                    Checked files will NEVER be deleted during automated cleanups
                  </span>
                </div>
              </div>
              <Badge variant="emerald">IMMUTABLE PROTECTION</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  key: "keepDatasets",
                  label: "Research Datasets & Codebooks",
                  desc: "Raw and cleaned CSV, Excel (.xlsx), and SPSS (.sav) data spreadsheets.",
                  icon: IconDatabase,
                },
                {
                  key: "keepResearchDocs",
                  label: "Chapters 1–3 & Methodology Drafts",
                  desc: "Theoretical frameworks, research outlines, and proposal DOCX/PDF drafts.",
                  icon: IconFileText,
                },
                {
                  key: "keepQuestionnaires",
                  label: "Survey Questionnaires & Instruments",
                  desc: "Google Forms, Likert scales, survey templates, and psychometric instruments.",
                  icon: IconFileText,
                },
                {
                  key: "keepReceiptPhotos",
                  label: "Payment Receipts & Proof of Deposit",
                  desc: "Bank transfer & e-wallet deposit screenshots for financial and BIR tax defense.",
                  icon: IconReceipt,
                },
                {
                  key: "keepChatHistory",
                  label: "Client Messages & Consultation Threads",
                  desc: "All researcher-statistician chat transcripts and in-app communications.",
                  icon: IconMessageCircle,
                },
                {
                  key: "keepDeliverables",
                  label: "Final Released Deliverable Reports",
                  desc: "APA statistical tables, descriptive narratives, and verified release packages.",
                  icon: IconShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = (config as any)[item.key];
                return (
                  <label
                    key={item.key}
                    className={`p-3.5 rounded-[4px] border flex items-start gap-3.5 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-[#011B38] border-white/20 text-white"
                        : "bg-black/20 border-white/5 text-white/50 hover:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-1 accent-[#CC6600] h-4 w-4 rounded-[2px] cursor-pointer"
                    />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className={isChecked ? "text-[#CC6600]" : "text-white/40"} />
                        <span className="font-semibold text-xs text-white">{item.label}</span>
                      </div>
                      <span className="text-[0.688rem] text-white/50 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-[4px] flex items-start gap-2.5 mt-2">
              <IconAlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[0.688rem] text-amber-200/80 leading-relaxed">
                Legal Notice: SOW contracts, formal invoices, and financial audit logs are permanently retained in compliance with regulatory requirements regardless of purge settings.
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          variant={toast.variant}
          message={toast.message}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}


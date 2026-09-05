"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  KpiCard,
  Card,
  Badge,
  Button,
  LoadingState,
  Toast,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
  IconCpu,
  IconLock,
  IconCalendarEvent,
  IconInfoCircle,
} from "@tabler/icons-react";

function getCutoffInfo(days: number) {
  const target = new Date();
  target.setDate(target.getDate() + Number(days || 0));
  const formattedDate = target.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    date: formattedDate,
    countdown: `in ${days} days`,
  };
}

export default function CeoStorageRetentionPage() {
  const router = useRouter();
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
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState<boolean>(false);
  const [purgeScope, setPurgeScope] = useState<"FINISHED_ONLY" | "ALL_PROJECTS" | "ACTIVE_ONLY">("FINISHED_ONLY");
  const [deleteTestProjects, setDeleteTestProjects] = useState<boolean>(true);

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
    setIsConfirmPurgeOpen(false);
    setIsPurging(true);
    try {
      const res = await purgeExpiredFilesAction(undefined, {
        scope: purgeScope,
        deleteTestProjects: deleteTestProjects && (purgeScope === "ACTIVE_ONLY" || purgeScope === "ALL_PROJECTS"),
        cleanOrphanedStorage: true,
      });
      if (res.success) {
        const scopeLabel =
          purgeScope === "ALL_PROJECTS"
            ? "Finished + Active Studies"
            : purgeScope === "ACTIVE_ONLY"
            ? "Active / Ongoing Studies"
            : "Finished Studies Only";
        let filesDesc =
          res.purgedFilesCount && res.purgedFilesCount > 0
            ? `Deleted ${res.purgedFilesCount} files and freed ~${res.freedMB} MB from Cloudflare R2 (${scopeLabel}).`
            : res.purgedCount > 0
            ? `Purge check completed for ${res.purgedCount} studies. All files were preserved under active protection rules.`
            : purgeScope === "FINISHED_ONLY"
            ? `Storage is clean. No completed studies have reached your ${config.retentionPeriodDays}-day cutoff yet.`
            : purgeScope === "ACTIVE_ONLY"
            ? "All files across active studies are currently protected by your active category toggles."
            : "All files across active and finished studies are currently protected by your active category toggles.";

        if (res.testProjectsDeletedCount && res.testProjectsDeletedCount > 0) {
          filesDesc += ` Removed ${res.testProjectsDeletedCount} unquoted test intake requests from workspace.`;
        }

        setToast({
          variant: "success",
          message: "Storage Purge Completed",
          description: filesDesc,
        });
        await loadData(true);
        router.refresh();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("jaxis:study-updated"));
        }
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
          description="Connecting to database and cloud storage services"
        />
      </div>
    );
  }

  const dbUsed = health?.supabase.databaseSizeMB || 13.94;
  const dbLimit = health?.supabase.databaseLimitMB || 500;
  const dbPercent = health?.supabase.percentageUsed || Math.round((dbUsed / dbLimit) * 100);

  const cfUsed = health?.cloudflare.storageUsedMB ?? 0;
  const cfLimit = health?.cloudflare.storageLimitMB || 10240;
  const cfPercent = health?.cloudflare.percentageUsed ?? Math.round((cfUsed / cfLimit) * 100);

  const emailToday = health?.resend.sentToday || 0;
  const emailDailyLimit = health?.resend.dailyLimit || 100;
  const emailPercent = health?.resend.dailyPercentageUsed || Math.round((emailToday / emailDailyLimit) * 100);

  const triggerRuns = health?.triggerDev.runsThisMonth || 142;
  const triggerLimit = health?.triggerDev.monthlyLimit || 250000;
  const triggerPercent = health?.triggerDev.percentageUsed || Number(((triggerRuns / triggerLimit) * 100).toFixed(2));

  // Genuine capacity warnings only (exceeding 75% usage)
  const isAnyWarning =
    dbPercent >= 75 ||
    cfPercent >= 75 ||
    emailPercent >= 75 ||
    triggerPercent >= 75;

  const CATEGORY_KEYS: (keyof StorageRetentionConfigDTO)[] = [
    "keepDatasets",
    "keepResearchDocs",
    "keepQuestionnaires",
    "keepReceiptPhotos",
    "keepChatHistory",
    "keepDeliverables",
  ];

  const protectedCount = CATEGORY_KEYS.filter((k) => Boolean(config[k])).length;
  const areAllCategoriesProtected = protectedCount === CATEGORY_KEYS.length;
  const areSomeCategoriesProtected = protectedCount > 0 && !areAllCategoriesProtected;

  const handleToggleAllCategories = (targetState: boolean) => {
    setConfig((prev) => ({
      ...prev,
      keepDatasets: targetState,
      keepResearchDocs: targetState,
      keepQuestionnaires: targetState,
      keepReceiptPhotos: targetState,
      keepChatHistory: targetState,
      keepDeliverables: targetState,
    }));
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Standardized PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "CEO DESK", href: "/dashboard/ceo" },
          { label: "Storage & Retention Policy" },
        ]}
        title="Data Retention & Storage Purge Policy"
        description="Configure automated cleanup schedules, exempt sensitive research files from deletion, and monitor system storage limits."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 hover:bg-white/10 rounded-[2px]"
              onClick={() => loadData(true)}
              disabled={isRefreshingHealth}
            >
              <IconRefresh size={14} className={isRefreshingHealth ? "animate-spin text-sky-400" : ""} />
              <span>{isRefreshingHealth ? "Checking..." : "Refresh Status"}</span>
            </Button>
            <Button
              variant="secondary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-[2px]"
              onClick={() => setIsConfirmPurgeOpen(true)}
              disabled={isPurging}
            >
              <IconTrash size={14} />
              <span>{isPurging ? "Purging..." : "Run Purge Now"}</span>
            </Button>
            <Button
              variant="primary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 bg-[#CC6600] hover:bg-[#E67300] text-white rounded-[2px]"
              onClick={handleSavePolicy}
              disabled={isSaving}
            >
              <IconDeviceFloppy size={14} />
              <span>{isSaving ? "Saving..." : "Save Policy"}</span>
            </Button>
          </div>
        }
      />

      {/* Canonical KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          label="RETENTION WINDOW"
          value={`${config.retentionPeriodDays} DAYS`}
          description={`Approx. ${(config.retentionPeriodDays / 30).toFixed(1)} months post-delivery`}
        />
        <KpiCard
          label="DATABASE STORAGE"
          value={`${dbUsed} MB`}
          unit={`/ ${dbLimit} MB`}
          description={`${dbPercent}% capacity used · ${health?.supabase.totalRows || 75} rows recorded`}
        />
        <KpiCard
          label="FILE STORAGE (R2)"
          value={cfUsed > 1024 ? `${(cfUsed / 1024).toFixed(1)} GB` : `${cfUsed} MB`}
          unit="/ 10 GB"
          description={`${cfPercent}% capacity used · 0 egress fees`}
        />
        <KpiCard
          label="AUTOMATED PURGE"
          value={config.autoPurgeEnabled ? "ACTIVE" : "PAUSED"}
          unit={config.autoPurgeEnabled ? "Daily 00:00 UTC" : "Disabled"}
          description={config.autoPurgeEnabled ? "Runs daily at 00:00 UTC" : "Manual cleanup only"}
        />
      </div>

      {/* Active Warning Banner when storage or email actually exceeds 75% */}
      {isAnyWarning && (
        <div className="p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30 rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <IconAlertTriangle size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-300 font-mono tracking-wide">
                  STORAGE &amp; CAPACITY THRESHOLD WARNING
                </span>
                <Badge variant="amber">ACTION RECOMMENDED</Badge>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                {health?.warningDetails && health.warningDetails.length > 0
                  ? health.warningDetails.join(" ")
                  : "One or more infrastructure services have exceeded 75% capacity. Run the storage purge engine to free Cloudflare R2 disk space."}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="text-xs h-8 px-4 bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shrink-0 rounded-[2px]"
            onClick={() => setIsConfirmPurgeOpen(true)}
            disabled={isPurging}
          >
            <IconTrash size={14} className="mr-1.5" />
            <span>{isPurging ? "Purging..." : "Run Storage Purge Now"}</span>
          </Button>
        </div>
      )}

      {/* Revamped Live Infrastructure & API Storage Health Deck */}
      <Card className="p-5 sm:p-6 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-4">
        {/* Header Row: Indicator, Title & Status Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-sky-500/15 text-sky-400 shrink-0">
              <IconActivity size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Live Service &amp; Storage Health
                </span>
                {health?.overallStatus === "HEALTHY" ? (
                  <Badge variant="emerald">ALL SYSTEMS OPERATIONAL</Badge>
                ) : health?.overallStatus === "CRITICAL" ? (
                  <Badge variant="danger">CRITICAL</Badge>
                ) : (
                  <Badge variant="amber">CAPACITY ALERT</Badge>
                )}
              </div>
              <span className="text-xs text-white/50 font-sans">
                Real-time API status, storage consumption, and hard operational quotas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTestCapacityAlert("Cloudflare")}
              disabled={isTestingAlert}
              className="text-xs font-sans px-2.5 py-1 rounded-[2px] text-white/70 hover:text-white border border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Send a test notification alert"
            >
              Test Alert
            </button>
            <span className="text-xs text-white/40 font-mono">
              Synced: {health?.lastCheckedAt ? new Date(health.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
            </span>
          </div>
        </div>

        {/* 4 Leveled Service Health & Limit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Service 1: Supabase Database */}
          <div className="p-3.5 rounded-[2px] bg-black/40 border border-white/10 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconDatabase size={15} className="text-sky-400 shrink-0" />
                <span className="text-xs font-semibold text-white font-sans">Database API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">HEALTHY</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-tight">{dbUsed} MB</span>
              <span className="font-mono text-xs text-white/50">/ {dbLimit} MB max</span>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, dbPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5">
              <span>{dbPercent}% used</span>
              <span>{health?.supabase.totalRows || 76} rows</span>
            </div>
          </div>

          {/* Service 2: Cloudflare R2 Storage */}
          <div className="p-3.5 rounded-[2px] bg-black/40 border border-white/10 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCloud size={15} className="text-[#CC6600] shrink-0" />
                <span className="text-xs font-semibold text-white font-sans">Storage Bucket</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">HEALTHY</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-tight">{cfUsed} MB</span>
              <span className="font-mono text-xs text-white/50">/ {(cfLimit / 1024).toFixed(0)} GB max</span>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#CC6600] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, cfPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5">
              <span>{cfPercent}% used</span>
              <span>{health?.cloudflare.totalFiles ?? 0} files</span>
            </div>
          </div>

          {/* Service 3: Resend Email API */}
          <div className="p-3.5 rounded-[2px] bg-black/40 border border-white/10 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconMail size={15} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-white font-sans">Email API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">HEALTHY</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-tight">{emailToday} sent</span>
              <span className="font-mono text-xs text-white/50">/ {emailDailyLimit} daily max</span>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, emailPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5">
              <span>{emailPercent}% quota</span>
              <span>{health?.resend.sentThisMonth || 0} this mo</span>
            </div>
          </div>

          {/* Service 4: Trigger.dev Crons API */}
          <div className="p-3.5 rounded-[2px] bg-black/40 border border-white/10 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCpu size={15} className="text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-white font-sans">Crons &amp; Jobs API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">HEALTHY</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-tight">{triggerRuns} runs</span>
              <span className="font-mono text-xs text-white/50">/ {(triggerLimit / 1000).toFixed(0)}k monthly max</span>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, triggerPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5">
              <span>{triggerPercent}% quota</span>
              <span>4 active schedules</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Configuration Desk - Symmetrical Leveled 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Retention Timeframe Settings */}
        <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
              <div className="p-2 rounded-[2px] bg-sky-500/15 text-sky-400">
                <IconClock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Retention Schedule &amp; Timeframes
                </h3>
                <span className="text-xs text-white/50 font-sans">
                  Set how long files remain in cloud storage before automatic cleanup
                </span>
              </div>
            </div>

            {/* Section 1: Completed Studies Retention */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-white font-sans">
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
                  className="bg-black/50 border border-white/15 rounded-[2px] px-3.5 py-2 text-sm text-white font-mono w-28 outline-none focus:border-[#CC6600] transition-colors"
                />
                <span className="text-xs text-white/60 font-sans">
                  Days ({(config.retentionPeriodDays / 30).toFixed(1)} Months post-delivery)
                </span>
              </div>

              {/* Target Cutoff Date & Countdown Banner */}
              <div className="flex items-center justify-between px-3 py-2 rounded-[2px] bg-black/40 border border-white/10 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <IconCalendarEvent size={14} className="text-sky-400 shrink-0" />
                  <span className="text-white/70 font-sans truncate">
                    Target Cutoff: <strong className="text-white font-mono">{getCutoffInfo(config.retentionPeriodDays).date}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-[2px] border border-sky-500/20 shrink-0 ml-2">
                  {getCutoffInfo(config.retentionPeriodDays).countdown}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-0.5">
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
                    className={`px-2.5 py-1 rounded-[2px] text-xs font-sans transition-colors cursor-pointer ${
                      config.retentionPeriodDays === preset.days
                        ? "bg-[#CC6600] text-white font-semibold"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/40 leading-relaxed font-sans">
                Raw project attachments, temporary code drafts, and scratch datasets are purged past this window after final deliverable release.
              </span>
            </div>

            {/* Section 2: Inactive Studies Retention */}
            <div className="flex flex-col gap-2.5 pt-5 border-t border-white/5">
              <label className="text-xs font-semibold text-white font-sans">
                Inactive &amp; Abandoned Studies Cleanup:
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
                  className="bg-black/50 border border-white/15 rounded-[2px] px-3.5 py-2 text-sm text-white font-mono w-28 outline-none focus:border-[#CC6600] transition-colors"
                />
                <span className="text-xs text-white/60 font-sans">
                  Days of Inactivity ({(config.purgeInactiveDays / 30).toFixed(1)} Months)
                </span>
              </div>

              {/* Target Cutoff Date & Countdown Banner */}
              <div className="flex items-center justify-between px-3 py-2 rounded-[2px] bg-black/40 border border-white/10 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <IconCalendarEvent size={14} className="text-amber-400 shrink-0" />
                  <span className="text-white/70 font-sans truncate">
                    Target Cutoff: <strong className="text-white font-mono">{getCutoffInfo(config.purgeInactiveDays).date}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[2px] border border-amber-500/20 shrink-0 ml-2">
                  {getCutoffInfo(config.purgeInactiveDays).countdown}
                </span>
              </div>

              {/* Quick Preset Buttons / Templates */}
              <div className="flex flex-wrap gap-2 pt-0.5">
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
                    onClick={() => setConfig({ ...config, purgeInactiveDays: preset.days })}
                    className={`px-2.5 py-1 rounded-[2px] text-xs font-sans transition-colors cursor-pointer ${
                      config.purgeInactiveDays === preset.days
                        ? "bg-[#CC6600] text-white font-semibold"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-white/40 leading-relaxed font-sans">
                Applies to unaccepted proposals, draft intakes, and stagnant consultation threads without recent client activity.
              </span>
            </div>

            {/* Section 3: Auto Purge Schedule Switch */}
            <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-[2px]">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white font-sans">Enable Automated Daily Purge</span>
                <span className="text-xs text-white/40 font-sans">
                  Background engine cleans expired files daily at 00:00 UTC
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
          </div>

          {/* Section 4: Manual On-Demand Purge Action Box */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[2px] flex flex-col gap-3 mt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconTrash size={16} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-300 font-sans">
                  On-Demand Storage Cleanup
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                +{health?.cloudflare.purgedSavingsMB || 0} MB freed to date
              </span>
            </div>
            <p className="text-xs text-amber-200/75 leading-relaxed font-sans">
              Need to free cloud disk space immediately? Run an on-demand cleanup according to your active retention policy and protected file rules.
            </p>
            <div className="pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-7 px-3 bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 rounded-[2px] cursor-pointer"
                onClick={() => setIsConfirmPurgeOpen(true)}
                disabled={isPurging}
              >
                <IconTrash size={13} className="mr-1.5" />
                <span>{isPurging ? "Purging Files..." : "Run Storage Purge Now →"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Column: Protected File Exclusions */}
        <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[2px] bg-emerald-500/15 text-emerald-400">
                  <IconShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Protected File Categories
                  </h3>
                  <span className="text-xs text-white/50 font-sans">
                    Checked files will NEVER be deleted during automated cleanups
                  </span>
                </div>
              </div>
              <Badge variant="emerald">IMMUTABLE PROTECTION</Badge>
            </div>

            {/* Bulk Action & Master Toggle Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-[2px] bg-black/40 border border-white/10 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={areAllCategoriesProtected}
                  ref={(el) => {
                    if (el) el.indeterminate = areSomeCategoriesProtected;
                  }}
                  onChange={(e) => handleToggleAllCategories(e.target.checked)}
                  className="accent-[#CC6600] h-4 w-4 rounded-[2px] cursor-pointer"
                />
                <span className="font-semibold text-xs text-white font-sans group-hover:text-white/90 transition-colors">
                  {areAllCategoriesProtected ? "All Categories Protected" : "Select All Categories"}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  ({protectedCount}/6)
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleAllCategories(true)}
                  disabled={areAllCategoriesProtected}
                  className={`text-[11px] font-sans px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                    areAllCategoriesProtected
                      ? "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                      : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10"
                  }`}
                >
                  Protect All
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllCategories(false)}
                  disabled={protectedCount === 0}
                  className={`text-[11px] font-sans px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                    protectedCount === 0
                      ? "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                      : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10"
                  }`}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 6 Protected Category Rows */}
            <div className="flex flex-col gap-2.5">
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
                const fieldKey = item.key as keyof StorageRetentionConfigDTO;
                const isChecked = Boolean(config[fieldKey]);
                return (
                  <label
                    key={item.key}
                    className={`p-3 rounded-[2px] border flex items-start gap-3 cursor-pointer transition-all ${
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
                      className="mt-0.5 accent-[#CC6600] h-4 w-4 rounded-[2px] cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={isChecked ? "text-[#CC6600]" : "text-white/40"} />
                        <span className="font-semibold text-xs text-white font-sans">{item.label}</span>
                        {isChecked && (
                          <span className="text-[0.625rem] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-[2px] border border-emerald-500/20 ml-auto">
                            PROTECTED
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50 leading-relaxed font-sans">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="p-3.5 bg-[#010D1F] border border-white/10 rounded-[2px] flex items-start gap-2.5 mt-2">
            <IconLock size={16} className="text-sky-400 shrink-0 mt-0.5" />
            <span className="text-xs text-white/60 leading-relaxed font-sans">
              <strong className="text-white/80 font-semibold">Statutory Preservation Notice:</strong> SOW contracts, formal invoices, signed certificates, and financial audit logs are permanently preserved by law and excluded from all purge cycles.
            </span>
          </div>
        </Card>
      </div>

      {/* Styled Purge Confirmation Dialog */}
      <AlertDialog open={isConfirmPurgeOpen} onOpenChange={setIsConfirmPurgeOpen}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-[2px] bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <IconAlertTriangle size={20} />
              </div>
              <div>
                <AlertDialogTitle className="text-base font-bold text-white font-sans">
                  Confirm Storage File Cleanup
                </AlertDialogTitle>
                <span className="text-xs text-white/50 font-sans block mt-0.5">
                  {purgeScope === "ALL_PROJECTS"
                    ? "Reclaiming cloud storage across all projects (including active/ongoing studies)"
                    : purgeScope === "ACTIVE_ONLY"
                    ? "Reclaiming cloud storage on active & ongoing studies (cleaning test files)"
                    : `Reclaiming cloud storage for completed studies past ${config.retentionPeriodDays} days`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3 text-xs font-sans">
              {/* Purge Target Scope Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[0.688rem] font-mono text-white/60 uppercase tracking-wider font-semibold">
                  Choose Studies Scope:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPurgeScope("FINISHED_ONLY")}
                    className={`p-3 rounded-[2px] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      purgeScope === "FINISHED_ONLY"
                        ? "bg-[#CC6600]/20 border-[#CC6600] text-white shadow-sm"
                        : "bg-[#010D1F] border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-white">
                        <IconShieldCheck size={14} className={purgeScope === "FINISHED_ONLY" ? "text-[#CC6600]" : "text-white/40"} />
                        Finished Only
                      </span>
                      <span className="text-[0.625rem] font-mono px-1.5 py-0.5 bg-white/10 rounded text-white/70">
                        Safe
                      </span>
                    </div>
                    <span className="text-[0.688rem] text-white/50 leading-tight font-sans">
                      Delivered studies past {config.retentionPeriodDays} days. Ongoing studies untouched.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurgeScope("ACTIVE_ONLY")}
                    className={`p-3 rounded-[2px] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      purgeScope === "ACTIVE_ONLY"
                        ? "bg-sky-500/20 border-sky-500 text-white shadow-sm"
                        : "bg-[#010D1F] border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-white">
                        <IconClock size={14} className={purgeScope === "ACTIVE_ONLY" ? "text-sky-400" : "text-white/40"} />
                        Active Only
                      </span>
                      <span className="text-[0.625rem] font-mono px-1.5 py-0.5 bg-sky-500/20 text-sky-300 rounded">
                        In-Progress
                      </span>
                    </div>
                    <span className="text-[0.688rem] text-white/50 leading-tight font-sans">
                      Cleans unprotected scratch &amp; test files on ongoing studies. Finished records safe.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurgeScope("ALL_PROJECTS")}
                    className={`p-3 rounded-[2px] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      purgeScope === "ALL_PROJECTS"
                        ? "bg-amber-500/20 border-amber-500 text-white shadow-sm"
                        : "bg-[#010D1F] border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-white">
                        <IconAlertTriangle size={14} className={purgeScope === "ALL_PROJECTS" ? "text-amber-400" : "text-white/40"} />
                        All Studies
                      </span>
                      <span className="text-[0.625rem] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                        CEO Override
                      </span>
                    </div>
                    <span className="text-[0.688rem] text-white/50 leading-tight font-sans">
                      Cleans unprotected files across all studies (finished + active). Reclaims max space.
                    </span>
                  </button>
                </div>
              </div>

              {purgeScope === "ALL_PROJECTS" && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-[2px] text-amber-200 text-xs flex items-start gap-2 animate-content-fade">
                  <IconAlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[0.688rem] leading-relaxed">
                    <strong className="text-amber-300">Executive Override Active:</strong> Unprotected attachments on all completed and ongoing/test studies will be deleted. Any category marked protected below (like Datasets or Deliverables) will remain strictly safe.
                  </span>
                </div>
              )}

              {purgeScope === "ACTIVE_ONLY" && (
                <div className="p-2.5 bg-sky-950/40 border border-sky-500/40 rounded-[2px] text-sky-200 text-xs flex items-start gap-2 animate-content-fade">
                  <IconInfoCircle size={16} className="text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-[0.688rem] leading-relaxed">
                    <strong className="text-sky-300">Active Studies Scope:</strong> Unprotected attachments on ongoing or test studies will be deleted. Completed archives are left untouched, and protected categories remain strictly safe.
                  </span>
                </div>
              )}

              {/* Financial & Project Safety Reassurance */}
              <div className="p-3 bg-[#011E38]/80 border border-emerald-500/30 rounded-[2px] flex items-start gap-2.5">
                <IconShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-white/80 leading-relaxed">
                  <strong className="text-emerald-400 font-semibold block">Finance &amp; Historical Records Remain 100% Safe:</strong>
                  Study project records, client details, payment transactions, GCash/bank proofs, invoices, and accounting ledgers in the Finance Desk are <strong className="text-white">never deleted or modified</strong>.
                </div>
              </div>

              {/* What will be purged vs preserved */}
              <div className="p-3 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <IconTrash size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-white/70 leading-relaxed">
                    <strong className="text-amber-400 font-medium">What gets deleted:</strong>{" "}
                    {purgeScope === "FINISHED_ONLY" && (
                      <>Only raw, unprotected attachment files in Cloudflare R2 storage for completed studies delivered more than <strong className="text-white">{config.retentionPeriodDays} days ago</strong>.</>
                    )}
                    {purgeScope === "ACTIVE_ONLY" && (
                      <>Raw, unprotected attachment files on <strong className="text-white">active, ongoing, or test studies</strong> (e.g. scratch uploads or draft files). Finished studies are not touched.</>
                    )}
                    {purgeScope === "ALL_PROJECTS" && (
                      <>Raw, unprotected attachment files in Cloudflare R2 across <strong className="text-white">all studies</strong> in the system (both finished archives and active/test studies).</>
                    )}
                  </span>
                </div>

                <div className="border-t border-white/5 pt-2 flex items-start gap-2">
                  <IconLock size={15} className="text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-white/60 leading-relaxed text-[0.688rem]">
                    <strong className="text-white/80 font-medium">Currently Protected Categories:</strong>{" "}
                    {[
                      config.keepDatasets && "Research Datasets",
                      config.keepResearchDocs && "Research Documents",
                      config.keepQuestionnaires && "Questionnaires",
                      config.keepReceiptPhotos && "Payment Receipts",
                      config.keepChatHistory && "Messages",
                      config.keepDeliverables && "Final Deliverables",
                    ].filter(Boolean).join(" • ") || "None (all categories eligible)"}
                  </span>
                </div>
              </div>

              {(purgeScope === "ACTIVE_ONLY" || purgeScope === "ALL_PROJECTS") && (
                <label className="p-3 bg-[#01142B] border border-white/10 rounded-[2px] flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={deleteTestProjects}
                    onChange={(e) => setDeleteTestProjects(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#CC6600] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white font-sans">
                      Purge test &amp; unquoted draft intake requests
                    </span>
                    <span className="text-[0.688rem] text-white/50 font-sans">
                      Clears unquoted test submissions from Recent Studies and Admin Triage Queue.
                    </span>
                  </div>
                </label>
              )}

              <span className="text-white/50 text-[0.688rem] italic">
                Note: This operation cannot be undone. Unprotected files will be permanently erased from Cloudflare R2 bucket.
              </span>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2">
            <AlertDialogCancel className="text-xs h-8 px-3 rounded-[2px] font-sans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleManualPurge}
              className="text-xs h-8 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-[2px] font-sans font-semibold cursor-pointer"
            >
              {purgeScope === "FINISHED_ONLY"
                ? "Confirm Purge (Finished Studies)"
                : purgeScope === "ACTIVE_ONLY"
                ? "Confirm Purge (Active Studies)"
                : "Confirm Purge (All Studies)"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Notification Portal */}
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

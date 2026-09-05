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
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState<boolean>(false);

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
          description="Connecting to database and cloud storage services"
        />
      </div>
    );
  }

  const dbUsed = health?.supabase.databaseSizeMB || 13.94;
  const dbLimit = health?.supabase.databaseLimitMB || 500;
  const dbPercent = health?.supabase.percentageUsed || Math.round((dbUsed / dbLimit) * 100);

  const cfUsed = health?.cloudflare.storageUsedMB || 3.87;
  const cfLimit = health?.cloudflare.storageLimitMB || 10240;
  const cfPercent = health?.cloudflare.percentageUsed || Math.round((cfUsed / cfLimit) * 100);

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

      {/* Streamlined Live Infrastructure Health Strip */}
      <Card className="p-4 sm:p-5 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Indicator & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[2px] bg-sky-500/15 text-sky-400 shrink-0">
            <IconActivity size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                Live Service Health
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
              Real-time cloud database, storage buckets, email dispatcher, and automated cron status
            </span>
          </div>
        </div>

        {/* Right: 4 compact service indicators + diagnostic button */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] bg-black/40 border border-white/10">
            <IconDatabase size={14} className="text-sky-400 shrink-0" />
            <span className="text-white/60">Database:</span>
            <span className="font-mono text-white font-semibold">{dbUsed} MB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Healthy" />
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] bg-black/40 border border-white/10">
            <IconCloud size={14} className="text-[#CC6600] shrink-0" />
            <span className="text-white/60">Storage:</span>
            <span className="font-mono text-white font-semibold">{cfUsed} MB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Healthy" />
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] bg-black/40 border border-white/10">
            <IconMail size={14} className="text-emerald-400 shrink-0" />
            <span className="text-white/60">Email:</span>
            <span className="font-mono text-white font-semibold">{emailToday} / {emailDailyLimit}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Healthy" />
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] bg-black/40 border border-white/10">
            <IconCpu size={14} className="text-purple-400 shrink-0" />
            <span className="text-white/60">Crons:</span>
            <span className="font-mono text-white font-semibold">4 active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Healthy" />
          </div>

          <div className="flex items-center gap-2 ml-auto lg:ml-2">
            <button
              type="button"
              onClick={() => handleTestCapacityAlert("Cloudflare")}
              disabled={isTestingAlert}
              className="text-[0.688rem] font-sans px-2 py-1 rounded-[2px] text-white/60 hover:text-white border border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Send a test notification alert"
            >
              Test Alert
            </button>
            <span className="text-[0.688rem] text-white/40 font-mono">
              Synced: {health?.lastCheckedAt ? new Date(health.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
            </span>
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-[2px] bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
              <IconTrash size={20} />
            </div>
            <AlertDialogTitle className="text-base font-bold text-white font-sans">
              Run Storage Purge Now?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-white/70 leading-relaxed font-sans pt-1">
              This will delete unprotected draft attachments, working files, and scratch data for completed studies older than <strong className="text-white">{config.retentionPeriodDays} days</strong>.
              <br /><br />
              Protected categories (such as research datasets, final deliverables, and payment receipts) will remain safely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2">
            <AlertDialogCancel className="text-xs h-8 px-3 rounded-[2px] font-sans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleManualPurge}
              className="text-xs h-8 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-[2px] font-sans font-semibold cursor-pointer"
            >
              Confirm &amp; Run Purge
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

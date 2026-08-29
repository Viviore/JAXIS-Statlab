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
} from "@/features/reporting/actions";
import type { StorageRetentionConfigDTO } from "@/features/reporting/schemas";
import {
  IconDatabase,
  IconShieldCheck,
  IconTrash,
  IconDeviceFloppy,
  IconClock,
  IconFileText,
  IconUsers,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconReceipt,
  IconMessageCircle,
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStorageRetentionConfigAction();
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.error("Failed to load retention settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
        loadConfig();
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
    if (!confirm(`Are you sure you want to trigger storage purge now based on your active ${config.retentionPeriodDays}-day policy?`)) {
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
        <LoadingState variant="page" label="Loading Retention Settings..." description="Querying executive storage governance matrices" />
      </div>
    );
  }

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
        description="Govern post-delivery file retention windows, inactive study timeouts, and protect critical research documents from automated cleanup."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="text-xs h-8 px-3 flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
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
          label="INACTIVE TIMEOUT"
          value={`${config.purgeInactiveDays} DAYS`}
          description="Abandoned draft cleanup threshold"
        />
        <KpiCard
          label="AUTO-PURGE ENGINE"
          value={config.autoPurgeEnabled ? "ACTIVE" : "PAUSED"}
          description={config.autoPurgeEnabled ? "Daily automated background cron" : "Manual execution only"}
        />
        <KpiCard
          label="PROTECTED TYPES"
          value={
            [
              config.keepDatasets,
              config.keepResearchDocs,
              config.keepQuestionnaires,
              config.keepReceiptPhotos,
              config.keepChatHistory,
              config.keepDeliverables,
            ].filter(Boolean).length + " / 6"
          }
          description="Categories excluded from purge"
        />
      </div>

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

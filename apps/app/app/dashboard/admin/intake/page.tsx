"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  KpiCard,
  FilterToolbar,
  StatusBadge,
  Button,
  FormTextarea,
  Modal,
  Alert,
  DropdownMenu,
  Toast,
} from "@repo/ui";
import {
  IconDownload,
  IconEye,
  IconExternalLink,
  IconHelpCircle,
  IconCheck,
  IconCopy,
  IconShieldCheck,
} from "@tabler/icons-react";
import {
  getProjects,
  markIntakeComplete,
  requestMissingInfo,
} from "@/features/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import {
  getFileMeta,
  formatFileCategory,
  triggerFileDownload,
} from "@/lib/file-utils";
import type { ProjectDetailItem } from "@/features/projects/schemas";

export default function AdminIntakeTriagePage() {
  const [projects, setProjects] = useState<ProjectDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedStudyForInspect, setSelectedStudyForInspect] =
    useState<ProjectDetailItem | null>(null);
  const [selectedForMissingInfo, setSelectedForMissingInfo] =
    useState<ProjectDetailItem | null>(null);
  const [missingInfoReasonText, setMissingInfoReasonText] = useState<string>("");
  const [missingInfoError, setMissingInfoError] = useState<string | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "danger";
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getProjects();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (e) {
      console.error("Failed to load intake projects", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter projects based on STATUS dropdown and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Status Filter
      if (selectedStatus === "TRIAGE") {
        if (
          p.masterStatus !== "NEW_REQUEST" &&
          p.masterStatus !== "AWAITING_INFORMATION"
        ) {
          return false;
        }
      } else if (selectedStatus === "NEW_REQUEST") {
        if (p.masterStatus !== "NEW_REQUEST") return false;
      } else if (selectedStatus === "AWAITING_INFORMATION") {
        if (p.masterStatus !== "AWAITING_INFORMATION") return false;
      } else if (selectedStatus === "UNDER_EVALUATION") {
        if (p.masterStatus !== "UNDER_EVALUATION") return false;
      } else if (selectedStatus === "ALL") {
        // View all intakes
      } else if (p.masterStatus !== selectedStatus) {
        return false;
      }

      // 2. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.intakeId.toLowerCase().includes(q) ||
          p.researchTitle.toLowerCase().includes(q) ||
          p.client.fullName.toLowerCase().includes(q) ||
          (p.client.clientProfile?.institutionSchool || "")
            .toLowerCase()
            .includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [projects, selectedStatus, searchQuery]);

  // Comprehensive Master Status & KPI calculations
  const kpis = useMemo(() => {
    const total = projects.length;
    const newRequests = projects.filter(
      (p) => p.masterStatus === "NEW_REQUEST"
    ).length;
    const awaitingInfo = projects.filter(
      (p) => p.masterStatus === "AWAITING_INFORMATION"
    ).length;
    const underEvaluation = projects.filter(
      (p) => p.masterStatus === "UNDER_EVALUATION"
    ).length;

    return {
      total,
      activeTriage: newRequests + awaitingInfo,
      newRequests,
      awaitingInfo,
      underEvaluation,
    };
  }, [projects]);

  const handleMarkComplete = (projectId: string, intakeId: string) => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const res = await markIntakeComplete(projectId);
      if (res.success) {
        setFeedbackMessage(
          `Project ${intakeId} marked complete and transitioned to UNDER_EVALUATION.`
        );
        loadData();
      } else {
        setFeedbackMessage(`Error: ${res.error.message}`);
      }
    });
  };

  const handleRequestMissingInfoSubmit = () => {
    if (!selectedForMissingInfo) return;
    if (
      !missingInfoReasonText.trim() ||
      missingInfoReasonText.trim().length < 5
    ) {
      setMissingInfoError(
        "Please provide a clear description of the missing information (min 5 characters)."
      );
      return;
    }

    setMissingInfoError(null);
    startTransition(async () => {
      const res = await requestMissingInfo({
        projectId: selectedForMissingInfo.id,
        reason: missingInfoReasonText.trim(),
      });

      if (res.success) {
        setFeedbackMessage(
          `Information request sent to ${selectedForMissingInfo.client.fullName} for study ${selectedForMissingInfo.intakeId}.`
        );
        setSelectedForMissingInfo(null);
        setMissingInfoReasonText("");
        loadData();
      } else {
        setMissingInfoError(res.error.message);
      }
    });
  };

  const handleCopyId = (intakeId: string) => {
    navigator.clipboard.writeText(intakeId);
    setCopiedId(intakeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
      {/* ── Page Header ── */}
      <PageHeader
        title="Project Intake Triage & Evaluation Queue"
        description="Evaluate incoming research submissions, verify methodology feasibility, request missing dataset artifacts, and approve complete studies for pricing quotation."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Command", href: "/dashboard/admin" },
          { label: "Intake Triage" },
        ]}
      />

      {feedbackMessage && (
        <Alert
          variant="success"
          onClose={() => setFeedbackMessage(null)}
          className="animate-content-fade"
        >
          {feedbackMessage}
        </Alert>
      )}

      {copiedId && (
        <Alert variant="info" className="animate-content-fade">
          Intake ID <strong className="font-mono">{copiedId}</strong> copied to clipboard.
        </Alert>
      )}

      {/* ── KPI Metrics Ribbon ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label="ACTIVE TRIAGE QUEUE"
          value={kpis.activeTriage}
          variant="amber"
          badge="ACTION REQUIRED"
          badgeColor="amber"
          description="Awaiting administrator evaluation"
        />

        <KpiCard
          label="NEW SUBMISSIONS"
          value={kpis.newRequests}
          variant="sky"
          badge="INITIAL REVIEW"
          badgeColor="sky"
          description="Fresh student & faculty intakes"
        />

        <KpiCard
          label="AWAITING INFO"
          value={kpis.awaitingInfo}
          variant="orange"
          badge="CLIENT ACTION"
          badgeColor="orange"
          description="Clarification or dataset pending"
        />

        <KpiCard
          label="UNDER EVALUATION"
          value={kpis.underEvaluation}
          variant="emerald"
          badge="QUOTATION READY"
          badgeColor="emerald"
          description="Feasibility approved for pricing"
        />
      </div>

      {/* ── Main Triage & Queue Glass Card ── */}
      <Card
        className="p-0 border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#01142B]/90 via-[#010E20]/95 to-[#010A17] shadow-2xl"
        style={{ padding: 0 }}
      >
        {/* Filter Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search study title, client, or JAXIS ID..."
          filters={[
            {
              key: "status",
              label: "STATUS",
              value: selectedStatus,
              defaultValue: "ALL",
              options: [
                { value: "ALL", label: `All Intakes (${kpis.total})` },
                { value: "TRIAGE", label: `Active Triage (${kpis.activeTriage})` },
                { value: "NEW_REQUEST", label: `New Requests (${kpis.newRequests})` },
                { value: "AWAITING_INFORMATION", label: `Awaiting Info (${kpis.awaitingInfo})` },
                { value: "UNDER_EVALUATION", label: `Under Evaluation (${kpis.underEvaluation})` },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setSelectedStatus(value);
          }}
          onClear={() => {
            setSelectedStatus("ALL");
            setSearchQuery("");
          }}
        />

        {/* ── Table Container ── */}
        <div style={{ padding: "1.25rem 1.75rem 1.75rem 1.75rem" }}>
          <div className="w-full overflow-x-auto rounded-[3px] border border-white/[0.08]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Research Study &amp; Intake</th>
                  <th className="w-[200px] whitespace-nowrap">Lead Researcher</th>
                  <th className="w-[140px] whitespace-nowrap">Target Deadline</th>
                  <th className="w-[130px] whitespace-nowrap">Status</th>
                  <th className="w-[120px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-20 text-center text-white/30 font-mono text-xs"
                    >
                      Loading intake queue records...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-20 text-center text-white/30 font-mono text-xs"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl font-mono text-white/20">∅</span>
                        <span className="text-sm font-semibold text-white/70">
                          No Intakes Found
                        </span>
                        <span className="text-xs text-white/40">
                          No research project records match the active filter criteria.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    return (
                      <tr key={p.id} className="group">
                        {/* Research Study & Intake */}
                        <td>
                          <div className="flex flex-col gap-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#FF9433] bg-[#CC6600]/15 border border-[#CC6600]/30 px-2 py-0.5 rounded-[2px] whitespace-nowrap">
                                {p.intakeId}
                              </span>
                              {p.files.length > 0 && (
                                <span className="text-[0.6875rem] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded-[2px] whitespace-nowrap">
                                  {p.files.length} doc{p.files.length === 1 ? "" : "s"}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/dashboard/admin/projects/${p.id}`}
                              className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug"
                              title={p.researchTitle}
                            >
                              {p.researchTitle}
                            </Link>
                            {p.missingInfoReason && p.masterStatus === "AWAITING_INFORMATION" && (
                              <span className="text-[0.6875rem] text-amber-300/80 font-mono line-clamp-1 italic">
                                Pending info: {p.missingInfoReason}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Lead Researcher */}
                        <td>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-[2px] bg-[#011B38] border border-white/[0.10] flex items-center justify-center font-mono font-bold text-[0.6875rem] text-[#CC6600] flex-shrink-0">
                              {p.client.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-semibold text-white group-hover:text-[#CC6600] transition-colors whitespace-nowrap truncate text-[0.8125rem]">
                                {p.client.fullName}
                              </span>
                              <span className="text-[0.6875rem] text-white/40 font-mono whitespace-nowrap truncate max-w-[180px]">
                                {p.client.clientProfile?.institutionSchool ||
                                  p.client.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Target Deadline */}
                        <td className="whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono text-amber-400 font-bold">
                              {new Date(p.deadlineRequested).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" }
                              )}
                            </span>
                            <span className="text-[0.6875rem] text-white/40 font-mono">
                              Requested
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap">
                          <StatusBadge
                            status={p.masterStatus}
                            label={
                              PROJECT_STATUS_LABELS[p.masterStatus] ||
                              p.masterStatus
                            }
                          />
                        </td>

                        {/* Actions */}
                        <td className="text-right whitespace-nowrap">
                          <div className="relative inline-flex items-center justify-end gap-2">
                            {p.masterStatus === "NEW_REQUEST" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  handleMarkComplete(p.id, p.intakeId)
                                }
                                disabled={isPending}
                                className="py-1.5 px-3 h-auto whitespace-nowrap font-mono text-xs tracking-wider"
                              >
                                APPROVE →
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStudyForInspect(p)}
                                className="py-1.5 px-3 h-auto whitespace-nowrap font-mono text-xs tracking-wider"
                              >
                                DETAILS
                              </Button>
                            )}

                            <DropdownMenu
                              items={[
                                {
                                  label: "Quick Overview",
                                  subtitle: "Inspect study scope & files",
                                  icon: <IconEye size={16} stroke={1.5} />,
                                  onClick: () => setSelectedStudyForInspect(p),
                                },
                                {
                                  label: "Full Desk Inspector",
                                  subtitle: "Navigate to dedicated project desk",
                                  icon: <IconExternalLink size={16} stroke={1.5} />,
                                  onClick: () => {
                                    window.location.href = `/dashboard/admin/projects/${p.id}`;
                                  },
                                },
                                {
                                  label: "Request Missing Info",
                                  subtitle: "Solicit artifacts or clarifications",
                                  variant: "warning",
                                  icon: <IconHelpCircle size={16} stroke={1.5} />,
                                  onClick: () => {
                                    setSelectedForMissingInfo(p);
                                    setMissingInfoReasonText(
                                      p.missingInfoReason || ""
                                    );
                                  },
                                },
                                ...(p.masterStatus === "NEW_REQUEST"
                                  ? [
                                      {
                                        label: "Approve & Mark Complete",
                                        subtitle: "Transition to UNDER_EVALUATION",
                                        variant: "success" as const,
                                        icon: <IconCheck size={16} stroke={2} />,
                                        onClick: () =>
                                          handleMarkComplete(p.id, p.intakeId),
                                      },
                                    ]
                                  : []),
                                {
                                  label: "Copy Intake ID",
                                  subtitle: p.intakeId,
                                  dividerBefore: true,
                                  icon: <IconCopy size={16} stroke={1.5} />,
                                  onClick: () => handleCopyId(p.intakeId),
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── 1. Quick Study Overview Modal ── */}
      {selectedStudyForInspect && (
        <Modal
          open={Boolean(selectedStudyForInspect)}
          onClose={() => setSelectedStudyForInspect(null)}
          title={`Intake Evaluation: ${selectedStudyForInspect.intakeId}`}
          description={selectedStudyForInspect.researchTitle}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-white/40">
                Created: {new Date(selectedStudyForInspect.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedStudyForInspect(null)}
                >
                  CLOSE
                </Button>
                <Link
                  href={`/dashboard/admin/projects/${selectedStudyForInspect.id}`}
                >
                  <Button variant="primary">
                    OPEN FULL PROJECT DESK →
                  </Button>
                </Link>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-6 font-sans">
            {/* Researcher & Institution Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 sm:px-7 rounded-[3px] bg-[#011B38] border border-white/10">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                  Lead Researcher
                </span>
                <p className="text-sm font-semibold text-white">
                  {selectedStudyForInspect.client.fullName}
                </p>
                <p className="text-xs text-white/50">
                  {selectedStudyForInspect.client.email}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                  Academic Institution & Program
                </span>
                <p className="text-sm font-semibold text-white">
                  {selectedStudyForInspect.client.clientProfile?.institutionSchool ||
                    "Institution Not Specified"}
                </p>
                <p className="text-xs text-white/50">
                  {selectedStudyForInspect.client.clientProfile?.academicProgram ||
                    "Graduate / Faculty Research"}
                </p>
              </div>
            </div>

            {/* Research Scope & Objectives */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                Core Research Objectives
              </span>
              <p
                className="text-xs text-slate-300 bg-white/[0.02] p-4 rounded-[3px] border border-white/10 leading-relaxed whitespace-pre-wrap"
                style={{ padding: "1rem" }}
              >
                {selectedStudyForInspect.researchObjectives}
              </p>
            </div>

            {/* Research Questions */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                Key Research Questions
              </span>
              <p
                className="text-xs text-slate-300 bg-white/[0.02] p-4 rounded-[3px] border border-white/10 leading-relaxed whitespace-pre-wrap"
                style={{ padding: "1rem" }}
              >
                {selectedStudyForInspect.researchQuestions}
              </p>
            </div>

            {/* Uploaded Artifacts & Files */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                  Submitted Artifacts ({selectedStudyForInspect.files.length})
                </span>
                <span className="font-mono text-[0.625rem] text-emerald-400/80 uppercase flex items-center gap-1">
                  <IconShieldCheck size={12} stroke={2} />
                  Cloud Encrypted
                </span>
              </div>
              {selectedStudyForInspect.files.length === 0 ? (
                <div
                  className="text-xs text-white/40 italic p-4 bg-white/[0.02] border border-white/10 rounded-[3px]"
                  style={{ padding: "1rem" }}
                >
                  No files or dataset packages attached to this intake record.
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                  {selectedStudyForInspect.files.map((file) => {
                    const meta = getFileMeta(file.fileName, file.fileType);
                    const category = formatFileCategory(file.fileCategory);
                    return (
                      <div
                        key={file.id}
                        className="rounded-[2px] bg-[#011C38] border border-white/[0.08] hover:border-white/20 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-[2px] ${meta.theme.bg} ${meta.theme.border} border flex flex-col items-center justify-center flex-shrink-0`}
                          >
                            <span className={`text-[0.625rem] font-mono font-bold uppercase ${meta.theme.text}`}>
                              {meta.ext}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                                {file.fileName}
                              </span>
                              <span
                                className={`text-[0.5625rem] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] border ${category.badgeClass}`}
                              >
                                {category.label}
                              </span>
                            </div>
                            <span className="text-[0.688rem] text-white/40 font-mono">
                              {meta.friendlyType} · {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            triggerFileDownload(file.filePath, file.fileName);
                            setToastMessage({
                              message: "Download Initiated",
                              description: `Transferring "${file.fileName}" to your local device.`,
                              variant: "info",
                            });
                          }}
                          className="px-5 py-2 rounded-[2px] bg-[#CC6600]/20 hover:bg-[#CC6600]/35 text-white border border-[#CC6600]/80 hover:border-[#CC6600] text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                        >
                          <IconDownload size={14} stroke={1.5} className="text-[#FFA040]" />
                          <span>DOWNLOAD</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. Request Missing Information Modal ── */}
      {selectedForMissingInfo && (
        <Modal
          open={Boolean(selectedForMissingInfo)}
          onClose={() => setSelectedForMissingInfo(null)}
          title={`Request Missing Artifacts: ${selectedForMissingInfo.intakeId}`}
          description={selectedForMissingInfo.researchTitle}
          size="lg"
        >
          <div className="flex flex-col gap-6 font-sans">
            <div className="p-5 sm:px-7 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <strong>GOVERNANCE NOTICE:</strong> Specify the missing raw dataset files, validated survey instrument, or statistical scope clarification required from{" "}
              <strong className="text-white">
                {selectedForMissingInfo.client.fullName}
              </strong>
              . Submitting this request will automatically transition the intake to{" "}
              <code className="text-amber-300 font-mono font-bold">
                AWAITING_INFORMATION
              </code>{" "}
              and notify the client.
            </div>

            <FormTextarea
              label="Mandatory Information Request / Missing Items Note"
              required
              rows={4}
              placeholder="e.g. Please attach the raw SPSS / Excel survey responses with column codebook and confirm whether demographic covariates are required in Chapter 4."
              value={missingInfoReasonText}
              onChange={(e) => setMissingInfoReasonText(e.target.value)}
              error={missingInfoError || undefined}
              monoLabel
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedForMissingInfo(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleRequestMissingInfoSubmit}
                loading={isPending}
                disabled={missingInfoReasonText.trim().length < 5}
              >
                SEND REQUEST TO CLIENT →
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

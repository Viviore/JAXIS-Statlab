"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Toast,
} from "@repo/ui";
import {
  IconFileText,
  IconUpload,
  IconHistory,
  IconDownload,
  IconAlertTriangle,
  IconShieldCheck,
  IconMessages,
  IconDatabase,
  IconFiles,
  IconCheck,
  IconClock,
  IconUser,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { ANALYSIS_CATEGORY_METADATA } from "@/lib/analysis-rules";
import { uploadAnalysisFile, getAnalysisFileDownloadUrl } from "../actions";
import { formatFileCategory } from "@/lib/file-utils";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { ScopeCreepModal } from "./ScopeCreepModal";
import { SubmitForQAModal } from "./SubmitForQAModal";
import type { WorkbenchDataDTO } from "../schemas";
import { AnalysisFileCategory } from "@prisma/client";

interface AnalysisWorkbenchDeskProps {
  initialData: WorkbenchDataDTO;
}

export const AnalysisWorkbenchDesk: React.FC<AnalysisWorkbenchDeskProps> = ({ initialData }) => {
  const [data, setData] = useState<WorkbenchDataDTO>(initialData);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("ALL");
  const [isSowExpanded, setIsSowExpanded] = useState<boolean>(true);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<AnalysisFileCategory>(AnalysisFileCategory.EXCEL_WORKBOOK);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Modals
  const [historyCategory, setHistoryCategory] = useState<AnalysisFileCategory | null>(null);
  const [isScopeCreepOpen, setIsScopeCreepOpen] = useState<boolean>(false);
  const [isSubmitQAOpen, setIsSubmitQAOpen] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 200 * 1024 * 1024) {
        setUploadError("File size exceeds the 200MB limit.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // In production, we generate a storage key; for simulation/local we record path
      const storageKey = `analysis/${data.project.id}/${Date.now()}_${selectedFile.name.replace(/\s+/g, "_")}`;

      const res = await uploadAnalysisFile({
        projectId: data.project.id,
        fileName: selectedFile.name,
        filePath: storageKey,
        fileType: selectedFile.type || "application/octet-stream",
        fileSize: selectedFile.size,
        fileCategory: uploadCategory,
        notes: uploadNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        setToastMessage({
          message: `Uploaded ${res.data.fileName} (v${res.data.version})`,
          description: `Analysis file saved as current v${res.data.version}.`,
          variant: "success",
        });

        // Update local file state
        setData((prev) => {
          const updatedFiles = prev.analysisFiles.map((f) =>
            f.fileCategory === uploadCategory ? { ...f, isCurrent: false } : f
          );
          return {
            ...prev,
            project: {
              ...prev.project,
              masterStatus:
                prev.project.masterStatus === "EXPERT_ASSIGNED" ||
                prev.project.masterStatus === "ACTIVE" ||
                prev.project.masterStatus === "QA_REVISION"
                  ? "IN_PROGRESS"
                  : prev.project.masterStatus,
            },
            analysisFiles: [res.data, ...updatedFiles],
          };
        });

        setSelectedFile(null);
        setUploadNotes("");
      } else if (!res.success) {
        setUploadError(res.error.message || "Failed to upload analysis file.");
      }
    } catch {
      setUploadError("An unexpected network error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadingId(fileId);
    try {
      const res = await getAnalysisFileDownloadUrl(fileId);
      if (res.success && res.data) {
        const link = document.createElement("a");
        link.href = res.data;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (!res.success) {
        setToastMessage({
          message: "Download Failed",
          description: res.error.message || "Could not retrieve file download link.",
          variant: "danger",
        });
      }
    } catch {
      setToastMessage({
        message: "Download Error",
        description: "An unexpected error occurred while downloading the file.",
        variant: "danger",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleScopeCreepSuccess = () => {
    setToastMessage({
      message: "Work Halted for Scope Expansion",
      description: "Admin has been notified to prepare a supplemental quotation.",
      variant: "warning",
    });
    setData((prev) => ({
      ...prev,
      project: { ...prev.project, masterStatus: "SCOPE_CREEP_HALTED" },
      canUpload: false,
      uploadDisabledReason: "Work is currently halted due to an active scope creep flag.",
    }));
  };

  const handleSubmitQASuccess = () => {
    setToastMessage({
      message: "Submitted for QA Evaluation",
      description: "Senior QA Lead has received the analytical bundle.",
      variant: "success",
    });
    setData((prev) => ({
      ...prev,
      project: { ...prev.project, masterStatus: "FOR_QA" },
      canUpload: false,
      uploadDisabledReason: "This study is currently submitted for QA evaluation. File uploads are locked.",
    }));
  };

  // Filter current vs filtered files
  const currentFiles = data.analysisFiles.filter((f) => f.isCurrent);
  const displayedFiles = currentFiles.filter((f) => {
    if (selectedCategoryTab === "ALL") return true;
    return f.fileCategory === selectedCategoryTab;
  });

  const isScopeCreepHalted = data.project.masterStatus === "SCOPE_CREEP_HALTED";
  const isForQA = data.project.masterStatus === "FOR_QA";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "STATISTICIAN", href: "/dashboard/statistician" },
          { label: "WORKBENCH", href: `/dashboard/statistician/projects/${data.project.id}/workbench` },
          { label: data.project.intakeId },
        ]}
        title="Statistical Analysis Workbench"
        badge={
          <Badge
            variant={
              isScopeCreepHalted
                ? "danger"
                : isForQA
                ? "sky"
                : data.project.masterStatus === "IN_PROGRESS"
                ? "emerald"
                : "default"
            }
            className="font-mono text-xs px-2.5 py-0.5"
          >
            {data.project.masterStatus}
          </Badge>
        }
        description={data.project.researchTitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/statistician/projects/${data.project.id}/messages`}>
              <Button variant="outline" size="sm" className="rounded-[2px] text-xs gap-1.5 cursor-pointer">
                <IconMessages size={15} stroke={2} className="text-[#38BDF8]" />
                <span>Consultation Thread</span>
              </Button>
            </Link>

            {data.isAssignedStatistician && !isScopeCreepHalted && !isForQA && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsScopeCreepOpen(true)}
                  className="rounded-[2px] text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                >
                  <IconAlertTriangle size={15} stroke={2} />
                  <span>Flag Scope Creep</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSubmitQAOpen(true)}
                  disabled={currentFiles.length === 0}
                  className="rounded-[2px] text-xs font-semibold px-4 gap-1.5 cursor-pointer"
                >
                  <IconShieldCheck size={15} stroke={2} />
                  <span>Submit for QA Review</span>
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* QA Revision Alert Banner (if QA requested corrections) */}
      {data.project.masterStatus === "QA_REVISION" && (
        <div className="p-4 sm:p-5 rounded-[2px] bg-amber-950/40 border border-amber-500/40 flex items-start justify-between gap-4 animate-content-fade">
          <div className="flex items-start gap-3">
            <IconAlertTriangle size={22} stroke={2} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 block text-sm">
                  QA Revisions Required: 24-Hour Turnaround Cycle Active
                </span>
                <Badge variant="amber" className="text-[0.625rem] font-mono">
                  CORRECTIONS_REQUIRED
                </Badge>
              </div>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                The Senior QA Lead has requested analytical or formatting adjustments. Please inspect the scorecard notes, update your scripts/workbooks, upload the new corrected versions below, and re-submit for QA Review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scope Creep Alert Banner (if halted) */}
      {isScopeCreepHalted && (
        <div className="p-4 sm:p-5 rounded-[2px] bg-amber-950/40 border border-amber-500/40 flex items-start justify-between gap-4 animate-content-fade">
          <div className="flex items-start gap-3">
            <IconAlertTriangle size={22} stroke={2} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block text-sm">
                Statistical Work Halted: Scope Expansion Active (RULE_QUO_03)
              </span>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                {data.activeScopeCreep?.flagReason ||
                  "Out-of-scope analysis requirements have been flagged. Administration is currently evaluating a supplemental quotation. Workbench file uploads are locked until resolved."}
              </p>
              {data.activeScopeCreep?.flaggedAt && (
                <span className="text-[0.688rem] font-mono text-white/50 block mt-2">
                  Flagged on {new Date(data.activeScopeCreep.flaggedAt).toLocaleString("en-PH")} by{" "}
                  {data.activeScopeCreep.flaggerName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Status & SLA Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
          <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Client Name</span>
          <span className="text-sm font-semibold text-white truncate">{data.project.clientName}</span>
          <span className="text-[0.688rem] text-white/50">{data.project.clientSchool || "Academic Research"}</span>
        </div>

        <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
          <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Assigned QA Lead</span>
          <span className="text-sm font-semibold text-sky-400 truncate">
            {data.assignment?.qaLeadName || "Unassigned"}
          </span>
          <span className="text-[0.688rem] text-white/50">{data.assignment?.qaLeadEmail || "qa@jaxis.dev"}</span>
        </div>

        <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
          <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Analysis Package</span>
          <span className="text-sm font-semibold text-[#CC6600]">
            {data.project.packageName || "Standard Empirical Analysis"}
          </span>
          <span className="text-[0.688rem] text-white/50">Contract Package Tier</span>
        </div>

        <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
          <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Contractual SLA</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-mono font-bold ${
                data.assignment?.isOverdue
                  ? "text-red-400"
                  : data.assignment?.isUrgent
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {data.assignment?.slaLabel || "Active"}
            </span>
          </div>
          <span className="text-[0.688rem] font-mono text-white/50">
            Due:{" "}
            {data.assignment?.slaDueAt
              ? new Date(data.assignment.slaDueAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Main 2-Column Desk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Scope of Work Reference & Verified Datasets (1 col) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Research Objectives & SOW Card */}
          <Card className="p-6 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconFileText size={18} stroke={2} className="text-[#38BDF8]" />
                <h2 className="text-sm font-bold text-white">Research Scope &amp; SOW</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSowExpanded(!isSowExpanded)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle SOW scope"
              >
                {isSowExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </button>
            </div>

            {isSowExpanded && (
              <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-200">
                <div>
                  <span className="font-semibold text-white/70 block mb-1 font-mono text-[0.688rem] uppercase">
                    Research Questions:
                  </span>
                  <p className="p-3 bg-black/20 rounded-[2px] border border-white/5 whitespace-pre-wrap">
                    {data.project.researchQuestions}
                  </p>
                </div>

                {data.project.hypotheses && (
                  <div>
                    <span className="font-semibold text-white/70 block mb-1 font-mono text-[0.688rem] uppercase">
                      Stated Hypotheses:
                    </span>
                    <p className="p-3 bg-black/20 rounded-[2px] border border-white/5 whitespace-pre-wrap">
                      {data.project.hypotheses}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-white/70 block mb-1 font-mono text-[0.688rem] uppercase">
                    Analytical Objectives:
                  </span>
                  <p className="p-3 bg-black/20 rounded-[2px] border border-white/5 whitespace-pre-wrap">
                    {data.project.researchObjectives}
                  </p>
                </div>

                {data.sow?.deliverables && data.sow.deliverables.length > 0 && (
                  <div>
                    <span className="font-semibold text-white/70 block mb-1 font-mono text-[0.688rem] uppercase">
                      Agreed SOW Deliverables:
                    </span>
                    <ul className="space-y-1.5 p-3 bg-black/20 rounded-[2px] border border-white/5">
                      {data.sow.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/90">
                          <IconCheck size={14} stroke={2.5} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Verified Client Uploaded Files */}
          <Card className="p-6 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <IconFiles size={18} stroke={2} className="text-[#38BDF8]" />
              <h2 className="text-sm font-bold text-white">Client Uploaded Files ({data.clientFiles.length})</h2>
            </div>

            {data.clientFiles.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-xs border border-white/5 rounded-[2px]">
                No client files attached to this study.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.clientFiles.map((file) => {
                  const catMeta = formatFileCategory(file.fileCategory);
                  return (
                    <div
                      key={file.id}
                      className="p-3 bg-black/20 border border-white/5 rounded-[2px] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex flex-col gap-1">
                        <span className="font-medium text-white block truncate">{file.fileName}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[0.625rem] font-mono font-medium px-1.5 py-0.5 rounded-[2px] border inline-block ${catMeta.badgeClass}`}
                          >
                            {catMeta.label}
                          </span>
                          <span className="text-[0.625rem] font-mono text-white/40">
                            {new Date(file.uploadedAt).toLocaleDateString("en-PH")}
                          </span>
                        </div>
                      </div>
                      <a
                        href={file.filePath}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-[2px] transition-colors shrink-0"
                        title="Download Study File"
                      >
                        <IconDownload size={15} stroke={2} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Output File Uploads & Versioned Assets Desk (2 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* File Upload Zone (if allowed) */}
          {data.canUpload ? (
            <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <IconUpload size={20} stroke={2} className="text-[#CC6600]" />
                  <h2 className="text-base font-bold text-white">Upload Statistical Output File</h2>
                </div>
                <span className="text-[0.688rem] font-mono text-white/40">Auto-incrementing version control</span>
              </div>

              {uploadError && (
                <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-[2px] text-xs text-red-200">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white/80">
                      Output Category: <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as AnalysisFileCategory)}
                      disabled={isUploading}
                      className="p-3 bg-[#011B38] border border-white/15 rounded-[2px] text-xs text-white focus:border-[#CC6600] focus:outline-none transition-colors"
                    >
                      {Object.entries(ANALYSIS_CATEGORY_METADATA).map(([key, meta]) => (
                        <option key={key} value={key} className="bg-[#01142B] text-white">
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white/80">
                      Select Script / Output File (Max 200MB): <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="p-2 bg-[#011B38] border border-white/15 rounded-[2px] text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-[2px] file:border-0 file:text-xs file:font-semibold file:bg-[#CC6600] file:text-white hover:file:bg-[#e67300] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white/80">
                    Version Notes &amp; Outlier Adjustments (Optional):
                  </label>
                  <input
                    type="text"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="e.g. Added homoscedasticity diagnostics, resolved outlier sample #42..."
                    maxLength={1000}
                    disabled={isUploading}
                    className="p-3 bg-[#011B38] border border-white/15 rounded-[2px] text-xs text-white placeholder:text-white/30 focus:border-[#CC6600] focus:outline-none transition-colors font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-[0.688rem] text-white/40 font-mono leading-relaxed max-w-md">
                    Supported: SPSS (.sav/.spv), R (.r/.rmd), Python (.py/.ipynb), Excel (.xlsx), Stata (.dta/.do), PDF
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isUploading}
                    disabled={!selectedFile || isUploading}
                    className="rounded-[2px] text-xs font-semibold px-5 py-2 cursor-pointer shrink-0 whitespace-nowrap self-end sm:self-auto"
                  >
                    <IconUpload size={14} stroke={2} className="mr-1.5 shrink-0" />
                    <span>Upload Output File</span>
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="p-4 rounded-[2px] bg-[#01142B] border border-white/10 text-xs text-white/60 flex items-center gap-3">
              <IconAlertTriangle size={18} stroke={1.5} className="text-amber-400 shrink-0" />
              <span>{data.uploadDisabledReason || "Uploads are currently locked for this study."}</span>
            </div>
          )}

          {/* Current Versioned Analysis Files Desk */}
          <Card className="p-6 sm:p-8 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Current Analysis Working Files</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Permanent version-controlled assets for Senior QA evaluation
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab("ALL")}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedCategoryTab === "ALL"
                      ? "bg-[#CC6600] text-white"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  ALL ({currentFiles.length})
                </button>
                {Object.keys(ANALYSIS_CATEGORY_METADATA).map((cat) => {
                  const count = currentFiles.filter((f) => f.fileCategory === cat).length;
                  if (count === 0 && selectedCategoryTab !== cat) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryTab(cat)}
                      className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium transition-colors cursor-pointer ${
                        selectedCategoryTab === cat
                          ? "bg-[#CC6600] text-white"
                          : "bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {cat.replace("_OUTPUT", "").replace("_WORKBOOK", "")} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File List */}
            {displayedFiles.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-[2px] flex flex-col items-center gap-3">
                <IconUpload size={28} stroke={1.5} className="text-white/20" />
                <span>No statistical analysis files uploaded in this category yet.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {displayedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 sm:p-5 rounded-[2px] bg-[#011B38] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="emerald" className="font-mono text-xs font-bold px-2 py-0.5 shrink-0">
                          v{file.version} • CURRENT
                        </Badge>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-sm block truncate">{file.fileName}</span>
                          <span className="text-[0.688rem] font-mono text-white/50">
                            {file.categoryLabel} &bull;{" "}
                            {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : "File"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.versionCount && file.versionCount > 1 ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setHistoryCategory(file.fileCategory)}
                            className="rounded-[2px] text-xs px-3 py-1.5 gap-1.5 cursor-pointer text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
                          >
                            <IconHistory size={14} stroke={2} />
                            <span>{file.versionCount} Versions</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistoryCategory(file.fileCategory)}
                            className="rounded-[2px] text-xs px-2.5 py-1.5 gap-1.5 text-white/50 hover:text-white cursor-pointer"
                          >
                            <IconHistory size={14} stroke={1.5} />
                            <span>History</span>
                          </Button>
                        )}

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownload(file.id, file.fileName)}
                          loading={downloadingId === file.id}
                          className="rounded-[2px] text-xs font-semibold px-4 py-1.5 gap-1.5 cursor-pointer"
                        >
                          <IconDownload size={14} stroke={2} />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>

                    {file.notes && (
                      <div className="p-3 bg-black/25 rounded-[2px] border border-white/5 text-xs text-slate-200 leading-relaxed">
                        <span className="text-[0.625rem] font-mono uppercase text-white/40 block mb-0.5">
                          Version Notes:
                        </span>
                        <p>{file.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 text-[0.688rem] text-white/40 font-mono pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <IconUser size={12} stroke={1.5} />
                        <span>Lead Statistician: {file.statisticianName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconClock size={12} stroke={1.5} />
                        <span>
                          {new Date(file.uploadedAt).toLocaleString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        projectId={data.project.id}
        fileCategory={historyCategory}
        onClose={() => setHistoryCategory(null)}
      />

      {/* Scope Creep Flag Modal */}
      <ScopeCreepModal
        projectId={data.project.id}
        projectTitle={data.project.researchTitle}
        isOpen={isScopeCreepOpen}
        onClose={() => setIsScopeCreepOpen(false)}
        onSuccess={handleScopeCreepSuccess}
      />

      {/* Submit for QA Modal */}
      <SubmitForQAModal
        projectId={data.project.id}
        projectTitle={data.project.researchTitle}
        filesCount={currentFiles.length}
        isOpen={isSubmitQAOpen}
        onClose={() => setIsSubmitQAOpen(false)}
        onSuccess={handleSubmitQASuccess}
      />
    </div>
  );
};

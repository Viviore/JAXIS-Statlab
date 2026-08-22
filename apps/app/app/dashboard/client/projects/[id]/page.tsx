"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import {
  Card,
  StatusBadge,
  Button,
  Alert,
  Modal,
  Toast,
} from "@repo/ui";
import {
  IconDownload,
  IconCheck,
  IconUpload,
  IconCloudUpload,
  IconFileText,
  IconDatabase,
  IconClipboardList,
  IconTrash,
  IconArrowLeft,
  IconUser,
  IconSchool,
  IconBook,
  IconMapPin,
  IconShieldCheck,
  IconSparkles,
  IconCalendarEvent,
  IconNotes,
  IconAtom,
  IconHelpCircle,
  IconClock,
  IconChecklist,
  IconCopy,
} from "@tabler/icons-react";
import { getProjectById, deleteProjectFile, resolveMissingInfo, addProjectFile } from "@/features/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import {
  getFileMeta,
  triggerFileDownload,
} from "@/lib/file-utils";
import type { ProjectDetailItem, ProjectFileItem } from "@/features/projects/schemas";
import type { FileCategory } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STAGES = [
  { id: 1, stepNumber: "01", label: "Intake Submitted", statuses: ["NEW_REQUEST", "AWAITING_INFORMATION"] },
  { id: 2, stepNumber: "02", label: "Feasibility Evaluation", statuses: ["UNDER_EVALUATION"] },
  { id: 3, stepNumber: "03", label: "Quotation & SOW", statuses: ["QUOTE_SENT", "CLIENT_APPROVED", "SOW_PENDING", "SOW_SIGNED"] },
  { id: 4, stepNumber: "04", label: "Active Computation", statuses: ["AWAITING_PAYMENT", "ACTIVE", "EXPERT_ASSIGNED", "IN_PROGRESS", "SLA_PAUSED", "SCOPE_CREEP_HALTED"] },
  { id: 5, stepNumber: "05", label: "QA Peer Review", statuses: ["FOR_QA", "QA_REVISION"] },
  { id: 6, stepNumber: "06", label: "Deliverables Released", statuses: ["DELIVERED", "REVISION_REQUESTED", "CLOSED"] },
];

const CATEGORY_OPTIONS: {
  id: string;
  label: string;
  value: FileCategory;
  desc: string;
  accept: string;
  formatLabel: string;
}[] = [
  {
    id: "DATASET",
    label: "Raw Dataset Matrix",
    value: "DATASET",
    desc: "Excel (.xlsx), CSV, or SPSS data matrix",
    accept: ".xlsx,.xls,.csv,.sav,.dta",
    formatLabel: "XLSX, CSV, SPSS (.SAV) (Max 15MB)",
  },
  {
    id: "PROPOSAL",
    label: "Research Proposal",
    value: "RESEARCH_DOCUMENT",
    desc: "Chapters 1-3 manuscript (.pdf, .docx)",
    accept: ".pdf,.docx,.doc",
    formatLabel: "PDF, DOCX (Max 15MB)",
  },
  {
    id: "QUESTIONNAIRE",
    label: "Survey Questionnaire",
    value: "QUESTIONNAIRE",
    desc: "Survey instruments or interview guides",
    accept: ".pdf,.docx,.doc,.xlsx,.csv",
    formatLabel: "PDF, DOCX, XLSX (Max 15MB)",
  },
  {
    id: "SUPPLEMENTARY",
    label: "Supplementary Dossier",
    value: "RESEARCH_DOCUMENT",
    desc: "Institutional approval or supplementary data",
    accept: ".pdf,.docx,.doc,.xlsx,.csv,.zip",
    formatLabel: "PDF, DOCX, XLSX, ZIP (Max 15MB)",
  },
];

function formatRegion(regionCode?: string | null): string {
  if (!regionCode) return "Not Specified";
  const map: Record<string, string> = {
    NCR: "National Capital Region (NCR)",
    CAR: "Cordillera Administrative Region (CAR)",
    REGION_1: "Region I – Ilocos Region",
    REGION_2: "Region II – Cagayan Valley",
    REGION_3: "Region III – Central Luzon",
    REGION_4A: "Region IV-A – CALABARZON",
    REGION_4B: "Region IV-B – MIMAROPA",
    REGION_5: "Region V – Bicol Region",
    REGION_6: "Region VI – Western Visayas",
    REGION_7: "Region VII – Central Visayas",
    REGION_8: "Region VIII – Eastern Visayas",
    REGION_9: "Region IX – Zamboanga Peninsula",
    REGION_10: "Region X – Northern Mindanao",
    REGION_11: "Region XI – Davao Region",
    REGION_12: "Region XII – SOCCSKSARGEN",
    REGION_13: "Region XIII – Caraga",
    BARMM: "BARMM – Bangsamoro",
  };
  return map[regionCode] || regionCode.replace(/_/g, " ");
}

function getStageIntelligence(status: string): { title: string; desc: string; sla: string; nextAction: string } {
  switch (status) {
    case "NEW_REQUEST":
    case "UNDER_EVALUATION":
      return {
        title: "Feasibility & Methodology Audit",
        desc: "Our Senior Statistical Lead and QA Reviewer are inspecting your research scope, dataset matrix hygiene, and analytical model feasibility.",
        sla: "Quotation & SOW expected within 24–48 hours",
        nextAction: "Review binding SOW & quotation once released by admin desk",
      };
    case "AWAITING_INFORMATION":
      return {
        title: "Action Required: Missing Details",
        desc: "The administration review desk requires additional research artifacts or clarification. Review the administrator note above and attach requested files.",
        sla: "Evaluation paused pending client upload",
        nextAction: "Upload requested research artifacts and click Confirm & Resubmit",
      };
    case "QUOTE_SENT":
    case "CLIENT_APPROVED":
    case "SOW_PENDING":
    case "SOW_SIGNED":
      return {
        title: "Quotation & Scope of Work (SOW)",
        desc: "Your research quotation and analytical methodology roadmap are ready. Authorize the SOW to lock in your dedicated statistical specialist.",
        sla: "Awaiting client confirmation & milestone downpayment",
        nextAction: "Authorize SOW terms and deposit initial escrow milestone",
      };
    case "AWAITING_PAYMENT":
    case "ACTIVE":
    case "EXPERT_ASSIGNED":
    case "IN_PROGRESS":
      return {
        title: "Active Computational Run",
        desc: "Your assigned lead statistician is executing code pipelines (R / Python / SPSS) and formatting empirical results into publication-ready APA 7th tables.",
        sla: "Computational models running on schedule",
        nextAction: "Monitor live computation progress in your study timeline",
      };
    case "FOR_QA":
    case "QA_REVISION":
      return {
        title: "Dual-Blind Peer Verification",
        desc: "A Senior QA Lead is independently recalculating statistical tests and inspecting effect sizes to ensure 100% defense accuracy.",
        sla: "Peer verification gate in progress",
        nextAction: "QA verification underway prior to deliverable release",
      };
    case "DELIVERED":
    case "CLOSED":
      return {
        title: "Deliverables Released & Sealed",
        desc: "All Chapter 4 findings, annotated syntax notebooks, and verified statistical tables are validated and ready in your deliverable vault.",
        sla: "Deliverables available for permanent download",
        nextAction: "Download verified APA 7th tables and syntax scripts below",
      };
    default:
      return {
        title: "Telemetry Monitored",
        desc: "Your research project is continuously monitored under JAXIS StatLab statistical integrity governance.",
        sla: "Monitored in real time",
        nextAction: "Track live study progress and milestone updates",
      };
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "DATASET":
      return {
        icon: <IconDatabase size={16} stroke={1.5} className="text-white/70" />,
        tagLabel: "RAW DATASET",
      };
    case "QUESTIONNAIRE":
      return {
        icon: <IconClipboardList size={16} stroke={1.5} className="text-white/70" />,
        tagLabel: "SURVEY INSTRUMENT",
      };
    default:
      return {
        icon: <IconFileText size={16} stroke={1.5} className="text-white/70" />,
        tagLabel: "RESEARCH DOCUMENT",
      };
  }
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

export default function ClientProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "success" | "danger" | "info";
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // File deletion & resolution state
  const [fileToDelete, setFileToDelete] = useState<ProjectFileItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isResolving, startResolveTransition] = useTransition();

  // File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("DATASET");
  const [uploadCategory, setUploadCategory] = useState<FileCategory>("DATASET");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      setError(null);
      const res = await getProjectById(projectId);
      if (res.success) {
        setProject(res.data);
      } else {
        setError(res.error.message);
      }
      setIsLoading(false);
    }
    loadProject();
  }, [projectId]);

  const getStageIndex = (status: string) => {
    for (let i = 0; i < STAGES.length; i++) {
      if (STAGES[i]!.statuses.includes(status)) {
        return i;
      }
    }
    return 0;
  };

  const activeStageIdx = project ? getStageIndex(project.masterStatus) : 0;

  const handleCopyId = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.intakeId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDeleteFile = () => {
    if (!fileToDelete || !project) return;

    startDeleteTransition(async () => {
      const res = await deleteProjectFile(project.id, fileToDelete.id);
      if (res.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                files: prev.files.filter((f) => f.id !== fileToDelete.id),
              }
            : null
        );
        setToastMessage({
          message: "Document Removed",
          description: `Document "${fileToDelete.fileName}" was removed from the study registry.`,
          variant: "success",
        });
        setFileToDelete(null);
      } else {
        setToastMessage({
          message: "Failed to Remove Document",
          description: res.error.message,
          variant: "danger",
        });
        setFileToDelete(null);
      }
    });
  };

  const handleDownloadFile = (filePath: string, fileName: string) => {
    triggerFileDownload(filePath, fileName);
    setToastMessage({
      message: "Download Initiated",
      description: `Transferring "${fileName}" to your local device.`,
      variant: "info",
    });
  };

  const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB Storage Defense Limit

  const handleUploadFile = () => {
    if (!selectedUploadFile || !project) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (selectedUploadFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("File exceeds maximum allowed limit of 15MB. Please compress or optimize your dataset/document.");
      return;
    }

    setUploadError(null);
    startUploadTransition(async () => {
      const res = await addProjectFile(project.id, {
        fileName: selectedUploadFile.name,
        filePath: `uploads/${selectedUploadFile.name}`,
        fileType: selectedUploadFile.type || "application/octet-stream",
        fileCategory: uploadCategory,
      });

      if (res.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                files: [...prev.files, res.data],
              }
            : null
        );
        setToastMessage({
          message: "Document Attached",
          description: `"${selectedUploadFile.name}" attached successfully to your study registry.`,
          variant: "success",
        });
        setSelectedUploadFile(null);
        setIsUploadModalOpen(false);
      } else {
        setUploadError(res.error.message);
      }
    });
  };

  const handleResolveMissingInfo = () => {
    if (!project) return;
    setError(null);
    startResolveTransition(async () => {
      const res = await resolveMissingInfo(project.id);
      if (res.success) {
        setProject(res.data);
        setToastMessage({
          message: "Information Request Resolved",
          description: "Study resubmitted for administration evaluation.",
          variant: "success",
        });
      } else {
        setError(res.error.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Link href="/dashboard/client/projects" className="hover:text-white transition-colors">← Back to My Studies</Link>
        </div>
        <Card className="p-8 animate-pulse flex flex-col gap-4 bg-[#01142B]/90 border-white/[0.08]">
          <div className="h-4 bg-white/10 w-1/4 rounded-[2px]" />
          <div className="h-8 bg-white/10 w-2/3 rounded-[2px]" />
          <div className="h-20 bg-white/10 w-full rounded-[2px]" />
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Link href="/dashboard/client/projects" className="hover:text-white transition-colors">← Back to My Studies</Link>
        </div>
        <Card className="p-8 text-center flex flex-col items-center gap-4 bg-[#01142B]/90 border-white/[0.08]">
          <p className="text-sm text-red-400 font-mono">
            {error || "The requested research project could not be found or you lack permission to view it."}
          </p>
          <Link href="/dashboard/client/projects">
            <Button variant="secondary" size="md">
              ← Return to Projects Registry
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isPreSow =
    project.masterStatus === "NEW_REQUEST" ||
    project.masterStatus === "AWAITING_INFORMATION" ||
    project.masterStatus === "UNDER_EVALUATION" ||
    project.masterStatus === "QUOTE_SENT" ||
    project.masterStatus === "CLIENT_APPROVED" ||
    project.masterStatus === "SOW_PENDING";

  const stageIntel = getStageIntelligence(project.masterStatus);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      {/* ── Unified Telemetry Header & Progress Console ── */}
      <Card className="p-6 md:p-8 bg-[#01142B]/95 border-white/[0.10] shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Top Bar: Back Link + Breadcrumbs + Interactive ID + Status Badge */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/[0.08] pb-4">
          <Link
            href="/dashboard/client/projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-white/60 hover:text-[#CC6600] transition-colors uppercase tracking-wider group"
          >
            <IconArrowLeft size={14} stroke={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to My Studies</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Interactive 1-Click Copy Study Identifier */}
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy Study ID"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#CC6600] bg-[#CC6600]/15 hover:bg-[#CC6600]/25 border border-[#CC6600]/40 px-2.5 py-1 rounded-[2px] tracking-wider transition-all cursor-pointer"
            >
              {copiedId ? (
                <>
                  <IconCheck size={13} stroke={2.5} className="text-emerald-400" />
                  <span className="text-emerald-400">COPIED!</span>
                </>
              ) : (
                <>
                  <span>{project.intakeId}</span>
                  <IconCopy size={13} stroke={1.5} className="opacity-60" />
                </>
              )}
            </button>

            <StatusBadge
              status={project.masterStatus}
              label={PROJECT_STATUS_LABELS[project.masterStatus] || project.masterStatus}
              pulse={project.masterStatus === "IN_PROGRESS" || project.masterStatus === "FOR_QA"}
            />
          </div>
        </div>

        {/* Middle Section: Research Title & Target Deadline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 min-w-0 max-w-3xl">
            <div className="flex items-center gap-2 text-[0.688rem] font-mono text-white/50 uppercase">
              <span className="text-[#CC6600] font-bold">RESEARCH STUDY</span>
              <span>•</span>
              <span>
                SUBMITTED ON{" "}
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight leading-snug break-words">
              {project.researchTitle}
            </h1>
          </div>

          {/* Target Milestone Counter Box */}
          <div className="flex items-center gap-3.5 bg-[#010D1F] border border-white/[0.08] hover:border-white/[0.15] px-4 py-3 rounded-[2px] flex-shrink-0 self-start md:self-auto shadow-sm transition-colors">
            <div className="h-9 w-9 rounded-[2px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <IconCalendarEvent size={18} stroke={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                Target Defense Deadline
              </span>
              <span className="text-sm font-mono font-bold text-amber-300">
                {new Date(project.deadlineRequested).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Connected Linear Pipeline Stepper */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <IconSparkles size={14} stroke={1.5} className="text-[#CC6600]" />
              <span className="text-white/90 font-bold tracking-wider">Statistical Lifecycle Progress</span>
            </div>
            <div className="text-[0.625rem] font-mono uppercase text-white/50 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-[2px] flex items-center gap-1.5">
              <span>Stage {activeStageIdx + 1} of {STAGES.length}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{STAGES[activeStageIdx]?.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {STAGES.map((stage, idx) => {
              const isPast = idx < activeStageIdx;
              const isCurrent = idx === activeStageIdx;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-[2px] border transition-all flex flex-col gap-1.5 ${
                    isCurrent
                      ? "bg-[#CC6600]/15 border-[#CC6600] text-white shadow-sm ring-1 ring-[#CC6600]/40"
                      : isPast
                      ? "bg-white/[0.03] border-white/[0.10] text-white/85"
                      : "bg-[#010D1F]/50 border-white/[0.05] text-white/35"
                  }`}
                >
                  <div className="flex items-center justify-between text-[0.625rem] font-mono">
                    <span className="font-bold opacity-60">{stage.stepNumber}</span>
                    {isPast ? (
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                        <IconCheck size={10} stroke={2.5} /> DONE
                      </span>
                    ) : isCurrent ? (
                      <span className="text-amber-400 font-bold animate-pulse">● ACTIVE</span>
                    ) : null}
                  </div>
                  <span className="font-mono text-[0.688rem] font-bold uppercase tracking-wider truncate">
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* ── Missing Information Banner (if AWAITING_INFORMATION) ── */}
      {project.masterStatus === "AWAITING_INFORMATION" && (
        <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-500/[0.04] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
              Missing Information Requested by Administration Desk
            </h3>
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-sans bg-black/40 p-4 rounded-[2px] border border-white/[0.08]">
            &ldquo;{project.missingInfoReason || "Please review and attach the required dataset or questionnaire."}&rdquo;
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-amber-500/20">
            <p className="text-[0.688rem] text-white/50 font-mono">
              Review your research scope and attached files below, then confirm resubmission.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResolveMissingInfo}
              loading={isResolving}
              className="py-1.5 px-4 font-mono text-xs font-bold tracking-wider whitespace-nowrap"
            >
              CONFIRM &amp; RESUBMIT STUDY FOR EVALUATION →
            </Button>
          </div>
        </Card>
      )}

      {/* ── LEVEL ROW 1: Research Problem & Stage Intelligence ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left (2 cols): Research Problem & Objectives Dossier (3-Column Bento Grid) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="p-6 md:p-7 bg-[#01142B]/90 border-white/[0.08] flex flex-col justify-between h-full gap-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <IconNotes size={18} stroke={1.5} className="text-white/60" />
                <h2 className="text-base font-bold text-white font-sans">
                  Research Problem &amp; Objectives
                </h2>
              </div>
              <span className="text-[0.625rem] font-mono uppercase font-bold text-white/60 bg-white/[0.04] border border-white/[0.10] px-2 py-0.5 rounded-[2px] tracking-wider">
                METHODOLOGY BLUEPRINT
              </span>
            </div>

            {/* 3-Column Tactical Bento Grid (Clean Monochrome) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1">
              {/* Column 1: Core Research Questions */}
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex flex-col gap-2.5 h-full">
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/[0.06]">
                  <span className="text-[0.688rem] font-mono uppercase text-white/80 font-bold tracking-wider flex items-center gap-1.5">
                    <IconHelpCircle size={14} stroke={1.5} className="text-white/50" />
                    <span>01 · Inquiries</span>
                  </span>
                  <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-semibold">
                    QUESTIONS
                  </span>
                </div>
                <div className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans flex-1">
                  {project.researchQuestions || (
                    <span className="italic text-white/40">No specific research questions provided.</span>
                  )}
                </div>
              </div>

              {/* Column 2: Research Objectives */}
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex flex-col gap-2.5 h-full">
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/[0.06]">
                  <span className="text-[0.688rem] font-mono uppercase text-white/80 font-bold tracking-wider flex items-center gap-1.5">
                    <IconNotes size={14} stroke={1.5} className="text-white/50" />
                    <span>02 · Objectives</span>
                  </span>
                  <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-semibold">
                    TARGETS
                  </span>
                </div>
                <div className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans flex-1">
                  {project.researchObjectives || (
                    <span className="italic text-white/40">No specific research objectives provided.</span>
                  )}
                </div>
              </div>

              {/* Column 3: Theoretical Hypotheses */}
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex flex-col gap-2.5 h-full">
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/[0.06]">
                  <span className="text-[0.688rem] font-mono uppercase text-white/80 font-bold tracking-wider flex items-center gap-1.5">
                    <IconAtom size={14} stroke={1.5} className="text-white/50" />
                    <span>03 · Hypotheses</span>
                  </span>
                  <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-semibold">
                    FRAMEWORK
                  </span>
                </div>
                <div className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans flex-1">
                  {project.hypotheses ? (
                    project.hypotheses
                  ) : (
                    <span className="italic text-white/40">
                      No theoretical hypotheses specified during initial intake submission.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right (1 col): Stage Intelligence (Level with Left Card) */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="p-6 md:p-7 bg-[#01142B]/90 border-white/[0.08] flex flex-col justify-between h-full gap-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-2">
                <IconSparkles size={16} stroke={1.5} className="text-[#CC6600]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Stage Intelligence
                </h3>
              </div>
              <span className="text-[0.625rem] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5 tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE TELEMETRY
              </span>
            </div>

            {/* Current Focus Block */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.625rem] font-mono uppercase text-[#FFA040] font-bold tracking-wider">
                    CURRENT FOCUS
                  </span>
                  <span className="text-[0.625rem] font-mono text-white/40 uppercase">
                    STAGE 0{activeStageIdx + 1}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-sans tracking-tight leading-snug">
                  {stageIntel.title}
                </h4>
                <p className="text-xs text-white/65 leading-relaxed font-sans mt-0.5">
                  {stageIntel.desc}
                </p>
              </div>

              {/* Next Client Action Directive */}
              <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono uppercase text-white/60 font-bold tracking-wider">
                  <IconChecklist size={13} stroke={1.75} className="text-[#CC6600]" />
                  <span>Next Action Directive</span>
                </div>
                <p className="text-xs font-semibold text-white/90 font-sans leading-relaxed">
                  {stageIntel.nextAction}
                </p>
              </div>
            </div>

            {/* Estimated SLA & Turnaround Footer (Full Width, No Truncation) */}
            <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex items-start gap-3 mt-auto">
              <div className="h-8 w-8 rounded-[2px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <IconClock size={15} stroke={1.75} />
              </div>
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                  Target Turnaround Window
                </span>
                <span className="text-xs font-mono font-semibold text-amber-300 leading-relaxed break-words">
                  {stageIntel.sla}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── LEVEL ROW 2: Attached Datasets & Institutional Dossier ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left (2 cols): Attached Documents & Datasets (Tactical Table & Dropzone Registry) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="p-6 md:p-8 bg-[#01142B]/90 border-white/[0.08] flex flex-col justify-between h-full gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
              <div>
                <h2 className="text-base font-bold text-white font-sans flex items-center gap-2.5">
                  <IconDatabase size={18} stroke={1.5} className="text-white/60" />
                  <span>Attached Research Documents &amp; Datasets</span>
                </h2>
                <p className="text-xs text-white/50 mt-1 font-mono">
                  {project.files.length} verified artifact(s) registered for statistical computation
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {isPreSow && (
                  <span className="text-[0.688rem] font-mono text-white/60 bg-white/[0.04] border border-white/[0.10] px-2.5 py-1 rounded-[2px] whitespace-nowrap">
                    PRE-SOW EDITABLE
                  </span>
                )}
              </div>
            </div>

            {/* Document Registry Table */}
            {project.files.length === 0 ? (
              <div
                onClick={() => {
                  setSelectedUploadFile(null);
                  setUploadError(null);
                  setIsUploadModalOpen(true);
                }}
                className="border-2 border-dashed border-white/15 hover:border-[#CC6600]/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-10 rounded-[2px] flex flex-col items-center justify-center gap-3 cursor-pointer text-center group flex-1 my-2"
              >
                <div className="h-11 w-11 rounded-full bg-white/[0.05] group-hover:bg-[#CC6600]/15 flex items-center justify-center text-white/50 group-hover:text-amber-400 transition-colors text-lg font-mono">
                  <IconUpload size={20} stroke={1.5} />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 font-sans">
                  No files attached yet. Click to upload research files or datasets.
                </span>
                <span className="text-[0.688rem] text-white/40 font-mono">
                  Accepts PDF, DOCX, XLSX, CSV, SPSS (.sav) up to 15MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                {/* Table Header Bar */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 sm:px-8 py-2 text-[0.625rem] font-mono uppercase text-white/40 font-bold border-b border-white/[0.06] mb-1">
                  <div className="col-span-6">Artifact Document</div>
                  <div className="col-span-3">Classification</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                {/* File Rows with Expanded Left and Right Padding */}
                <div className="flex flex-col gap-3">
                  {project.files.map((file) => {
                    const ext = getFileExtension(file.fileName);
                    const categoryInfo = getCategoryIcon(file.fileCategory);
                    const meta = getFileMeta(file.fileName, file.fileType);

                    return (
                      <div
                        key={file.id}
                        className="py-4 px-6 sm:px-8 rounded-[2px] bg-[#010D1F] border border-white/[0.08] hover:border-white/[0.18] transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center group"
                      >
                        {/* Column 1: Extension Badge + Name */}
                        <div className="col-span-1 sm:col-span-6 flex items-center gap-3.5 min-w-0">
                          <div className="h-8 px-2.5 rounded-[2px] bg-white/[0.05] border border-white/[0.10] flex items-center justify-center font-mono text-[0.688rem] font-bold text-white/80 flex-shrink-0 tracking-wider">
                            {ext}
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span
                              className="text-xs font-bold text-white truncate font-sans group-hover:text-[#CC6600] transition-colors"
                              title={file.fileName}
                            >
                              {file.fileName}
                            </span>
                            <span className="text-[0.688rem] text-white/40 font-mono">
                              {meta.friendlyType} · {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Classification Tag */}
                        <div className="col-span-1 sm:col-span-3 flex items-center">
                          <span className="text-[0.625rem] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-[2px] bg-white/[0.04] text-white/70 border border-white/[0.08] whitespace-nowrap inline-flex items-center gap-1.5">
                            {categoryInfo.icon}
                            <span>{categoryInfo.tagLabel}</span>
                          </span>
                        </div>

                        {/* Column 3: Actions Cluster */}
                        <div className="col-span-1 sm:col-span-3 flex items-center justify-start sm:justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file.filePath, file.fileName)}
                            className="px-4 py-1.5 rounded-[2px] bg-white/[0.06] hover:bg-[#CC6600]/20 text-white/90 hover:text-white border border-white/[0.12] hover:border-[#CC6600]/50 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
                          >
                            <IconDownload size={13} stroke={1.5} className="text-white/70 group-hover:text-amber-400" />
                            <span>DOWNLOAD</span>
                          </button>

                          {isPreSow && (
                            <button
                              type="button"
                              onClick={() => setFileToDelete(file)}
                              title={`Remove ${file.fileName}`}
                              className="p-2 rounded-[2px] text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-white/10 hover:border-red-500/30"
                            >
                              <IconTrash size={14} stroke={1.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Quick-Dropzone Strip */}
                {isPreSow && (
                  <div
                    onClick={() => {
                      setSelectedUploadFile(null);
                      setUploadError(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="border border-dashed border-white/15 hover:border-[#CC6600]/60 bg-white/[0.01] hover:bg-white/[0.03] py-3.5 px-6 sm:px-8 rounded-[2px] flex items-center justify-center gap-2.5 text-xs font-mono text-white/50 hover:text-white transition-all cursor-pointer mt-4 group/drop"
                  >
                    <IconUpload size={14} stroke={1.5} className="text-white/40 group-hover/drop:text-[#CC6600] transition-colors" />
                    <span>Drop additional research files or click to attach (PDF, DOCX, XLSX, CSV, SPSS up to 15MB)</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right (1 col): Institutional Dossier & Governance (Level with Left Card) */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="p-6 md:p-7 bg-[#01142B]/90 border-white/[0.08] flex flex-col justify-between h-full gap-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-2">
                <IconSchool size={16} stroke={1.5} className="text-white/60" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Institutional Dossier
                </h3>
              </div>
              <span className="text-[0.625rem] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5 tracking-wider">
                <IconShieldCheck size={12} stroke={2} />
                VERIFIED
              </span>
            </div>

            {/* Dossier Structured Data Rows */}
            <div className="flex flex-col gap-2.5 text-xs flex-1">
              {/* Row 1: Lead Researcher */}
              <div className="p-3 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.12] transition-colors">
                <div className="h-7 w-7 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 flex-shrink-0 mt-0.5">
                  <IconUser size={14} stroke={1.5} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                    Lead Researcher
                  </span>
                  <span className="text-xs font-bold text-white font-sans mt-0.5 truncate">
                    {project.client.fullName}
                  </span>
                  <span className="text-[0.688rem] text-white/40 font-mono truncate">
                    {project.client.email}
                  </span>
                </div>
              </div>

              {project.client.clientProfile && (
                <>
                  {/* Row 2: Institution / University */}
                  <div className="p-3 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.12] transition-colors">
                    <div className="h-7 w-7 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 flex-shrink-0 mt-0.5">
                      <IconSchool size={14} stroke={1.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                        Institution / University
                      </span>
                      <span className="text-xs font-bold text-white font-sans mt-0.5 leading-snug">
                        {project.client.clientProfile.institutionSchool}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Academic Program */}
                  <div className="p-3 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.12] transition-colors">
                    <div className="h-7 w-7 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 flex-shrink-0 mt-0.5">
                      <IconBook size={14} stroke={1.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                        Academic Program
                      </span>
                      <span className="text-xs font-bold text-white font-sans mt-0.5 leading-snug">
                        {project.client.clientProfile.academicProgram}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Institutional Region */}
                  <div className="p-3 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.12] transition-colors">
                    <div className="h-7 w-7 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 flex-shrink-0 mt-0.5">
                      <IconMapPin size={14} stroke={1.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                        Institutional Region
                      </span>
                      <span className="text-xs font-bold text-white font-sans mt-0.5 leading-snug">
                        {formatRegion(project.client.clientProfile.region)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quality & Governance Seal (Aligned to Bottom) */}
            <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex flex-col gap-1 mt-auto">
              <div className="flex items-center gap-1.5 text-[0.625rem] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                <IconShieldCheck size={14} stroke={1.75} />
                <span>JAXIS Peer Review Standard</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans mt-0.5">
                Every output is independently calculated and verified by a Senior QA Lead for APA 7th compliance.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <Modal
          open={Boolean(fileToDelete)}
          onClose={() => setFileToDelete(null)}
          title="Remove Attached Document"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteFile}
                loading={isDeleting}
              >
                Confirm Delete
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Are you sure you want to remove{" "}
              <strong className="text-white font-mono">{fileToDelete.fileName}</strong> from this study?
            </p>
          </div>
        </Modal>
      )}

      {/* File Upload Modal (Tactical Ingestion Console) */}
      {isUploadModalOpen && (
        <Modal
          open={isUploadModalOpen}
          onClose={() => {
            if (!isUploading) {
              setIsUploadModalOpen(false);
              setSelectedUploadFile(null);
              setUploadError(null);
            }
          }}
          title="Upload Research Document or Dataset"
          description="Attach updated proposal manuscripts, questionnaires, or raw dataset matrices to your study registry."
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
              >
                CANCEL
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadFile}
                loading={isUploading}
                disabled={!selectedUploadFile || isUploading}
                className="font-mono text-xs font-bold tracking-wider"
              >
                CONFIRM &amp; ATTACH FILE →
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6 text-xs font-sans">
            {uploadError && <Alert variant="danger">{uploadError}</Alert>}

            {/* Step 1: Category Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.08] text-white font-mono text-[0.625rem] font-bold">
                    01
                  </span>
                  <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Classification Category
                  </label>
                </div>
                <span className="text-[0.625rem] font-mono uppercase text-white/40 font-semibold">REQUIRED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = selectedCategoryId === opt.id;
                  const categoryMeta = getCategoryIcon(opt.value);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(opt.id);
                        setUploadCategory(opt.value);
                      }}
                      className={`p-3.5 sm:p-4 rounded-[2px] border text-left transition-all flex items-start gap-3.5 cursor-pointer group ${
                        isSelected
                          ? "bg-[#CC6600]/15 border-[#CC6600] text-white shadow-sm ring-1 ring-[#CC6600]/50"
                          : "bg-white/[0.02] border-white/[0.08] text-white/70 hover:bg-white/[0.05] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-[2px] flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#CC6600]/25 text-[#FFA040]"
                            : "bg-white/[0.04] text-white/50 group-hover:text-white group-hover:bg-white/[0.08]"
                        }`}
                      >
                        {categoryMeta.icon}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold leading-snug">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <IconCheck size={15} stroke={2.5} className="text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[0.688rem] text-white/50 font-sans leading-relaxed">
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: File Payload Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.08] text-white font-mono text-[0.625rem] font-bold">
                    02
                  </span>
                  <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    File Payload Attachment
                  </label>
                </div>
                <span className="text-[0.625rem] font-mono uppercase text-white/40 font-semibold">MAX 15MB</span>
              </div>

              {selectedUploadFile ? (
                /* Staged File Preview Card */
                <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/[0.15] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 px-3 rounded-[2px] bg-white/[0.06] border border-white/[0.15] flex items-center justify-center font-mono text-xs font-bold text-white flex-shrink-0 tracking-wider">
                      {getFileExtension(selectedUploadFile.name)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-bold text-white truncate font-sans" title={selectedUploadFile.name}>
                        {selectedUploadFile.name}
                      </span>
                      <span className="text-[0.688rem] text-white/50 font-mono">
                        {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for upload
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[0.688rem] font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-[2px] border border-emerald-500/20">
                      <IconCheck size={13} stroke={2.5} /> STAGED &amp; VERIFIED
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedUploadFile(null)}
                      className="text-xs font-mono text-white/50 hover:text-red-400 underline transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Drag & Drop Box based on inspiration design (Dynamic format per category) */
                <label className="border border-dashed border-white/20 hover:border-white/40 bg-white/[0.01] hover:bg-white/[0.03] transition-all py-14 sm:py-16 px-6 min-h-[220px] rounded-[2px] flex flex-col items-center justify-center gap-4 cursor-pointer text-center group">
                  <input
                    type="file"
                    className="hidden"
                    accept={
                      CATEGORY_OPTIONS.find((c) => c.id === selectedCategoryId)?.accept ||
                      ".pdf,.doc,.docx,.xls,.xlsx,.csv,.sav"
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > MAX_FILE_SIZE_BYTES) {
                          setUploadError("File exceeds maximum allowed limit of 15MB. Please compress your file.");
                          setSelectedUploadFile(null);
                          return;
                        }
                        setSelectedUploadFile(file);
                        setUploadError(null);
                      }
                    }}
                  />

                  {/* Circular Cloud Icon */}
                  <div className="h-12 w-12 rounded-full bg-white/[0.05] border border-white/[0.10] group-hover:border-white/20 flex items-center justify-center text-white/60 group-hover:text-white transition-colors shadow-sm">
                    <IconCloudUpload size={22} stroke={1.5} />
                  </div>

                  {/* Heading & Subtitle (Dynamic based on selected category) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                      Click to browse or drop file
                    </span>
                    <span className="font-mono text-xs text-white/50">
                      {CATEGORY_OPTIONS.find((c) => c.id === selectedCategoryId)?.formatLabel ||
                        "PDF, DOCX, XLSX, CSV, SPSS (Max 15MB)"}
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

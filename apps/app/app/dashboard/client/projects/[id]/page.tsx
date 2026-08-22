"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  Alert,
  Modal,
} from "@repo/ui";
import { IconDownload, IconCheck, IconUpload } from "@tabler/icons-react";
import { getProjectById, deleteProjectFile, resolveMissingInfo, addProjectFile } from "@/features/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import {
  getFileMeta,
  formatFileCategory,
  triggerFileDownload,
} from "@/lib/file-utils";
import type { ProjectDetailItem, ProjectFileItem } from "@/features/projects/schemas";
import type { FileCategory } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STAGES = [
  { id: 1, label: "01. Intake Submitted", statuses: ["NEW_REQUEST", "AWAITING_INFORMATION"] },
  { id: 2, label: "02. Under Evaluation", statuses: ["UNDER_EVALUATION"] },
  { id: 3, label: "03. Quotation & SOW", statuses: ["QUOTE_SENT", "CLIENT_APPROVED", "SOW_PENDING", "SOW_SIGNED"] },
  { id: 4, label: "04. Active Computation", statuses: ["AWAITING_PAYMENT", "ACTIVE", "EXPERT_ASSIGNED", "IN_PROGRESS", "SLA_PAUSED", "SCOPE_CREEP_HALTED"] },
  { id: 5, label: "05. QA Peer Review", statuses: ["FOR_QA", "QA_REVISION"] },
  { id: 6, label: "06. Deliverables Released", statuses: ["DELIVERED", "REVISION_REQUESTED", "CLOSED"] },
];

const CATEGORY_OPTIONS: { label: string; value: FileCategory; desc: string }[] = [
  {
    label: "Raw Dataset / Spreadsheet",
    value: "DATASET",
    desc: "Excel (.xlsx), CSV, or SPSS data matrix",
  },
  {
    label: "Research Proposal / Draft",
    value: "RESEARCH_DOCUMENT",
    desc: "Chapters 1-3 proposal or manuscript (.pdf, .docx)",
  },
  {
    label: "Survey Tool / Questionnaire",
    value: "QUESTIONNAIRE",
    desc: "Survey instruments or interview guides",
  },
  {
    label: "Supplementary Document",
    value: "RESEARCH_DOCUMENT",
    desc: "Institutional approval or supplementary data",
  },
];

export default function ClientProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File deletion & resolution state
  const [fileToDelete, setFileToDelete] = useState<ProjectFileItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isResolving, startResolveTransition] = useTransition();

  // File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
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

  // Determine current active stage index
  const getStageIndex = (status: string) => {
    for (let i = 0; i < STAGES.length; i++) {
      if (STAGES[i]!.statuses.includes(status)) {
        return i;
      }
    }
    return 0;
  };

  const activeStageIdx = project ? getStageIndex(project.masterStatus) : 0;

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
        setSuccessMessage(`Document "${fileToDelete.fileName}" removed.`);
        setFileToDelete(null);
      } else {
        setError(res.error.message);
        setFileToDelete(null);
      }
    });
  };

  const handleUploadFile = () => {
    if (!selectedUploadFile || !project) {
      setUploadError("Please select a file to upload.");
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
        setSuccessMessage(`Document "${selectedUploadFile.name}" attached successfully.`);
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
        setSuccessMessage("Information request resolved. Study resubmitted for administration evaluation.");
      } else {
        setError(res.error.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <PageHeader
          title="Loading Research Study..."
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Client Portal", href: "/dashboard/client" },
            { label: "Projects", href: "/dashboard/client/projects" },
            { label: "Study Tracker" },
          ]}
        />
        <Card className="p-8 animate-pulse flex flex-col gap-4">
          <div className="h-6 bg-white/10 w-1/3 rounded-[2px]" />
          <div className="h-8 bg-white/10 w-2/3 rounded-[2px]" />
          <div className="h-24 bg-white/10 w-full rounded-[2px]" />
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <PageHeader
          title="Study Not Found"
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Client Portal", href: "/dashboard/client" },
            { label: "Projects", href: "/dashboard/client/projects" },
            { label: "Detail" },
          ]}
        />
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-red-400 font-mono">
            {error || "The requested research project could not be found or you lack permission to view it."}
          </p>
          <Link href="/dashboard/client/projects">
            <Button variant="secondary" size="md">
              ← Return to Projects List
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

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title={project.researchTitle}
        description={`Study ID: ${project.intakeId} · Submitted on ${new Date(
          project.createdAt
        ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Projects", href: "/dashboard/client/projects" },
          { label: project.intakeId },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/client/projects">
              <Button variant="secondary" size="sm">
                ← ALL PROJECTS
              </Button>
            </Link>
          </div>
        }
      />

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Status Lifecycle Tracker ── */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white/50 uppercase">Current Status:</span>
              <StatusBadge
                status={project.masterStatus}
                label={PROJECT_STATUS_LABELS[project.masterStatus] || project.masterStatus}
                pulse={project.masterStatus === "IN_PROGRESS" || project.masterStatus === "FOR_QA"}
              />
            </div>
            <div className="text-xs font-mono text-white/50">
              Target Deadline:{" "}
              <strong className="text-amber-400 font-bold">
                {new Date(project.deadlineRequested).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {STAGES.map((stage, idx) => {
              const isPast = idx < activeStageIdx;
              const isCurrent = idx === activeStageIdx;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-[2px] border text-center transition-colors flex flex-col gap-1 ${
                    isCurrent
                      ? "bg-[#CC6600]/15 border-[#CC6600] text-white"
                      : isPast
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.02] border-white/[0.06] text-white/30"
                  }`}
                >
                  <span className="font-mono text-[0.688rem] uppercase font-bold tracking-wider">
                    {stage.label}
                  </span>
                  <span className="text-[0.625rem] font-mono flex items-center gap-1">
                    {isPast ? (
                      <>
                        <IconCheck size={11} stroke={2.5} className="text-emerald-400" />
                        <span>COMPLETED</span>
                      </>
                    ) : isCurrent ? (
                      "● ACTIVE STAGE"
                    ) : (
                      "UPCOMING"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Missing Information Banner (if AWAITING_INFORMATION) ── */}
      {project.masterStatus === "AWAITING_INFORMATION" && (
        <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-500/[0.04] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
              Missing Information Requested by Admin
            </h3>
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-sans bg-black/30 p-4 rounded-[2px] border border-white/[0.08]">
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

      {/* ── Research Details Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Research Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 md:p-8 flex flex-col gap-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white font-sans">
                Research Problem & Objectives
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40">
                Core Research Questions
              </span>
              <div className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans">
                {project.researchQuestions}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40">
                Research Objectives
              </span>
              <div className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans">
                {project.researchObjectives}
              </div>
            </div>

            {project.hypotheses && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase text-white/40">
                  Theoretical Hypotheses
                </span>
                <div className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans">
                  {project.hypotheses}
                </div>
              </div>
            )}
          </Card>

          {/* Attached Files & Datasets */}
          <Card className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Attached Research Documents &amp; Datasets
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {project.files.length} document(s) registered for statistical analysis
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {isPreSow && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedUploadFile(null);
                      setUploadError(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="py-1 px-3 h-auto text-xs font-mono font-bold tracking-wider"
                  >
                    + UPLOAD FILE
                  </Button>
                )}
                {isPreSow && (
                  <span className="text-[0.688rem] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] whitespace-nowrap">
                    PRE-SOW EDITABLE
                  </span>
                )}
              </div>
            </div>

            {project.files.length === 0 ? (
              <div
                onClick={() => {
                  setSelectedUploadFile(null);
                  setUploadError(null);
                  setIsUploadModalOpen(true);
                }}
                className="border-2 border-dashed border-white/15 hover:border-[#CC6600]/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-8 rounded-[3px] flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center group"
              >
                <div className="h-10 w-10 rounded-full bg-white/[0.05] group-hover:bg-[#CC6600]/15 flex items-center justify-center text-white/50 group-hover:text-amber-400 transition-colors text-lg font-mono">
                  ⇪
                </div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 font-sans">
                  No files attached yet. Click to upload research files or datasets.
                </span>
                <span className="text-[0.688rem] text-white/40 font-mono">
                  Accepts PDF, DOCX, XLSX, CSV, SPSS (.sav) up to 100MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {project.files.map((file) => {
                  const meta = getFileMeta(file.fileName, file.fileType);
                  const category = formatFileCategory(file.fileCategory);
                  return (
                    <div
                      key={file.id}
                      className="p-5 sm:px-7 sm:py-5 rounded-[2px] bg-[#011C38] border border-white/[0.08] hover:border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-colors"
                    >
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                        <div
                          className={`h-11 w-11 sm:h-12 sm:w-12 rounded-[2px] ${meta.theme.bg} ${meta.theme.border} border flex flex-col items-center justify-center flex-shrink-0`}
                        >
                          <span className={`text-[0.5625rem] font-mono font-bold uppercase tracking-wider ${meta.theme.text}`}>
                            {meta.ext}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            <span className="text-sm font-semibold font-sans text-white truncate max-w-sm sm:max-w-md lg:max-w-xl" title={file.fileName}>
                              {file.fileName}
                            </span>
                            <span
                              className={`text-[0.625rem] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] border whitespace-nowrap flex-shrink-0 ${category.badgeClass}`}
                            >
                              {category.label}
                            </span>
                          </div>
                          <span className="text-xs text-white/40 font-mono">
                            <span className="text-sky-300/80">{meta.friendlyType}</span> · Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => triggerFileDownload(file.filePath, file.fileName)}
                          className="px-4 py-2 rounded-[2px] bg-[#CC6600]/20 hover:bg-[#CC6600]/35 text-white border border-[#CC6600] text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
                        >
                          <IconDownload size={14} stroke={1.5} className="text-[#FFA040]" />
                          <span>DOWNLOAD</span>
                        </button>

                        {isPreSow && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setFileToDelete(file)}
                            className="text-xs font-mono"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Institutional Details & Next Actions */}
        <div className="flex flex-col gap-6">
          {/* Institutional Affiliation Card */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold border-b border-white/[0.08] pb-2">
              Institutional Affiliation
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-white/40 block">Lead Researcher / Client</span>
                <span className="text-white font-semibold font-sans">{project.client.fullName}</span>
              </div>
              {project.client.clientProfile && (
                <>
                  <div>
                    <span className="text-white/40 block">Institution / University</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.institutionSchool}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Academic Program</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.academicProgram}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Region</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.region}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* SLA & Governance Assurance Card */}
          <Card className="p-6 flex flex-col gap-3 border-l-2 border-l-emerald-500">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              JAXIS Peer Review Standard
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Every deliverable is independently verified by a Senior QA Lead for calculation reproducibility, APA 7th compliance, and non-disclosure governance.
            </p>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <Modal
          open={Boolean(fileToDelete)}
          onClose={() => setFileToDelete(null)}
          title="Remove Attached Document"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Are you sure you want to remove{" "}
              <strong className="text-white font-mono">{fileToDelete.fileName}</strong> from this study?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
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
          </div>
        </Modal>
      )}

      {/* File Upload Modal */}
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
          description="Attach updated proposal manuscripts, questionnaires, or raw dataset matrices."
          size="md"
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
          <div className="flex flex-col gap-4 text-xs font-sans">
            {uploadError && <Alert variant="danger">{uploadError}</Alert>}

            {/* Category Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-white/60 uppercase">
                Document / Dataset Category:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUploadCategory(opt.value)}
                    className={`p-3 rounded-[2px] border text-left transition-all flex flex-col gap-1 ${
                      uploadCategory === opt.value
                        ? "bg-[#CC6600]/20 border-[#CC6600] text-white"
                        : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">
                      {uploadCategory === opt.value ? "● " : "○ "}
                      {opt.label}
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-sans">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Picker */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-mono font-bold text-white/60 uppercase">
                Select File from Device:
              </label>
              <label
                className="border-2 border-dashed border-white/20 hover:border-[#CC6600] bg-black/30 hover:bg-black/50 transition-all p-6 rounded-[2px] flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
                style={{
                  padding: "1.75rem 1.25rem",
                  minHeight: "140px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "2px",
                  boxSizing: "border-box",
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.sav"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedUploadFile(file);
                      setUploadError(null);
                    }
                  }}
                />
                <div className="h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center text-amber-400">
                  <IconUpload size={20} stroke={1.5} />
                </div>
                {selectedUploadFile ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {selectedUploadFile.name}
                    </span>
                    <span className="font-mono text-[0.688rem] text-white/50">
                      {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for upload
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-semibold text-white">
                      Click to choose file or drag and drop
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono">
                      PDF, Word (.docx), Excel (.xlsx), CSV, SPSS (.sav)
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

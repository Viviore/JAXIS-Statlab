"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormInput,
  FormTextarea,
  Button,
  Alert,
  FormFooter,
  Stepper,
  Toast,
} from "@repo/ui";
import {
  IconCheck,
  IconLock,
  IconFileText,
  IconDatabase,
  IconListCheck,
  IconCloudUpload,
  IconTrash,
  IconShieldCheck,
} from "@tabler/icons-react";
import { createProject } from "@/features/projects/actions";
import { getClientProfile } from "@/features/client-profile/actions";
import type { FileCategory } from "@prisma/client";

interface UploadedFileItem {
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  formattedSize: string;
}

interface UploadProgressState {
  fileName: string;
  category: FileCategory;
  progress: number;
  formattedSize: string;
}

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/msword",
];

const MAX_DOC_SIZE = 15 * 1024 * 1024; // 15MB Storage Defense Limit
const MAX_DATASET_SIZE = 15 * 1024 * 1024; // 15MB Storage Defense Limit

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function NewProjectIntakePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard Step (1: Info, 2: Files, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Client Profile state
  const [profile, setProfile] = useState<{
    institutionSchool: string;
    academicProgram: string;
    contactNumber: string;
    region: string;
  } | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Step 1: Research Information
  const [researchTitle, setResearchTitle] = useState("");
  const [researchQuestions, setResearchQuestions] = useState("");
  const [researchObjectives, setResearchObjectives] = useState("");
  const [hypotheses, setHypotheses] = useState("");
  const [deadlineRequested, setDeadlineRequested] = useState("");

  // Step 2: Uploaded Files & Uploading Progress
  const [filesList, setFilesList] = useState<UploadedFileItem[]>([]);
  const [uploadingState, setUploadingState] = useState<Partial<Record<FileCategory, UploadProgressState | null>>>({});
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 3: Integrity declaration
  const [integrityAgreed, setIntegrityAgreed] = useState(false);

  // General errors & submission feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    variant: "success" | "danger" | "warning" | "info";
    message: string;
    description?: string;
  } | null>(null);

  // Load client profile on mount
  useEffect(() => {
    async function loadProfile() {
      const p = await getClientProfile();
      if (p) {
        setProfile({
          institutionSchool: p.institutionSchool || "",
          academicProgram: p.academicProgram || "",
          contactNumber: p.contactNumber || "",
          region: p.region || "",
        });
      }
      setIsProfileLoaded(true);
    }
    loadProfile();
  }, []);

  const isProfileComplete = Boolean(
    profile && profile.institutionSchool && profile.contactNumber
  );

  // Drag & drop active category tracking
  const [dragActiveCategory, setDragActiveCategory] = useState<FileCategory | null>(null);

  // Core File Processing Logic with animated progress bar
  const processFile = (file: File, category: FileCategory) => {
    setFileError(null);

    // Check MIME type or extension
    const isValidMime =
      ALLOWED_MIMES.includes(file.type) ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".xls");

    if (!isValidMime) {
      setFileError(
        `Invalid file type "${file.name}". Allowed formats: PDF, DOCX, XLSX, CSV.`
      );
      return;
    }

    // Check file size
    const maxSize =
      category === "DATASET" ? MAX_DATASET_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      setFileError(
        `File "${file.name}" exceeds maximum allowed size of ${formatBytes(maxSize)}.`
      );
      return;
    }

    // Start upload progress animation
    setUploadingState((prev) => ({
      ...prev,
      [category]: {
        fileName: file.name,
        category,
        progress: 15,
        formattedSize: formatBytes(file.size),
      },
    }));

    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 22) + 16;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(interval);

        setUploadingState((prev) => ({
          ...prev,
          [category]: {
            fileName: file.name,
            category,
            progress: 100,
            formattedSize: formatBytes(file.size),
          },
        }));

        setTimeout(() => {
          const newFileItem: UploadedFileItem = {
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            category,
            formattedSize: formatBytes(file.size),
          };

          setFilesList((prev) => [
            ...prev.filter((f) => f.category !== category),
            newFileItem,
          ]);

          setUploadingState((prev) => ({
            ...prev,
            [category]: null,
          }));
        }, 320);
      } else {
        setUploadingState((prev) => ({
          ...prev,
          [category]: {
            fileName: file.name,
            category,
            progress: currentProg,
            formattedSize: formatBytes(file.size),
          },
        }));
      }
    }, 80);
  };

  // File Input Change Handler
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: FileCategory
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]!, category);
    }
    e.target.value = "";
  };

  // Drag & Drop Event Handlers
  const handleDragEnter = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragActiveCategory !== category) {
      setDragActiveCategory(category);
    }
  };

  const handleDragLeave = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragActiveCategory === category) {
      setDragActiveCategory(null);
    }
  };

  const handleDrop = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCategory(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]!, category);
    }
  };

  const removeFile = (category: FileCategory) => {
    setFilesList((prev) => prev.filter((f) => f.category !== category));
  };

  // Step 1 Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!researchTitle.trim() || researchTitle.trim().length < 3) {
      errors.researchTitle = ["Research title must be at least 3 characters."];
    }
    if (!researchQuestions.trim() || researchQuestions.trim().length < 5) {
      errors.researchQuestions = ["Please specify research questions (min 5 characters)."];
    }
    if (!researchObjectives.trim() || researchObjectives.trim().length < 5) {
      errors.researchObjectives = ["Please specify research objectives (min 5 characters)."];
    }
    if (!deadlineRequested) {
      errors.deadlineRequested = ["Target completion deadline is required."];
    } else {
      const selected = new Date(deadlineRequested);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        errors.deadlineRequested = ["Target deadline must be in the future."];
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 Proceed
  const handleProceedToStep3 = () => {
    setFormError(null);
    setFileError(null);

    const hasResearchDoc = filesList.some((f) => f.category === "RESEARCH_DOCUMENT");
    const hasDataset = filesList.some((f) => f.category === "DATASET");

    if (!hasResearchDoc) {
      setFileError("Please attach your Draft Chapters (1-3) to proceed.");
      return;
    }
    if (!hasDataset) {
      setFileError("Please attach your Raw Dataset file to proceed.");
      return;
    }

    setCurrentStep(3);
  };

  // Step 3 Final Submission
  const handleFinalSubmit = () => {
    setFormError(null);
    setSuccessMessage(null);

    if (!integrityAgreed) {
      const covenantMsg = "You must agree to the academic authorship & confidentiality statement before submitting.";
      setFormError(covenantMsg);
      setToast({
        variant: "warning",
        message: "Academic Covenant Required",
        description: covenantMsg,
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        researchTitle: researchTitle.trim(),
        researchQuestions: researchQuestions.trim(),
        researchObjectives: researchObjectives.trim(),
        hypotheses: hypotheses.trim() || null,
        deadlineRequested,
        chapters13: filesList.find((f) => f.category === "RESEARCH_DOCUMENT")?.name || null,
        questionnaire: filesList.find((f) => f.category === "QUESTIONNAIRE")?.name || null,
        files: filesList.map((f) => ({
          fileName: f.name,
          filePath: `intake-uploads/${f.name}`,
          fileType: f.type,
          fileCategory: f.category,
        })),
      };

      const res = await createProject(payload);

      if (!res.success) {
        const errorMsg = res.error.message || "Failed to submit project intake. Please review form entries.";
        setFormError(errorMsg);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        setToast({
          variant: "danger",
          message: "Intake Submission Failed",
          description: errorMsg,
        });
        return;
      }

      const assignedId = res.data.intakeId;
      router.push(`/dashboard/client?created=true&intakeId=${encodeURIComponent(assignedId)}`);
    });
  };

  if (isProfileLoaded && !isProfileComplete) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
        <PageHeader
          title="New Research Project Intake"
          description="Formal submission desk for academic theses and quantitative dissertations."
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Client Portal", href: "/dashboard/client" },
            { label: "New Project" },
          ]}
        />

        <Card className="p-8 border-l-4 border-l-[#CC6600] flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CC6600] animate-pulse" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Profile Verification Required
            </h2>
          </div>
          <p className="text-sm text-white/70 leading-relaxed font-sans max-w-2xl">
            You must complete your institutional affiliation details (university, academic program, contact number, and region) before you can submit research project intake forms.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/client/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CC6600] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#b35a00] transition-colors"
            >
              Complete Institutional Profile →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
      <PageHeader
        title="New Research Project Intake"
        description="Formal submission desk for academic theses, quantitative dissertations, and institutional statistical consultations."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "New Intake" },
        ]}
      />

      {/* ── Stepper Navigation ── */}
      <Stepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step === 1 || step === 2 || step === 3) {
            setCurrentStep(step);
          }
        }}
        steps={[
          {
            id: "scope",
            title: "01. Scope & Details",
            subtitle: "Study title, research questions, objectives, and target deadline",
          },
          {
            id: "uploads",
            title: "02. Document Uploads",
            subtitle: "Draft chapters, raw datasets, and survey questionnaires",
          },
          {
            id: "review",
            title: "03. Review & Submit",
            subtitle: "Institutional verification and final submission",
          },
        ]}
      />

      {formError && <Alert variant="danger">{formError}</Alert>}
      {fileError && <Alert variant="danger">{fileError}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* ── STEP 1: Research Information ── */}
      {currentStep === 1 && (
        <Card className="p-8 md:p-10" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
          <form onSubmit={handleProceedToStep2} className="flex flex-col gap-8">
            <div className="border-b border-white/[0.08] pb-5">
              <h2 className="text-base font-bold text-white font-sans">
                Research Project Specifications
              </h2>
              <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
                Provide foundational details about your thesis or research study for statistical evaluation.
              </p>
            </div>

            <div className="flex flex-col gap-7">
              <FormInput
                label="Research Study Title"
                required
                placeholder="e.g. Impact of Micro-credentials on Tech Sector Employability in Metro Manila"
                value={researchTitle}
                onChange={(e) => setResearchTitle(e.target.value)}
                error={fieldErrors.researchTitle?.[0]}
                monoLabel
              />

              <FormTextarea
                label="Statement of the Problem / Key Research Questions"
                required
                rows={4}
                placeholder="1. What is the demographic profile of the respondents?&#10;2. Is there a significant difference in diagnostic speed between traditional and blended learning models?"
                value={researchQuestions}
                onChange={(e) => setResearchQuestions(e.target.value)}
                error={fieldErrors.researchQuestions?.[0]}
                monoLabel
              />

              <FormTextarea
                label="Core Research Objectives"
                required
                rows={3}
                placeholder="Describe the primary scientific and analytical goals of this statistical consultation..."
                value={researchObjectives}
                onChange={(e) => setResearchObjectives(e.target.value)}
                error={fieldErrors.researchObjectives?.[0]}
                monoLabel
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <FormTextarea
                  label="Theoretical Hypotheses (Optional)"
                  rows={3}
                  placeholder="H0: There is no significant relationship between variable X and variable Y..."
                  value={hypotheses}
                  onChange={(e) => setHypotheses(e.target.value)}
                  monoLabel
                />

                <div className="flex flex-col gap-2">
                  <FormInput
                    label="Target Completion / Defense Deadline"
                    type="date"
                    required
                    value={deadlineRequested}
                    onChange={(e) => setDeadlineRequested(e.target.value)}
                    error={fieldErrors.deadlineRequested?.[0]}
                    monoLabel
                  />
                  <span className="text-[0.688rem] text-white/40 font-mono mt-1 px-0.5 leading-relaxed">
                    Allows our statisticians to evaluate timeline feasibility and SLA delivery tiers.
                  </span>
                </div>
              </div>
            </div>

            <FormFooter className="mt-8 pt-6">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto font-bold tracking-wider"
              >
                PROCEED TO ATTACHMENTS →
              </Button>
            </FormFooter>
          </form>
        </Card>
      )}

      {/* ── STEP 2: Document Attachments ── */}
      {currentStep === 2 && (
        <Card className="p-8 md:p-10 flex flex-col gap-8" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Attach Research Documents & Datasets
              </h2>
              <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
                Provide draft chapters, survey instruments, or raw dataset files for statistical evaluation.
              </p>
            </div>

            {/* Confidentiality Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white/[0.03] border border-white/[0.08] text-white/60 text-xs self-start sm:self-auto flex-shrink-0">
              <IconLock size={14} className="text-[#CC6600]" stroke={2} />
              <span className="font-mono text-[0.688rem] uppercase tracking-wider">NDA Encrypted</span>
            </div>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gap: "1.5rem",
            }}
          >
            {/* ── Slot 1: Chapters 1-3 ── */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "RESEARCH_DOCUMENT")}
              onDragOver={(e) => handleDragOver(e, "RESEARCH_DOCUMENT")}
              onDragLeave={(e) => handleDragLeave(e, "RESEARCH_DOCUMENT")}
              onDrop={(e) => handleDrop(e, "RESEARCH_DOCUMENT")}
              className={`p-6 rounded-[2px] border bg-[#01142B]/85 flex flex-col justify-between gap-5 transition-all min-h-[300px] ${
                dragActiveCategory === "RESEARCH_DOCUMENT"
                  ? "border-[#CC6600] bg-[#CC6600]/5 ring-1 ring-[#CC6600]/40"
                  : "border-white/[0.09]"
              }`}
              style={{
                padding: "1.5rem",
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                minHeight: "300px",
                boxSizing: "border-box",
              }}
            >
              {/* Header */}
              <div className="flex flex-col gap-3 min-h-[72px]" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "72px" }}>
                <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    className="w-8 h-8 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400"
                    style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                  >
                    <IconFileText size={18} stroke={1.75} />
                  </div>
                  <span
                    className="text-[0.625rem] font-mono font-bold uppercase px-2 py-0.5 rounded-[2px] bg-sky-500/10 text-sky-300 border border-sky-500/20"
                    style={{ padding: "0.125rem 0.5rem", borderRadius: "2px" }}
                  >
                    Required
                  </span>
                </div>

                <div className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Draft Chapters (1-3)
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                    Introduction, Literature Review, and Methodology framework.
                  </p>
                </div>
              </div>

              {/* Upload Zone / State */}
              {uploadingState.RESEARCH_DOCUMENT ? (
                <div
                  className="p-4 bg-[#011B38] border border-[#CC6600]/50 rounded-[2px] flex flex-col justify-center gap-3 min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem", boxSizing: "border-box" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.RESEARCH_DOCUMENT.fileName}
                    </span>
                    <span className="text-xs font-mono text-[#CC6600] font-bold">
                      {uploadingState.RESEARCH_DOCUMENT.progress}%
                    </span>
                  </div>
                  <div
                    className="w-full bg-white/10 overflow-hidden"
                    style={{ height: "4px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "0px" }}
                  >
                    <div
                      className="h-full transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.RESEARCH_DOCUMENT.progress}%`, backgroundColor: "#CC6600", borderRadius: "0px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span>Uploading...</span>
                    <span>{uploadingState.RESEARCH_DOCUMENT.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "RESEARCH_DOCUMENT") ? (
                <div
                  className="p-4 bg-[#011B38] border border-emerald-500/30 rounded-[2px] flex flex-col justify-between min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"
                      style={{ width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                    >
                      <IconCheck size={15} stroke={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-mono text-emerald-200 font-semibold truncate">
                        {filesList.find((f) => f.category === "RESEARCH_DOCUMENT")?.name}
                      </span>
                      <span className="text-[0.688rem] text-white/40 font-mono mt-0.5">
                        {filesList.find((f) => f.category === "RESEARCH_DOCUMENT")?.formattedSize} · Verified
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-1"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.625rem", marginTop: "0.25rem" }}
                  >
                    <label className="text-xs font-mono text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleFileInputChange(e, "RESEARCH_DOCUMENT")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFile("RESEARCH_DOCUMENT")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <IconTrash size={13} stroke={2} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`group cursor-pointer border border-dashed rounded-[2px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 min-h-[150px] ${
                    dragActiveCategory === "RESEARCH_DOCUMENT"
                      ? "border-[#CC6600] bg-[#CC6600]/10"
                      : "border-white/15 hover:border-[#CC6600]/60 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                  style={{
                    padding: "1.75rem 1.25rem",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    borderRadius: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileInputChange(e, "RESEARCH_DOCUMENT")}
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 group-hover:text-[#CC6600] group-hover:border-[#CC6600]/40 transition-colors"
                    style={{ width: "2rem", height: "2rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <IconCloudUpload size={18} stroke={1.75} />
                  </div>
                  <div className="flex flex-col gap-0.5" style={{ display: "flex", flexDirection: "column", gap: "0.125rem", textAlign: "center" }}>
                    <span className="text-xs font-mono font-semibold text-white/80 group-hover:text-white transition-colors">
                      Click to browse or drop file
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono">
                      PDF, DOCX (Max 15MB)
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* ── Slot 2: Raw Dataset ── */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "DATASET")}
              onDragOver={(e) => handleDragOver(e, "DATASET")}
              onDragLeave={(e) => handleDragLeave(e, "DATASET")}
              onDrop={(e) => handleDrop(e, "DATASET")}
              className={`p-6 rounded-[2px] border bg-[#01142B]/85 flex flex-col justify-between gap-5 transition-all min-h-[300px] ${
                dragActiveCategory === "DATASET"
                  ? "border-[#CC6600] bg-[#CC6600]/5 ring-1 ring-[#CC6600]/40"
                  : "border-white/[0.09]"
              }`}
              style={{
                padding: "1.5rem",
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                minHeight: "300px",
                boxSizing: "border-box",
              }}
            >
              {/* Header */}
              <div className="flex flex-col gap-3 min-h-[72px]" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "72px" }}>
                <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    className="w-8 h-8 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400"
                    style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                  >
                    <IconDatabase size={18} stroke={1.75} />
                  </div>
                  <span
                    className="text-[0.625rem] font-mono font-bold uppercase px-2 py-0.5 rounded-[2px] bg-sky-500/10 text-sky-300 border border-sky-500/20"
                    style={{ padding: "0.125rem 0.5rem", borderRadius: "2px" }}
                  >
                    Required
                  </span>
                </div>

                <div className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Raw Dataset File
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                    Tabulated respondent survey data or experiment records.
                  </p>
                </div>
              </div>

              {/* Upload Zone / State */}
              {uploadingState.DATASET ? (
                <div
                  className="p-4 bg-[#011B38] border border-emerald-500/50 rounded-[2px] flex flex-col justify-center gap-3 min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem", boxSizing: "border-box" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.DATASET.fileName}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {uploadingState.DATASET.progress}%
                    </span>
                  </div>
                  <div
                    className="w-full bg-white/10 overflow-hidden"
                    style={{ height: "4px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "0px" }}
                  >
                    <div
                      className="h-full transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.DATASET.progress}%`, backgroundColor: "#10B981", borderRadius: "0px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span>Validating schema...</span>
                    <span>{uploadingState.DATASET.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "DATASET") ? (
                <div
                  className="p-4 bg-[#011B38] border border-emerald-500/30 rounded-[2px] flex flex-col justify-between min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"
                      style={{ width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                    >
                      <IconCheck size={15} stroke={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-mono text-emerald-200 font-semibold truncate">
                        {filesList.find((f) => f.category === "DATASET")?.name}
                      </span>
                      <span className="text-[0.688rem] text-white/40 font-mono mt-0.5">
                        {filesList.find((f) => f.category === "DATASET")?.formattedSize} · Verified
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-1"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.625rem", marginTop: "0.25rem" }}
                  >
                    <label className="text-xs font-mono text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleFileInputChange(e, "DATASET")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFile("DATASET")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <IconTrash size={13} stroke={2} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`group cursor-pointer border border-dashed rounded-[2px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 min-h-[150px] ${
                    dragActiveCategory === "DATASET"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/15 hover:border-emerald-500/60 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                  style={{
                    padding: "1.75rem 1.25rem",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    borderRadius: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileInputChange(e, "DATASET")}
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors"
                    style={{ width: "2rem", height: "2rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <IconCloudUpload size={18} stroke={1.75} />
                  </div>
                  <div className="flex flex-col gap-0.5" style={{ display: "flex", flexDirection: "column", gap: "0.125rem", textAlign: "center" }}>
                    <span className="text-xs font-mono font-semibold text-white/80 group-hover:text-white transition-colors">
                      Click to browse or drop file
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono">
                      CSV, XLSX, XLS, SPSS (Max 15MB)
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* ── Slot 3: Survey Questionnaire ── */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "QUESTIONNAIRE")}
              onDragOver={(e) => handleDragOver(e, "QUESTIONNAIRE")}
              onDragLeave={(e) => handleDragLeave(e, "QUESTIONNAIRE")}
              onDrop={(e) => handleDrop(e, "QUESTIONNAIRE")}
              className={`p-6 rounded-[2px] border bg-[#01142B]/85 flex flex-col justify-between gap-5 transition-all min-h-[300px] ${
                dragActiveCategory === "QUESTIONNAIRE"
                  ? "border-[#CC6600] bg-[#CC6600]/5 ring-1 ring-[#CC6600]/40"
                  : "border-white/[0.09]"
              }`}
              style={{
                padding: "1.5rem",
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                minHeight: "300px",
                boxSizing: "border-box",
              }}
            >
              {/* Header */}
              <div className="flex flex-col gap-3 min-h-[72px]" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "72px" }}>
                <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    className="w-8 h-8 rounded-[2px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400"
                    style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                  >
                    <IconListCheck size={18} stroke={1.75} />
                  </div>
                  <span
                    className="text-[0.625rem] font-mono uppercase px-2 py-0.5 rounded-[2px] bg-white/[0.04] text-white/40 border border-white/[0.08]"
                    style={{ padding: "0.125rem 0.5rem", borderRadius: "2px" }}
                  >
                    Optional
                  </span>
                </div>

                <div className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Survey Instrument
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                    Likert-scale questionnaire, interview guide, or rating matrix.
                  </p>
                </div>
              </div>

              {/* Upload Zone / State */}
              {uploadingState.QUESTIONNAIRE ? (
                <div
                  className="p-4 bg-[#011B38] border border-amber-400/50 rounded-[2px] flex flex-col justify-center gap-3 min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem", boxSizing: "border-box" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.QUESTIONNAIRE.fileName}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {uploadingState.QUESTIONNAIRE.progress}%
                    </span>
                  </div>
                  <div
                    className="w-full bg-white/10 overflow-hidden"
                    style={{ height: "4px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "0px" }}
                  >
                    <div
                      className="h-full transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.QUESTIONNAIRE.progress}%`, backgroundColor: "#F59E0B", borderRadius: "0px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span>Uploading...</span>
                    <span>{uploadingState.QUESTIONNAIRE.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "QUESTIONNAIRE") ? (
                <div
                  className="p-4 bg-[#011B38] border border-emerald-500/30 rounded-[2px] flex flex-col justify-between min-h-[150px]"
                  style={{ padding: "1.25rem", minHeight: "150px", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"
                      style={{ width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}
                    >
                      <IconCheck size={15} stroke={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-mono text-emerald-200 font-semibold truncate">
                        {filesList.find((f) => f.category === "QUESTIONNAIRE")?.name}
                      </span>
                      <span className="text-[0.688rem] text-white/40 font-mono mt-0.5">
                        {filesList.find((f) => f.category === "QUESTIONNAIRE")?.formattedSize} · Verified
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-1"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.625rem", marginTop: "0.25rem" }}
                  >
                    <label className="text-xs font-mono text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleFileInputChange(e, "QUESTIONNAIRE")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFile("QUESTIONNAIRE")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <IconTrash size={13} stroke={2} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`group cursor-pointer border border-dashed rounded-[2px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 min-h-[150px] ${
                    dragActiveCategory === "QUESTIONNAIRE"
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/15 hover:border-amber-400/60 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                  style={{
                    padding: "1.75rem 1.25rem",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    borderRadius: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileInputChange(e, "QUESTIONNAIRE")}
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors"
                    style={{ width: "2rem", height: "2rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <IconCloudUpload size={18} stroke={1.75} />
                  </div>
                  <div className="flex flex-col gap-0.5" style={{ display: "flex", flexDirection: "column", gap: "0.125rem", textAlign: "center" }}>
                    <span className="text-xs font-mono font-semibold text-white/80 group-hover:text-white transition-colors">
                      Click to browse or drop file
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono">
                      PDF, DOCX (Max 15MB)
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <FormFooter align="between" className="mt-8 pt-6">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto font-bold tracking-wider"
            >
              ← BACK TO SCOPE
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleProceedToStep3}
              className="w-full sm:w-auto font-bold tracking-wider"
            >
              PROCEED TO REVIEW →
            </Button>
          </FormFooter>
        </Card>
      )}

      {/* ── STEP 3: Review & Submit ── */}
      {currentStep === 3 && (
        <Card className="p-8 md:p-10 flex flex-col gap-8" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="border-b border-white/[0.08] pb-5" style={{ paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <h2 className="text-base font-bold text-white font-sans">
              Summary Review & Submission
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
              Inspect your study specifications before sending them to the Admin Triage Queue for statistical pricing.
            </p>
          </div>

          {/* Institutional Affiliation Verification */}
          {profile && (
            <div
              className="p-5 md:p-6 rounded-[3px] bg-[#011C38] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", borderRadius: "2px", boxSizing: "border-box" }}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
                  Verified Institutional Affiliation
                </span>
                <span className="text-sm font-semibold text-white">
                  {profile.institutionSchool} · {profile.academicProgram}
                </span>
                <span className="text-xs text-white/50 font-mono mt-0.5">
                  Region: {profile.region} | Contact: {profile.contactNumber}
                </span>
              </div>
              <Link
                href="/dashboard/client/profile"
                className="text-xs font-mono text-[#CC6600] hover:underline whitespace-nowrap font-medium"
              >
                Edit Profile →
              </Link>
            </div>
          )}

          {/* Research Summary Card */}
          <div
            className="flex flex-col gap-6 border border-white/[0.08] rounded-[2px] p-6 md:p-8 bg-white/[0.015]"
            style={{
              marginTop: "1.5rem",
              padding: "1.75rem",
              borderRadius: "2px",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              boxSizing: "border-box",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Research Title</span>
              <span className="text-base font-bold text-white leading-snug">{researchTitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06]">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Target Deadline</span>
                <span className="text-sm font-mono text-amber-400 font-bold">
                  {new Date(deadlineRequested).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Attached Files</span>
                <span className="text-sm font-mono text-emerald-400 font-bold">
                  {filesList.length} documents uploaded
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Statement of the Problem / Research Questions</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {researchQuestions}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Core Research Objectives</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {researchObjectives}
              </p>
            </div>

            {hypotheses && (
              <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Theoretical Hypotheses</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {hypotheses}
                </p>
              </div>
            )}
          </div>

          {/* Academic Integrity Covenant Card */}
          <div
            onClick={() => setIntegrityAgreed(!integrityAgreed)}
            className={`rounded-[2px] transition-all cursor-pointer select-none border ${
              integrityAgreed
                ? "bg-[#CC6600]/10 border-[#CC6600]/50 ring-1 ring-[#CC6600]/30"
                : "bg-[#01142B]/85 border-white/[0.12] hover:border-white/25"
            }`}
            style={{
              marginTop: "1.5rem",
              padding: "1.5rem 1.75rem",
              borderRadius: "2px",
              border: integrityAgreed ? "1px solid rgba(204, 102, 0, 0.5)" : "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "flex-start",
              gap: "1.25rem",
              boxSizing: "border-box",
            }}
          >
            {/* Custom Styled Checkmark Box */}
            <div
              className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                integrityAgreed
                  ? "bg-[#CC6600] border-[#CC6600] text-white"
                  : "bg-[#011C38] border-white/30 text-transparent hover:border-[#CC6600]/70"
              }`}
              style={{
                width: "1.375rem",
                height: "1.375rem",
                borderRadius: "2px",
                backgroundColor: integrityAgreed ? "#CC6600" : "#011C38",
                borderColor: integrityAgreed ? "#CC6600" : "rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {integrityAgreed && <IconCheck size={15} stroke={3} style={{ color: "#FFFFFF" }} />}
            </div>

            <div
              className="flex flex-col gap-1.5 flex-1 min-w-0"
              style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, minWidth: 0 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[0.625rem] font-mono font-bold uppercase px-2 py-0.5 rounded-[2px] bg-[#CC6600]/20 text-[#CC6600] border border-[#CC6600]/30 tracking-wider"
                  style={{ padding: "0.125rem 0.5rem", borderRadius: "2px" }}
                >
                  Academic Integrity Covenant
                </span>
              </div>
              <h4 className="font-sans text-sm font-bold text-white tracking-wide">
                Statement of Academic Authorship & Confidentiality
              </h4>
              <p
                className="text-xs text-white/75 font-sans leading-relaxed"
                style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "rgba(255, 255, 255, 0.75)" }}
              >
                I confirm that the submitted questionnaire and dataset belong to my academic thesis or institutional project. I understand JAXIS StatLab operates under strict peer review and non-disclosure standards.
              </p>
              <div
                className="flex items-center gap-1.5 text-[0.688rem] font-mono text-emerald-400/90 pt-1"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", paddingTop: "0.25rem", color: "#34D399" }}
              >
                <IconShieldCheck size={14} stroke={2} />
                <span>NDA & Non-Disclosure Protected · Peer Review Standard</span>
              </div>
            </div>
          </div>

          <FormFooter
            align="between"
            className="mt-8 pt-6"
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep(2)}
              disabled={isPending}
              className="w-full sm:w-auto font-bold tracking-wider"
            >
              ← BACK TO ATTACHMENTS
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleFinalSubmit}
              loading={isPending}
              disabled={!integrityAgreed}
              className="w-full sm:w-auto font-bold tracking-wider"
            >
              SUBMIT INTAKE →
            </Button>
          </FormFooter>
        </Card>
      )}

      {/* ── Floating Responsive Toast Notification ── */}
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

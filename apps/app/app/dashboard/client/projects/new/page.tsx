"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormInput,
  FormTextarea,
  FormCheckbox,
  Button,
  Alert,
} from "@repo/ui";
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

const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DATASET_SIZE = 100 * 1024 * 1024; // 100MB

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
    setCurrentStep(3);
  };

  // Step 3 Final Submission
  const handleFinalSubmit = () => {
    setFormError(null);
    setSuccessMessage(null);

    if (!integrityAgreed) {
      setFormError("You must agree to the academic authorship & confidentiality statement before submitting.");
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
        setFormError(res.error.message);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        return;
      }

      setSuccessMessage(`Study intake successfully submitted! Assigned ID: ${res.data.intakeId}`);
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 1600);
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

      {/* Step Indicator Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div
          onClick={() => currentStep > 1 && setCurrentStep(1)}
          className={`p-5 rounded-[2px] border transition-colors flex flex-col justify-between gap-2.5 ${
            currentStep === 1
              ? "bg-[#CC6600]/15 border-[#CC6600] text-white shadow-md shadow-[#CC6600]/5"
              : currentStep > 1
              ? "bg-emerald-500/10 border-emerald-500/30 text-white cursor-pointer hover:bg-emerald-500/15"
              : "bg-white/[0.02] border-white/[0.08] text-white/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              01. Scope & Details
            </span>
            {currentStep > 1 ? (
              <span className="text-emerald-400 font-mono text-xs font-semibold">✓ Done</span>
            ) : currentStep === 1 ? (
              <span className="text-[#CC6600] font-mono text-xs font-semibold">Active</span>
            ) : null}
          </div>
          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Study title, research questions, objectives, and target deadline
          </p>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => currentStep > 2 && setCurrentStep(2)}
          className={`p-5 rounded-[2px] border transition-colors flex flex-col justify-between gap-2.5 ${
            currentStep === 2
              ? "bg-[#CC6600]/15 border-[#CC6600] text-white shadow-md shadow-[#CC6600]/5"
              : currentStep > 2
              ? "bg-emerald-500/10 border-emerald-500/30 text-white cursor-pointer hover:bg-emerald-500/15"
              : "bg-white/[0.02] border-white/[0.08] text-white/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              02. Document Uploads
            </span>
            {currentStep > 2 ? (
              <span className="text-emerald-400 font-mono text-xs font-semibold">✓ Done</span>
            ) : currentStep === 2 ? (
              <span className="text-[#CC6600] font-mono text-xs font-semibold">Active</span>
            ) : null}
          </div>
          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Draft chapters, raw datasets, and survey questionnaires
          </p>
        </div>

        {/* Step 3 */}
        <div
          className={`p-5 rounded-[2px] border transition-colors flex flex-col justify-between gap-2.5 ${
            currentStep === 3
              ? "bg-[#CC6600]/15 border-[#CC6600] text-white shadow-md shadow-[#CC6600]/5"
              : "bg-white/[0.02] border-white/[0.08] text-white/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              03. Review & Submit
            </span>
            {currentStep === 3 && (
              <span className="text-[#CC6600] font-mono text-xs font-semibold">Active</span>
            )}
          </div>
          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Institutional verification and final submission
          </p>
        </div>
      </div>

      {formError && <Alert variant="danger">{formError}</Alert>}
      {fileError && <Alert variant="danger">{fileError}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* ── STEP 1: Research Information ── */}
      {currentStep === 1 && (
        <Card className="p-8 md:p-10">
          <form onSubmit={handleProceedToStep2} className="flex flex-col gap-8">
            <div className="border-b border-white/[0.08] pb-5">
              <h2 className="text-base font-bold text-white font-sans">
                Research Project Specifications
              </h2>
              <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
                Provide foundational details about your thesis or investigation for statistical evaluation.
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

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/[0.08]">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="px-8 py-3 font-bold tracking-wider"
              >
                PROCEED TO DOCUMENT ATTACHMENTS →
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── STEP 2: Document Attachments ── */}
      {currentStep === 2 && (
        <Card className="p-8 md:p-10 flex flex-col gap-8">
          <div className="border-b border-white/[0.08] pb-5">
            <h2 className="text-base font-bold text-white font-sans">
              Attach Research Documents & Datasets
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
              Securely upload draft chapters, questionnaires, or raw datasets (DOCX, PDF, XLSX, CSV).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Box 1: Chapters 1-3 */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "RESEARCH_DOCUMENT")}
              onDragOver={(e) => handleDragOver(e, "RESEARCH_DOCUMENT")}
              onDragLeave={(e) => handleDragLeave(e, "RESEARCH_DOCUMENT")}
              onDrop={(e) => handleDrop(e, "RESEARCH_DOCUMENT")}
              className={`p-6 md:p-7 rounded-[3px] border bg-[#01162E] flex flex-col justify-between gap-6 min-h-[300px] transition-all ${
                dragActiveCategory === "RESEARCH_DOCUMENT"
                  ? "border-[#CC6600] bg-[#CC6600]/10 ring-2 ring-[#CC6600]/40"
                  : "border-white/[0.1]"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Draft Chapters (1-3)
                  </span>
                  <span className="text-[0.65rem] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-[2px]">
                    PDF / DOCX
                  </span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed font-sans">
                  Introduction, Literature Review, and Methodology framework (Max 50MB).
                </p>
              </div>

              {uploadingState.RESEARCH_DOCUMENT ? (
                <div className="p-4 bg-[#011C38] border border-[#CC6600]/50 rounded-[2px] flex flex-col gap-3 shadow-lg shadow-[#CC6600]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.RESEARCH_DOCUMENT.fileName}
                    </span>
                    <span className="text-xs font-mono text-[#CC6600] font-bold">
                      {uploadingState.RESEARCH_DOCUMENT.progress}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#CC6600] to-amber-400 transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.RESEARCH_DOCUMENT.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#CC6600] animate-ping" />
                      {uploadingState.RESEARCH_DOCUMENT.progress === 100
                        ? "Verifying file integrity..."
                        : "Uploading draft chapters..."}
                    </span>
                    <span>{uploadingState.RESEARCH_DOCUMENT.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "RESEARCH_DOCUMENT") ? (
                <div className="p-4 bg-[#011C38] border border-white/[0.12] rounded-[2px] flex flex-col gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono text-emerald-300 font-semibold break-all leading-snug">
                      {filesList.find((f) => f.category === "RESEARCH_DOCUMENT")?.name}
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono mt-1">
                      {filesList.find((f) => f.category === "RESEARCH_DOCUMENT")?.formattedSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-0.5">
                    <span className="text-[0.65rem] font-mono text-emerald-400 font-medium">✓ Ready</span>
                    <button
                      type="button"
                      onClick={() => removeFile("RESEARCH_DOCUMENT")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-[2px] transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`cursor-pointer border-2 border-dashed rounded-[3px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2 flex-1 min-h-[140px] ${
                    dragActiveCategory === "RESEARCH_DOCUMENT"
                      ? "border-[#CC6600] bg-[#CC6600]/20 scale-[1.01]"
                      : "border-white/20 hover:border-[#CC6600] bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileInputChange(e, "RESEARCH_DOCUMENT")}
                  />
                  <span className="text-xs font-mono text-[#CC6600] font-bold tracking-wider">
                    {dragActiveCategory === "RESEARCH_DOCUMENT"
                      ? "Drop file to attach"
                      : "+ Drag & Drop or Browse"}
                  </span>
                  <span className="text-[0.688rem] text-white/40 font-sans">
                    Drop PDF / DOCX or click to browse
                  </span>
                </label>
              )}
            </div>

            {/* Box 2: Dataset */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "DATASET")}
              onDragOver={(e) => handleDragOver(e, "DATASET")}
              onDragLeave={(e) => handleDragLeave(e, "DATASET")}
              onDrop={(e) => handleDrop(e, "DATASET")}
              className={`p-6 md:p-7 rounded-[3px] border bg-[#01162E] flex flex-col justify-between gap-6 min-h-[300px] transition-all ${
                dragActiveCategory === "DATASET"
                  ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                  : "border-white/[0.1]"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Raw Dataset File
                  </span>
                  <span className="text-[0.65rem] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px]">
                    CSV / XLSX
                  </span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed font-sans">
                  Tabulated respondent survey data, experiment records, or matrix sheets (Max 100MB).
                </p>
              </div>

              {uploadingState.DATASET ? (
                <div className="p-4 bg-[#011C38] border border-emerald-500/50 rounded-[2px] flex flex-col gap-3 shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.DATASET.fileName}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {uploadingState.DATASET.progress}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.DATASET.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {uploadingState.DATASET.progress === 100
                        ? "Validating data schema..."
                        : "Uploading raw dataset..."}
                    </span>
                    <span>{uploadingState.DATASET.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "DATASET") ? (
                <div className="p-4 bg-[#011C38] border border-white/[0.12] rounded-[2px] flex flex-col gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono text-emerald-300 font-semibold break-all leading-snug">
                      {filesList.find((f) => f.category === "DATASET")?.name}
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono mt-1">
                      {filesList.find((f) => f.category === "DATASET")?.formattedSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-0.5">
                    <span className="text-[0.65rem] font-mono text-emerald-400 font-medium">✓ Ready</span>
                    <button
                      type="button"
                      onClick={() => removeFile("DATASET")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-[2px] transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`cursor-pointer border-2 border-dashed rounded-[3px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2 flex-1 min-h-[140px] ${
                    dragActiveCategory === "DATASET"
                      ? "border-emerald-500 bg-emerald-500/20 scale-[1.01]"
                      : "border-white/20 hover:border-emerald-500 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileInputChange(e, "DATASET")}
                  />
                  <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">
                    {dragActiveCategory === "DATASET"
                      ? "Drop dataset to attach"
                      : "+ Drag & Drop or Browse"}
                  </span>
                  <span className="text-[0.688rem] text-white/40 font-sans">
                    Drop CSV / XLSX or click to browse
                  </span>
                </label>
              )}
            </div>

            {/* Box 3: Survey Questionnaire */}
            <div
              onDragEnter={(e) => handleDragEnter(e, "QUESTIONNAIRE")}
              onDragOver={(e) => handleDragOver(e, "QUESTIONNAIRE")}
              onDragLeave={(e) => handleDragLeave(e, "QUESTIONNAIRE")}
              onDrop={(e) => handleDrop(e, "QUESTIONNAIRE")}
              className={`p-6 md:p-7 rounded-[3px] border bg-[#01162E] flex flex-col justify-between gap-6 min-h-[300px] transition-all ${
                dragActiveCategory === "QUESTIONNAIRE"
                  ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/40"
                  : "border-white/[0.1]"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Survey Instrument
                  </span>
                  <span className="text-[0.65rem] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[2px]">
                    PDF / DOCX
                  </span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed font-sans">
                  Likert-scale questionnaire, interview guide, or rating matrix (Max 50MB).
                </p>
              </div>

              {uploadingState.QUESTIONNAIRE ? (
                <div className="p-4 bg-[#011C38] border border-amber-400/50 rounded-[2px] flex flex-col gap-3 shadow-lg shadow-amber-400/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-semibold truncate max-w-[170px]">
                      {uploadingState.QUESTIONNAIRE.fileName}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {uploadingState.QUESTIONNAIRE.progress}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.QUESTIONNAIRE.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[0.688rem] font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      {uploadingState.QUESTIONNAIRE.progress === 100
                        ? "Verifying questionnaire..."
                        : "Uploading survey instrument..."}
                    </span>
                    <span>{uploadingState.QUESTIONNAIRE.formattedSize}</span>
                  </div>
                </div>
              ) : filesList.some((f) => f.category === "QUESTIONNAIRE") ? (
                <div className="p-4 bg-[#011C38] border border-white/[0.12] rounded-[2px] flex flex-col gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono text-emerald-300 font-semibold break-all leading-snug">
                      {filesList.find((f) => f.category === "QUESTIONNAIRE")?.name}
                    </span>
                    <span className="text-[0.688rem] text-white/40 font-mono mt-1">
                      {filesList.find((f) => f.category === "QUESTIONNAIRE")?.formattedSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-0.5">
                    <span className="text-[0.65rem] font-mono text-emerald-400 font-medium">✓ Ready</span>
                    <button
                      type="button"
                      onClick={() => removeFile("QUESTIONNAIRE")}
                      className="text-xs font-mono text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-[2px] transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`cursor-pointer border-2 border-dashed rounded-[3px] p-6 text-center transition-all flex flex-col items-center justify-center gap-2 flex-1 min-h-[140px] ${
                    dragActiveCategory === "QUESTIONNAIRE"
                      ? "border-amber-400 bg-amber-400/20 scale-[1.01]"
                      : "border-white/20 hover:border-amber-400 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileInputChange(e, "QUESTIONNAIRE")}
                  />
                  <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">
                    {dragActiveCategory === "QUESTIONNAIRE"
                      ? "Drop questionnaire to attach"
                      : "+ Drag & Drop or Browse"}
                  </span>
                  <span className="text-[0.688rem] text-white/40 font-sans">
                    Drop PDF / DOCX or click to browse
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(1)}
              className="px-6"
            >
              ← Back to Scope
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleProceedToStep3}
              className="px-8 py-3 font-bold tracking-wider"
            >
              Proceed to Review & Submit →
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 3: Review & Submit ── */}
      {currentStep === 3 && (
        <Card className="p-8 md:p-10 flex flex-col gap-8">
          <div className="border-b border-white/[0.08] pb-5">
            <h2 className="text-base font-bold text-white font-sans">
              Summary Review & Submission
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
              Inspect your study specifications before sending them to the Admin Triage Queue for statistical pricing.
            </p>
          </div>

          {/* Institutional Affiliation Verification */}
          {profile && (
            <div className="p-5 md:p-6 rounded-[3px] bg-[#011C38] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
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
          <div className="flex flex-col gap-6 border border-white/[0.08] rounded-[3px] p-6 md:p-8 bg-white/[0.015]">
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
                  {filesList.length > 0
                    ? `${filesList.length} files attached`
                    : "No attachments provided"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Research Questions</span>
              <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans bg-black/20 p-4 rounded-[2px] border border-white/[0.05]">
                {researchQuestions}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Objectives</span>
              <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans bg-black/20 p-4 rounded-[2px] border border-white/[0.05]">
                {researchObjectives}
              </p>
            </div>

            {hypotheses && (
              <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">Hypotheses</span>
                <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans bg-black/20 p-4 rounded-[2px] border border-white/[0.05]">
                  {hypotheses}
                </p>
              </div>
            )}
          </div>

          {/* Academic Integrity Checkbox */}
          <div className="p-5 md:p-6 rounded-[3px] bg-[#CC6600]/10 border border-[#CC6600]/30">
            <FormCheckbox
              label={
                <span className="font-bold text-white">
                  Statement of Academic Authorship & Confidentiality
                </span>
              }
              description="I confirm that the submitted questionnaire and dataset belong to my academic thesis or institutional project. I understand JAXIS StatLab operates under strict peer review and non-disclosure standards."
              checked={integrityAgreed}
              onChange={(e) => setIntegrityAgreed(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(2)}
              disabled={isPending}
              className="px-6"
            >
              ← Back to Attachments
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleFinalSubmit}
              loading={isPending}
              disabled={!integrityAgreed}
              className="px-10 py-3.5 font-bold tracking-wider"
            >
              SUBMIT INTAKE FOR EVALUATION →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

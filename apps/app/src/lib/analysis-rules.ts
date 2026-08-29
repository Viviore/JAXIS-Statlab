import { db } from "@/lib/db";
import { AnalysisFileCategory, type ProjectStatus } from "@prisma/client";

export const ALLOWED_ANALYSIS_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/octet-stream",
  "text/x-r-source",
  "text/x-python",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/json",
];

export const ALLOWED_ANALYSIS_EXTENSIONS = [
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".sav",
  ".spv",
  ".r",
  ".rmd",
  ".py",
  ".ipynb",
  ".dta",
  ".do",
  ".zip",
  ".txt",
  ".docx",
];

export const MAX_ANALYSIS_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export const ANALYSIS_CATEGORY_METADATA: Record<
  AnalysisFileCategory,
  { label: string; description: string; badgeVariant: "sky" | "emerald" | "amber" | "info" | "secondary" | "warning" | "muted" }
> = {
  SPSS_OUTPUT: {
    label: "SPSS Output / Syntax",
    description: "SPSS dataset (.sav), output viewer (.spv), or syntax (.sps)",
    badgeVariant: "secondary",
  },
  R_OUTPUT: {
    label: "R Script / Markdown",
    description: "R source code (.r), RMarkdown (.rmd), or serialized output (.rds)",
    badgeVariant: "sky",
  },
  PYTHON_OUTPUT: {
    label: "Python / Jupyter",
    description: "Python script (.py) or computational notebook (.ipynb)",
    badgeVariant: "emerald",
  },
  EXCEL_WORKBOOK: {
    label: "Excel Workbook",
    description: "Statistical summary tables, crosstabs, and raw calculations (.xlsx)",
    badgeVariant: "emerald",
  },
  STATA_OUTPUT: {
    label: "Stata Output / Do-file",
    description: "Stata dataset (.dta), command log, or do-file (.do)",
    badgeVariant: "info",
  },
  PDF_REPORT: {
    label: "Analytical PDF Report",
    description: "Formal APA/scientific tables, write-ups, and statistical narratives (.pdf)",
    badgeVariant: "warning",
  },
  RAW_DATASET: {
    label: "Refined / Cleaned Dataset",
    description: "Preprocessed and imputed research dataset (.csv, .xlsx, .sav)",
    badgeVariant: "sky",
  },
  OTHER: {
    label: "Other Analytical Asset",
    description: "Supplementary archive (.zip), figure, or documentation",
    badgeVariant: "muted",
  },
};

/**
 * Asserts that the given statistician is actively assigned to the project.
 */
export async function assertStatisticianAssigned(
  projectId: string,
  statisticianId: string
): Promise<void> {
  const assignment = await db.assignment.findFirst({
    where: {
      projectId,
      statisticianId,
      isActive: true,
    },
  });

  if (!assignment) {
    throw new Error("NOT_ASSIGNED: You are not the actively assigned Lead Statistician for this study.");
  }
}

/**
 * Validates whether file uploads are permitted given the study's current master status.
 */
export function assertCanUploadAnalysis(status: ProjectStatus): {
  allowed: boolean;
  reason?: string;
} {
  if (status === "SCOPE_CREEP_HALTED") {
    return {
      allowed: false,
      reason: "Work is currently halted due to an active scope creep flag. Uploads will unlock once the supplemental quotation is resolved.",
    };
  }

  if (status === "FOR_QA") {
    return {
      allowed: false,
      reason: "This study is currently submitted for QA evaluation. File uploads are locked pending Senior QA Lead review.",
    };
  }

  if (["DELIVERED", "CLOSED", "HALTED", "CANCELLED", "DISPUTED", "EXPIRED", "ETHICAL_BREACH"].includes(status)) {
    return {
      allowed: false,
      reason: `File modifications are disabled because the study is in ${status} state.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates uploaded file MIME type and extension.
 */
export function validateAnalysisFileFormat(fileName: string, mimeType?: string, fileSize?: number): {
  valid: boolean;
  error?: string;
} {
  if (fileSize && fileSize > MAX_ANALYSIS_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed limit of 200MB.`,
    };
  }

  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const hasValidExt = ALLOWED_ANALYSIS_EXTENSIONS.includes(ext);

  if (!hasValidExt) {
    return {
      valid: false,
      error: `File extension "${ext}" is not supported. Supported extensions: ${ALLOWED_ANALYSIS_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

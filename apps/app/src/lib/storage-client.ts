import type { FileCategory } from "@prisma/client";

export interface R2UploadResult {
  fileName: string;
  storageKey: string;
  publicUrl: string;
  fileType: string;
  fileSize: number;
  fileCategory: FileCategory;
}

export interface UploadResponse {
  success: boolean;
  data?: R2UploadResult;
  error?: { code: string; message: string };
}

/**
 * Uploads a file directly to Cloudflare R2 through the JAXIS secure storage pipeline.
 * Returns the permanent Cloudflare storage key and public URL.
 */
export async function uploadFileToR2(
  file: File,
  category: FileCategory,
  studyId?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (studyId) {
    formData.append("studyId", studyId);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    try {
      const errJson = await res.json();
      return errJson;
    } catch {
      return {
        success: false,
        error: { code: "HTTP_ERROR", message: `Upload failed with HTTP status ${res.status}.` },
      };
    }
  }

  return res.json();
}

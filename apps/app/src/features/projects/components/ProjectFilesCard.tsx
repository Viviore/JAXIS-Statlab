"use client";

import React, { useState } from "react";
import { Card, Button, Toast } from "@repo/ui";
import {
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconFileZip,
  IconFileCode,
  IconPhoto,
  IconFileText,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react";
import {
  getFileMeta,
  formatFileCategory,
  triggerFileDownload,
  type FileMetadata,
} from "@/lib/file-utils";
import type { ProjectFileItem } from "@/features/projects/schemas";

export interface ProjectFilesCardProps {
  files: ProjectFileItem[];
  studyId?: string;
  className?: string;
  canDelete?: boolean;
  onDeleteFile?: (file: ProjectFileItem) => void;
}

// ── Tabler File Icons ──
function FileTypeIcon({ type, className = "w-5 h-5" }: { type: FileMetadata["iconType"]; className?: string }) {
  switch (type) {
    case "pdf":
      return <IconFileTypePdf size={20} stroke={1.5} className={className} />;
    case "doc":
      return <IconFileTypeDocx size={20} stroke={1.5} className={className} />;
    case "sheet":
      return <IconFileTypeXls size={20} stroke={1.5} className={className} />;
    case "data":
      return <IconFileTypeCsv size={20} stroke={1.5} className={className} />;
    case "code":
      return <IconFileCode size={20} stroke={1.5} className={className} />;
    case "archive":
      return <IconFileZip size={20} stroke={1.5} className={className} />;
    case "image":
      return <IconPhoto size={20} stroke={1.5} className={className} />;
    default:
      return <IconFileText size={20} stroke={1.5} className={className} />;
  }
}

export function ProjectFilesCard({
  files,
  className = "",
  canDelete = false,
  onDeleteFile,
}: ProjectFilesCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "danger";
  } | null>(null);

  // Single file download
  const handleDownload = async (file: ProjectFileItem) => {
    setDownloadingId(file.id);
    setToastMessage({
      message: "Download Initiated",
      description: `Transferring "${file.fileName}" to your local device.`,
      variant: "info",
    });
    try {
      await triggerFileDownload(file.filePath, file.fileName);
      setDownloadingId(null);
      setDownloadSuccessId(file.id);
      setTimeout(() => setDownloadSuccessId((prev) => (prev === file.id ? null : prev)), 2000);
    } catch {
      setDownloadingId(null);
    }
  };

  // Batch download all files
  const handleBatchDownloadAll = async () => {
    if (files.length === 0 || isBatchDownloading) return;
    setIsBatchDownloading(true);
    setToastMessage({
      message: "Batch Download Initiated",
      description: `Transferring ${files.length} study artifact files to your local device.`,
      variant: "info",
    });
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      await triggerFileDownload(file.filePath, file.fileName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setIsBatchDownloading(false);
  };

  return (
    <Card className={`p-6 sm:p-8 flex flex-col gap-6 ${className}`}>
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white font-sans flex items-center gap-2.5">
            <span>Attached Research Documents &amp; Datasets</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-[2px] bg-white/[0.06] text-sky-300 border border-white/10 font-semibold">
              {files.length}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {files.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDownloadAll}
              loading={isBatchDownloading}
              className="text-xs font-mono font-semibold tracking-wider whitespace-nowrap bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5"
            >
              <IconDownload size={14} stroke={1.5} className="text-amber-400" />
              <span>DOWNLOAD ALL</span>
            </Button>
          )}

          <span className="text-xs font-mono text-white/40 hidden sm:inline">
            Cloud Storage
          </span>
        </div>
      </div>

      {/* ── Files List ── */}
      {files.length === 0 ? (
        <div className="p-8 rounded-[2px] bg-[#011C38]/40 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2">
          <span className="text-xs font-mono text-white/40">
            No research files or dataset packages uploaded with this submission.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {files.map((file) => {
            const meta = getFileMeta(file.fileName, file.fileType);
            const category = formatFileCategory(file.fileCategory);
            const isDownloading = downloadingId === file.id;
            const isSuccess = downloadSuccessId === file.id;

            return (
              <div
                key={file.id}
                className="group rounded-[2px] bg-[#011C38] border border-white/[0.08] hover:border-white/20 transition-colors px-6 py-4.5 sm:px-7 sm:py-5 flex items-center justify-between gap-5 sm:gap-6"
              >
                {/* Left: Type Icon + File Details */}
                <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                  {/* File Icon Block */}
                  <div
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-[2px] ${meta.theme.bg} ${meta.theme.border} border flex flex-col items-center justify-center flex-shrink-0`}
                  >
                    <div className={meta.theme.iconColor}>
                      <FileTypeIcon type={meta.iconType} className="w-5 h-5" />
                    </div>
                    <span className={`text-[0.5625rem] font-mono font-bold uppercase tracking-wider ${meta.theme.text} mt-0.5`}>
                      {meta.ext}
                    </span>
                  </div>

                  {/* File Information */}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {/* Title + Category */}
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

                    {/* Metadata Subtitle */}
                    <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                      <span className="text-sky-300/80 font-mono">
                        {meta.friendlyType}
                      </span>
                      <span>·</span>
                      <span>
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Clean Tactical Download Button */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] font-mono text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                      isSuccess
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500 shadow-sm"
                        : "bg-[#CC6600]/20 hover:bg-[#CC6600]/35 active:bg-[#CC6600]/45 text-white border border-[#CC6600] shadow-sm hover:shadow-[#CC6600]/30 hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>DOWNLOADING...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <IconCheck size={16} stroke={2.5} className="text-emerald-400" />
                        <span>SAVED</span>
                      </>
                    ) : (
                      <>
                        <IconDownload size={16} stroke={1.5} className="text-[#FFA040]" />
                        <span>DOWNLOAD</span>
                      </>
                    )}
                  </button>

                  {canDelete && onDeleteFile && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteFile(file)}
                      className="text-xs font-mono px-3 py-2"
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

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </Card>
  );
}

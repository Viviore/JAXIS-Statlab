"use client";

import React, { useState } from "react";
import { Card, Button, Toast, FileTypeIcon } from "@repo/ui";
import {
  IconDownload,
  IconCheck,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import {
  getFileMeta,
  formatFileCategory,
  triggerFileDownload,
} from "@/lib/file-utils";
import type { ProjectFileItem } from "@/features/projects/schemas";
import { DocumentViewerLightbox } from "./DocumentViewerLightbox";

export interface ProjectFilesCardProps {
  files: ProjectFileItem[];
  studyId?: string;
  className?: string;
  canDelete?: boolean;
  onDeleteFile?: (file: ProjectFileItem) => void;
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
  const [previewFile, setPreviewFile] = useState<ProjectFileItem | null>(null);
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
                className="group rounded-[2px] bg-[#011C38] border border-white/[0.08] hover:border-white/20 transition-colors px-6 sm:px-8 lg:px-9 py-4.5 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6"
              >
                {/* Left: Type Icon + File Details */}
                <div
                  className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setPreviewFile(file)}
                >
                  {/* File Icon Block */}
                  <div
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-[2px] ${meta.theme.bg} ${meta.theme.border} border flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-[1.03] transition-transform`}
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
                      <span
                        className="text-sm font-semibold font-sans text-white truncate max-w-sm sm:max-w-md lg:max-w-xl group-hover:text-sky-300 transition-colors"
                        title={file.fileName}
                      >
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

                {/* Right Action: Harmonized Tactical Action Group */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 self-end sm:self-center" style={{ paddingRight: "0.75rem" }}>
                  {/* Built-in Preview Action */}
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[2px] font-mono text-xs font-semibold uppercase transition-all duration-150 cursor-pointer select-none bg-white/[0.04] hover:bg-white/[0.09] text-white/80 hover:text-white border border-white/15 hover:border-sky-400/50 shadow-sm"
                  >
                    <IconEye size={15} stroke={1.5} className="text-sky-400" />
                    <span>VIEW</span>
                  </button>

                  {/* Download Action */}
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[2px] font-mono text-xs font-semibold uppercase transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                      isSuccess
                        ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500 shadow-sm"
                        : "bg-[#CC6600]/15 hover:bg-[#CC6600]/30 active:bg-[#CC6600]/40 text-white border border-[#CC6600]/70 hover:border-[#FFA040] shadow-sm hover:-translate-y-0.5 active:translate-y-0"
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
                        <IconCheck size={15} stroke={2.5} className="text-emerald-400" />
                        <span>SAVED</span>
                      </>
                    ) : (
                      <>
                        <IconDownload size={15} stroke={1.5} className="text-[#FFA040]" />
                        <span>DOWNLOAD</span>
                      </>
                    )}
                  </button>

                  {/* Quiet Tactical Remove Trigger */}
                  {canDelete && onDeleteFile && (
                    <button
                      type="button"
                      onClick={() => onDeleteFile(file)}
                      title={`Remove "${file.fileName}"`}
                      className="inline-flex items-center justify-center p-2 rounded-[2px] font-mono text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer select-none shadow-sm"
                    >
                      <IconTrash size={15} stroke={1.5} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Google Docs Style Document & PDF Preview Lightbox ── */}
      {previewFile && (
        <DocumentViewerLightbox
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
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

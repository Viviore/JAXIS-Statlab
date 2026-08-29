"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PageHeader,
  KpiCard,
  Card,
  Badge,
  Button,
  LoadingState,
  Pagination,
  Toast,
} from "@repo/ui";
import {
  getArchivedProjectsAction,
  purgeExpiredFilesAction,
} from "@/features/reporting/actions";
import type { ArchivedProjectDTO } from "@/features/reporting/schemas";
import {
  IconArchive,
  IconClock,
  IconFileText,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconX,
  IconEye,
} from "@tabler/icons-react";

export default function AdminArchivePage() {
  const [archives, setArchives] = useState<ArchivedProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [packageFilter, setPackageFilter] = useState<string>("ALL");
  const [selectedArchive, setSelectedArchive] = useState<ArchivedProjectDTO | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getArchivedProjectsAction({
        search,
        packageName: packageFilter,
      });
      if (res.success && res.data) {
        setArchives(res.data);
      }
    } catch (err) {
      console.error("Failed to load archive data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, packageFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paginatedArchives = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return archives.slice(start, start + pageSize);
  }, [archives, currentPage, pageSize]);

  const handleRunPurge = async () => {
    setIsPurging(true);
    try {
      const res = await purgeExpiredFilesAction();
      if (res.success) {
        setToast({
          variant: "success",
          message: "Storage Purge Completed",
          description: `Successfully purged files for ${res.purgedCount} expired study records.`,
        });
        loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Purge Failed",
          description: res.error?.message || "Could not execute storage purge.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing purge.";
      setToast({ variant: "danger", message: "Error", description: msg });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Standardized PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "OPERATIONS", href: "/dashboard/admin" },
          { label: "PROJECT ARCHIVE" },
        ]}
        title="Project Archive & Retention Vault"
        description="Search immutable snapshots of completed studies and govern 90-day storage data retention policies."
        actions={
          <Button
            variant="secondary"
            className="text-xs h-8 px-3 flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
            onClick={handleRunPurge}
            disabled={isPurging}
          >
            <IconTrash size={14} />
            <span>{isPurging ? "Purging Files..." : "Run 90-Day Storage Purge"}</span>
          </Button>
        }
      />

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <KpiCard
          label="ARCHIVED STUDIES"
          value={archives.length}
          description="Immutable snapshots saved"
        />
        <KpiCard
          label="STORAGE PURGED"
          value={archives.filter((a) => a.filesPurged).length}
          description="Files purged past 90-day retention"
        />
        <KpiCard
          label="ACTIVE RETENTION"
          value={archives.filter((a) => !a.filesPurged).length}
          description="Within 90-day storage window"
        />
      </div>

      {/* Main Table Card */}
      <Card className="p-6 sm:p-8 flex flex-col gap-6 bg-[#01142B] border border-white/10 rounded-[4px]">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-white/10 pb-5">
          {/* Package Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Packages" },
              { id: "JX_01_CORE", label: "Core Consult" },
              { id: "JX_02_START", label: "Standard Stat" },
              { id: "JX_03_COMPRE", label: "Comprehensive" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setPackageFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all ${
                  packageFilter === tab.id
                    ? "bg-[#CC6600] text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by Intake ID, client name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-black/30 border border-white/10 rounded-[2px] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingState variant="table" label="Loading Archive Vault..." description="Querying archived study snapshots" />
          </div>
        ) : archives.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/40 flex flex-col items-center gap-2">
            <IconArchive size={28} stroke={1.5} className="text-white/20" />
            <span>No archived studies match your search filter.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-white/50 font-mono text-[0.688rem] uppercase tracking-wider">
                  <th className="py-3 px-4">Study Intake ID</th>
                  <th className="py-3 px-4">Lead Researcher</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Archived Date</th>
                  <th className="py-3 px-4">Storage Retention</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {paginatedArchives.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Study Intake ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <IconArchive size={15} className="text-[#CC6600]" />
                        <span>{item.intakeId}</span>
                      </div>
                    </td>

                    {/* Researcher */}
                    <td className="py-3.5 px-4 font-medium text-white/90">
                      {item.clientName}
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4 font-mono text-white/70">
                      {item.packageName}
                    </td>

                    {/* Archived Date */}
                    <td className="py-3.5 px-4 font-mono text-white/60">
                      {new Date(item.archivedAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Retention / Purge Status */}
                    <td className="py-3.5 px-4">
                      {item.filesPurged ? (
                        <Badge variant="outline" className="text-[0.688rem] text-white/40 border-white/10">
                          FILES PURGED
                        </Badge>
                      ) : (
                        <Badge variant="emerald" className="text-[0.688rem]">
                          FILES ACTIVE (90-DAY WINDOW)
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        className="text-xs h-7 px-2.5 flex items-center gap-1 inline-flex"
                        onClick={() => setSelectedArchive(item)}
                      >
                        <IconEye size={13} />
                        <span>View Snapshot</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && archives.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={archives.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              itemLabel="archived studies"
            />
          </div>
        )}
      </Card>

      {/* Snapshot Inspection Modal */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#01142B] border border-white/15 rounded-[4px] max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in-95 font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <IconArchive size={22} className="text-[#CC6600]" />
                <div>
                  <h3 className="text-base font-bold text-white">Immutable Project Snapshot</h3>
                  <span className="text-[0.688rem] font-mono text-white/50">{selectedArchive.intakeId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedArchive(null)}
                className="text-white/50 hover:text-white"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/30 p-4 rounded-[2px] border border-white/10">
                <div>
                  <span className="text-white/40 block">Lead Researcher</span>
                  <span className="text-white font-semibold">{selectedArchive.clientName}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Package Consultation</span>
                  <span className="text-sky-400 font-mono font-bold">{selectedArchive.packageName}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Archived Date</span>
                  <span className="text-white font-mono">{new Date(selectedArchive.archivedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Storage Retention Status</span>
                  <span className="text-white font-mono">{selectedArchive.filesPurged ? "Files Purged" : "Active"}</span>
                </div>
              </div>

              {/* JSON Snapshot Viewer */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-white/70">Read-Only Project State (Immutable JSON):</span>
                <pre className="p-3 bg-black/50 border border-white/10 rounded-[2px] text-white/80 font-mono text-[0.688rem] leading-relaxed max-h-60 overflow-y-auto">
                  {JSON.stringify(selectedArchive.snapshot, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-xs text-white/40">Read-only archived snapshot.</span>
              <Button
                variant="secondary"
                onClick={() => setSelectedArchive(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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

"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard, Toast } from "@repo/ui";
import { getProjects } from "@/features/projects/actions";
import { getClientProfile } from "@/features/client-profile/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import type { ProjectDetailItem } from "@/features/projects/schemas";

function ClientDashboardContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStudy, setSelectedStudy] = useState<ProjectDetailItem | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{
    variant: "success" | "danger" | "warning" | "info";
    message: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    const created = searchParams.get("created");
    const intakeId = searchParams.get("intakeId");
    if (created === "true") {
      setToast({
        variant: "success",
        message: "Study Intake Successfully Submitted",
        description: intakeId
          ? `Your research study specifications have been queued for triage. Assigned ID: ${intakeId}`
          : "Your research study specifications have been queued for triage.",
      });
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [projRes, profile] = await Promise.all([
          getProjects(),
          getClientProfile(),
        ]);

        if (projRes.success) {
          setProjects(projRes.data);
        }

        if (profile && profile.institutionSchool && profile.contactNumber) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      } catch (err) {
        console.error("Failed to load client portal data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter out any projects with pending missing info
  const awaitingInfoProjects = useMemo(() => {
    return projects.filter((p) => p.masterStatus === "AWAITING_INFORMATION");
  }, [projects]);

  // Filter projects with active quotation awaiting client response
  const pendingQuoteProjects = useMemo(() => {
    return projects.filter((p) => p.masterStatus === "QUOTE_SENT");
  }, [projects]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = projects.length;
    const awaitingInfo = projects.filter((p) => p.masterStatus === "AWAITING_INFORMATION").length;
    const inProgress = projects.filter(
      (p) =>
        p.masterStatus === "ACTIVE" ||
        p.masterStatus === "IN_PROGRESS" ||
        p.masterStatus === "EXPERT_ASSIGNED"
    ).length;
    const forQa = projects.filter(
      (p) => p.masterStatus === "FOR_QA" || p.masterStatus === "QA_REVISION"
    ).length;
    const delivered = projects.filter(
      (p) => p.masterStatus === "DELIVERED" || p.masterStatus === "CLOSED"
    ).length;

    return { total, awaitingInfo, inProgress, forQa, delivered };
  }, [projects]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full animate-content-fade">
      <PageHeader
        title="My Research Studies"
        description="Submit new research requests, track real-time statistical analysis progress, and download completed defense-ready tables and write-ups."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal" },
        ]}
        actions={
          <Link href="/dashboard/client/projects/new">
            <Button variant="primary" size="sm" className="font-bold tracking-wider">
              + SUBMIT NEW STUDY REQUEST
            </Button>
          </Link>
        }
      />

      {/* ── High-Priority Pending Quotation Alert Banner ── */}
      {pendingQuoteProjects.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingQuoteProjects.map((p) => (
            <Card
              key={p.id}
              className="p-5 border border-amber-500/40 bg-amber-500/[0.08] shadow-xl flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    ACTION REQUIRED: Commercial Quotation Ready for Review
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded-[2px]">
                    {p.intakeId}
                  </span>
                </div>
                <Link href={`/dashboard/client/projects/${p.id}/quote`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="py-1.5 px-3.5 h-auto font-mono text-xs font-bold tracking-wider bg-[#CC6600] text-white hover:bg-[#E67300]"
                  >
                    REVIEW PROPOSAL &amp; SOW →
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white font-sans">
                  {p.researchTitle}
                </p>
                <div className="text-xs text-white/70 font-sans mt-0.5">
                  Your customized statistical scope and deliverables breakdown are ready. Accept your quote to lock your assigned statistician.
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── High-Priority Missing Information Alert Banner ── */}
      {awaitingInfoProjects.length > 0 && (
        <div className="flex flex-col gap-3">
          {awaitingInfoProjects.map((p) => (
            <Card
              key={p.id}
              className="p-5 border border-amber-500/30 bg-amber-500/[0.06] shadow-xl flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    ACTION REQUIRED: Additional Files or Information Needed
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded-[2px]">
                    {p.intakeId}
                  </span>
                </div>
                <Link href={`/dashboard/client/projects/${p.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="py-1.5 px-3.5 h-auto font-mono text-xs font-bold tracking-wider"
                  >
                    VIEW &amp; UPLOAD FILES →
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white font-sans">
                  {p.researchTitle}
                </p>
                <div
                  className="p-3.5 rounded-[2px] bg-black/40 border border-amber-500/30 text-xs text-amber-100 font-sans leading-relaxed mt-1"
                  style={{ padding: "0.875rem 1rem" }}
                >
                  <strong className="text-amber-300 font-mono text-[0.6875rem] uppercase block mb-1">
                    Note from Statistical Team:
                  </strong>
                  &ldquo;{p.missingInfoReason || "Please attach the requested dataset or questionnaire clarification."}&rdquo;
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label="Profile Status"
          value={
            isProfileComplete === null
              ? "CHECKING..."
              : isProfileComplete
              ? "100% COMPLETE"
              : "INCOMPLETE"
          }
          variant={isProfileComplete ? "emerald" : "orange"}
          description={isProfileComplete ? "Institutional verified" : "Action required →"}
          href="/dashboard/client/profile"
        />

        <KpiCard
          label="My Studies"
          value={kpis.total}
          variant="default"
          description={
            kpis.awaitingInfo > 0
              ? `${kpis.awaitingInfo} action required`
              : "All workflows active"
          }
          href="/dashboard/client/projects"
        />

        <KpiCard
          label="In Progress / QA"
          value={kpis.inProgress + kpis.forQa}
          variant="amber"
          description="Statistical analysis underway"
        />

        <KpiCard
          label="Completed"
          value={kpis.delivered}
          variant="sky"
          description="APA 7th packages released"
        />
      </div>

      {/* Studies Table */}
      <Card
        className="p-0 overflow-hidden border border-white/[0.08] bg-[#010D1F]"
        style={{ padding: 0 }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ padding: "1.75rem 1.75rem 1.25rem 1.75rem" }}
        >
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-sans">
              My Research Projects
            </h2>
            <p className="text-xs text-white/50 mt-1.5 font-sans leading-relaxed">
              Real-time status of your commissioned statistical analyses
            </p>
          </div>
          <Link href="/dashboard/client/projects">
            <span className="text-xs font-mono text-white/60 hover:text-white transition-colors bg-white/[0.04] px-3 py-1.5 rounded-[2px] border border-white/10">
              View All ({projects.length}) →
            </span>
          </Link>
        </div>

        {/* ─ Table ─ */}
        <div style={{ padding: "0 1.75rem 1.75rem 1.75rem" }}>
          <div className="w-full overflow-x-auto rounded-[3px] border border-white/[0.08]">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[140px] whitespace-nowrap">Study ID</th>
                  <th>Research Study Title</th>
                  <th className="w-[140px] whitespace-nowrap">Target Deadline</th>
                  <th className="w-[160px] whitespace-nowrap">Status</th>
                  <th className="w-[120px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-white/30 font-mono text-xs"
                    >
                      Loading research projects...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-white/30 font-mono text-xs"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl font-mono text-white/20">∅</span>
                        <span className="text-sm font-semibold text-white/70">
                          No Research Projects Found
                        </span>
                        <span className="text-xs text-white/40">
                          Submit your first research intake questionnaire to begin.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.slice(0, 5).map((study) => (
                    <tr key={study.id} className="group">
                      <td className="font-mono text-xs text-[#FF9433] font-bold whitespace-nowrap">
                        <span className="bg-[#CC6600]/15 border border-[#CC6600]/30 px-2 py-0.5 rounded-[2px]">
                          {study.intakeId}
                        </span>
                      </td>
                      <td className="max-w-[440px] min-w-0">
                        <div className="flex flex-col gap-1 pr-2 min-w-0">
                          <Link
                            href={`/dashboard/client/projects/${study.id}`}
                            className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug"
                            title={study.researchTitle}
                          >
                            {study.researchTitle}
                          </Link>
                          {study.missingInfoReason &&
                            study.masterStatus === "AWAITING_INFORMATION" && (
                              <span
                                className="text-[0.6875rem] text-amber-300/90 font-mono truncate italic block min-w-0"
                                title={`Action Required: ${study.missingInfoReason}`}
                              >
                                Action Required: {study.missingInfoReason}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {new Date(study.deadlineRequested).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                          <span className="text-[0.6875rem] text-white/40 font-mono">
                            Target
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusBadge
                          status={study.masterStatus}
                          label={
                            PROJECT_STATUS_LABELS[study.masterStatus] ||
                            study.masterStatus
                          }
                          pulse={study.masterStatus === "AWAITING_INFORMATION"}
                        />
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/dashboard/client/projects/${study.id}`}>
                          <Button
                            variant={
                              study.masterStatus === "AWAITING_INFORMATION"
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            className="py-1 px-3 h-auto whitespace-nowrap font-mono text-xs tracking-wider"
                          >
                            {study.masterStatus === "AWAITING_INFORMATION"
                              ? "RESOLVE →"
                              : "VIEW STUDY"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`Study Details: ${selectedStudy.intakeId}`}
          description={selectedStudy.researchTitle}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
                CLOSE
              </Button>
              <Link href={`/dashboard/client/projects/${selectedStudy.id}`}>
                <Button variant="primary">OPEN PROJECT DESK →</Button>
              </Link>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs font-sans text-white/80">
            {selectedStudy.missingInfoReason &&
              selectedStudy.masterStatus === "AWAITING_INFORMATION" && (
                <div
                  className="p-4 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-200"
                  style={{ padding: "1rem" }}
                >
                  <strong className="text-amber-400 font-mono text-[0.6875rem] uppercase block mb-1">
                    Missing Information Requested:
                  </strong>
                  &ldquo;{selectedStudy.missingInfoReason}&rdquo;
                </div>
              )}
            <div
              className="p-4 rounded-[2px] bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3.5"
              style={{ padding: "1rem" }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                  Core Objectives:
                </span>
                <p className="text-xs text-white leading-relaxed">
                  {selectedStudy.researchObjectives}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">
                  Submitted Files:
                </span>
                <p className="text-xs font-mono text-sky-300">
                  {selectedStudy.files.length} attached document(s)
                </p>
              </div>
            </div>
          </div>
        </Modal>
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

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ClientDashboardContent />
    </Suspense>
  );
}


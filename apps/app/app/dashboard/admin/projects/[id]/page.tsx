"use client";

import React, { useState, useEffect, useCallback, useTransition, use } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  FormSelect,
  FormTextarea,
  Modal,
  ModalFooter,
  Alert,
  Toast,
  LoadingState,
} from "@repo/ui";
import {
  IconCheck,
  IconSettings,
  IconCopy,
  IconCalculator,
  IconReceipt,
  IconReceipt2,
  IconFileText,
  IconEdit,
} from "@tabler/icons-react";
import {
  getProjectById,
  updateProjectStatus,
  requestMissingInfo,
  markIntakeComplete,
} from "@/features/projects/actions";
import { getQuotationByProject } from "@/features/quotations/actions";
import { QuotationBuilderModal } from "@/features/quotations/components/QuotationBuilderModal";
import {
  VALID_TRANSITIONS,
  PROJECT_STATUS_LABELS,
  MISSING_INFO_TEMPLATES,
  getProjectDisplayStatus,
} from "@/lib/project-rules";
import { ProjectFilesCard } from "@/features/projects/components/ProjectFilesCard";
import { getProjectAssignment } from "@/features/assignments/actions";
import { AssignmentModal } from "@/features/assignments/components/AssignmentModal";
import { ProjectAssignmentCard } from "@/features/assignments/components/ProjectAssignmentCard";
import type { AssignmentDetailItem } from "@/features/assignments/schemas";
import { IconUserCheck } from "@tabler/icons-react";
import type { ProjectDetailItem } from "@/features/projects/schemas";
import type { QuotationDetailItem } from "@/features/quotations/schemas";
import type { ProjectStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProjectInspectionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [quotation, setQuotation] = useState<QuotationDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [missingInfoReason, setMissingInfoReason] = useState("");
  const [missingInfoError, setMissingInfoError] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<string>("");
  const [statusModalError, setStatusModalError] = useState<string | null>(null);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDetailItem | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleCopyId = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.intakeId);
    setToastMessage({
      message: "Copied to Clipboard",
      description: `Study ID "${project.intakeId}" has been copied to your clipboard.`,
      variant: "info",
    });
  };

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectRes, quoteRes, assignRes] = await Promise.all([
        getProjectById(projectId),
        getQuotationByProject(projectId),
        getProjectAssignment(projectId),
      ]);

      if (projectRes.success) {
        setProject(projectRes.data);
      } else {
        setError(projectRes.error.message);
      }

      setQuotation(quoteRes);

      if (assignRes.success) {
        setAssignment(assignRes.data);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load project details.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleMarkComplete = () => {
    if (!project) return;
    startTransition(async () => {
      const res = await markIntakeComplete(project.id);
      if (res.success) {
        loadProject();
      } else {
        setError(res.error.message);
      }
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = MISSING_INFO_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setMissingInfoReason(found.text);
      setMissingInfoError(null);
    }
  };

  const handleRequestMissingInfo = () => {
    if (!project) return;
    if (!missingInfoReason.trim() || missingInfoReason.trim().length < 5) {
      setMissingInfoError("Please provide an explanatory reason (min 5 characters).");
      return;
    }

    setMissingInfoError(null);
    startTransition(async () => {
      const res = await requestMissingInfo({
        projectId: project.id,
        reason: missingInfoReason.trim(),
      });

      if (res.success) {
        setToastMessage({
          message: "Information Request Sent",
          description: `Missing artifacts request dispatched to ${project.client.fullName}. Study transitioned to AWAITING_INFORMATION.`,
          variant: "warning",
        });
        setIsMissingInfoModalOpen(false);
        setMissingInfoReason("");
        setSelectedTemplateId("");
        loadProject();
      } else {
        setMissingInfoError(res.error.message);
        setToastMessage({
          message: "Request Failed",
          description: res.error.message,
          variant: "danger",
        });
      }
    });
  };

  const handleStatusTransition = () => {
    if (!project || !selectedTargetStatus) return;

    setStatusModalError(null);
    startTransition(async () => {
      const res = await updateProjectStatus({
        projectId: project.id,
        status: selectedTargetStatus as ProjectStatus,
      });

      if (res.success) {
        setToastMessage({
          message: "Status Transition Applied",
          description: `Study transitioned to ${PROJECT_STATUS_LABELS[selectedTargetStatus as ProjectStatus] || selectedTargetStatus}.`,
          variant: "success",
        });
        setIsStatusModalOpen(false);
        loadProject();
      } else {
        setStatusModalError(res.error.message);
        setToastMessage({
          message: "Transition Failed",
          description: res.error.message,
          variant: "danger",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[50vh] w-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Loading Project Inspection Desk..."
          description="Retrieving analytical milestones, deliverables, and communication logs."
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <PageHeader
          title="Study Record Not Found"
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Admin Command", href: "/dashboard/admin" },
            { label: "Intake Triage", href: "/dashboard/admin/intake" },
            { label: "Detail" },
          ]}
        />
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-red-400 font-mono">
            {error || "The requested project record could not be loaded."}
          </p>
          <Link href="/dashboard/admin/intake">
            <Button variant="secondary" size="md">
              ← Return to Intake Triage Queue
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const allowedTransitions = VALID_TRANSITIONS[project.masterStatus] || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title={project.researchTitle}
        description={`Study ID: ${project.intakeId} · Primary Client: ${project.client.fullName} · Submitted ${new Date(
          project.createdAt
        ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${new Date(
          project.createdAt
        ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Command", href: "/dashboard/admin" },
          { label: "Intake Triage", href: "/dashboard/admin/intake" },
          { label: project.intakeId },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/admin/projects/${project.id}/analysis`}>
              <Button variant="outline" size="sm" className="rounded-[2px] text-xs">
                Analysis Files Audit
              </Button>
            </Link>
            <Link href="/dashboard/admin/intake">
              <Button variant="secondary" size="sm" className="rounded-[2px] text-xs">
                ← Triage Queue
              </Button>
            </Link>
          </div>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Governance Status Action Bar ── */}
      <Card
        className="overflow-hidden border border-white/10 bg-[#01142B]/90 rounded-[4px] shadow-lg"
        style={{ padding: "0.875rem 1.5rem" }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-sans text-white/60 uppercase font-semibold tracking-wider">
                Current Master Status:
              </span>
              {(() => {
                const displayStatus = getProjectDisplayStatus(project);
                return (
                  <StatusBadge
                    status={displayStatus.status}
                    label={displayStatus.label}
                    pulse={displayStatus.pulse || project.masterStatus === "NEW_REQUEST" || project.masterStatus === "AWAITING_INFORMATION"}
                  />
                );
              })()}
              <button
                type="button"
                onClick={handleCopyId}
                title="Click to copy Study ID"
                className="text-xs font-mono font-bold text-[#FF9433] bg-[#CC6600]/15 hover:bg-[#CC6600]/25 border border-[#CC6600]/30 hover:border-[#CC6600] px-2.5 py-1 rounded-[3px] whitespace-nowrap cursor-pointer transition-all inline-flex items-center gap-1.5 group/btn ml-1"
              >
                <span>{project.intakeId}</span>
                <IconCopy size={13} stroke={1.5} className="opacity-60 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {project.masterStatus === "UNDER_EVALUATION" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsQuotationModalOpen(true)}
                className="text-xs font-mono font-bold tracking-wider whitespace-nowrap flex items-center gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300]"
              >
                <IconCalculator size={14} stroke={1.5} />
                <span>{quotation ? "EDIT QUOTATION DRAFT" : "BUILD COMMERCIAL QUOTE →"}</span>
              </Button>
            )}

            {(project.masterStatus === "QUOTE_SENT" || project.masterStatus === "CLIENT_APPROVED") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsQuotationModalOpen(true)}
                className="text-xs font-mono tracking-wider whitespace-nowrap flex items-center gap-1.5"
              >
                <IconFileText size={14} stroke={1.5} />
                <span>COMMERCIAL QUOTE DETAILS</span>
              </Button>
            )}

            {(project.masterStatus === "SOW_SIGNED" ||
              project.masterStatus === "AWAITING_PAYMENT" ||
              project.masterStatus === "ACTIVE" ||
              project.masterStatus === "EXPERT_ASSIGNED" ||
              project.masterStatus === "IN_PROGRESS" ||
              project.masterStatus === "FOR_QA") && (
              <Link href={`/dashboard/admin/projects/${project.id}/payment`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs font-sans whitespace-nowrap flex items-center gap-1.5"
                >
                  <IconReceipt size={14} stroke={1.5} />
                  <span>Payment Ledger</span>
                </Button>
              </Link>
            )}

            {project.masterStatus === "ACTIVE" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssignmentModalOpen(true)}
                className="text-xs font-sans font-semibold whitespace-nowrap flex items-center gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300] rounded-[2px]"
              >
                <IconUserCheck size={14} stroke={2} />
                <span>+ Assign Specialists</span>
              </Button>
            )}

            {(project.masterStatus === "NEW_REQUEST" ||
              project.masterStatus === "AWAITING_INFORMATION") && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkComplete}
                disabled={isPending}
                className="text-xs font-mono font-bold tracking-wider whitespace-nowrap flex items-center gap-1"
              >
                <IconCheck size={14} stroke={2.5} />
                MARK INTAKE COMPLETE
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMissingInfoReason(project.missingInfoReason || "");
                setIsMissingInfoModalOpen(true);
              }}
              className="text-xs font-mono tracking-wider whitespace-nowrap"
            >
              REQUEST MISSING INFO
            </Button>

            {allowedTransitions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTargetStatus(allowedTransitions[0]!);
                  setIsStatusModalOpen(true);
                }}
                className="text-xs font-mono tracking-wider whitespace-nowrap flex items-center gap-1.5"
              >
                <IconSettings size={14} stroke={1.5} />
                TRANSITION STATUS
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Missing Information Reason (if active) ── */}
      {project.masterStatus === "AWAITING_INFORMATION" && project.missingInfoReason && (
        <Card className="p-5 bg-amber-500/[0.04] border-l-4 border-l-amber-500 flex flex-col gap-2">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase">
            Active Missing Information Request:
          </span>
          <p
            className="text-xs text-white/90 leading-relaxed font-sans bg-black/30 p-4 rounded-[2px] border border-white/[0.08]"
            style={{ padding: "1rem" }}
          >
            &ldquo;{project.missingInfoReason}&rdquo;
          </p>
        </Card>
      )}

      {/* ── Specialist Assignment & SLA Tracking (Module 08) ── */}
      {assignment && (
        <ProjectAssignmentCard
          assignment={assignment}
          onRefresh={loadProject}
          onReassign={() => setIsAssignmentModalOpen(true)}
          canManage={true}
        />
      )}

      {/* ── Main Inspection Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Research Content & Datasets */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Commercial Proposal & Quotation Card (Module 05) */}
          {(project.masterStatus === "UNDER_EVALUATION" ||
            project.masterStatus === "QUOTE_SENT" ||
            project.masterStatus === "CLIENT_APPROVED" ||
            quotation !== null) && (
            <Card className="p-6 bg-[#01142B] border border-white/[0.08] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <IconReceipt2 size={18} stroke={1.5} className="text-[#CC6600]" />
                  <h3 className="text-sm font-bold text-white font-sans">
                    Commercial Proposal &amp; Quotation
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {quotation ? (
                    <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-[2px] bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold uppercase">
                      STATUS: {quotation.status}
                    </span>
                  ) : (
                    <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                      READY FOR PROPOSAL MODELING
                    </span>
                  )}
                </div>
              </div>

              {quotation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.06]">
                    <div>
                      <div className="text-[0.5625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                        Package Tier
                      </div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {quotation.packageName.replace(/_/g, " ")}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                        Contract Sum
                      </div>
                      <div className="text-sm font-bold text-[#38BDF8] font-mono mt-0.5">
                        ₱{quotation.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                        Downpayment Due
                      </div>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        ₱{quotation.downpaymentRequired.toLocaleString()}
                        <span className="text-xs font-normal text-white/50 ml-1">
                          ({quotation.downpaymentPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                        Proposal Validity
                      </div>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {quotation.isExpired ? (
                          <span className="text-rose-400">Expired</span>
                        ) : (
                          new Date(quotation.expiresAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-white/60 font-mono">
                      {quotation.lineItems.length} line item(s) included in this proposal
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsQuotationModalOpen(true)}
                        className="gap-1.5"
                      >
                        <IconEdit size={13} stroke={1.5} />
                        <span>{quotation.status === "DRAFT" ? "Edit Quote Draft" : "View Quote Details"}</span>
                      </Button>

                      {(project.masterStatus === "CLIENT_APPROVED" ||
                        project.masterStatus === "SOW_PENDING" ||
                        project.masterStatus === "SOW_SIGNED" ||
                        project.masterStatus === "AWAITING_PAYMENT") && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/dashboard/admin/projects/${project.id}/sow`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 font-sans text-xs font-semibold px-3.5 py-2"
                            >
                              <IconFileText size={15} stroke={1.5} />
                              <span>View SOW Contract →</span>
                            </Button>
                          </Link>
                          {(project.hasPendingPaymentVerification || project.latestPaymentStatus === "PROOF_SUBMITTED" || project.masterStatus === "AWAITING_PAYMENT") && (
                            <Link href={`/dashboard/admin/projects/${project.id}/payment`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="gap-2 bg-[#CC6600] text-white hover:bg-[#FFA040] font-sans text-xs font-semibold px-3.5 py-2"
                              >
                                <IconReceipt size={15} stroke={1.5} />
                                <span>{project.hasPendingPaymentVerification || project.latestPaymentStatus === "PROOF_SUBMITTED" ? "Review & Clear Deposit Funds →" : "Open Payment Desk →"}</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Intake evaluation is complete. Select an analytical package tier and priority add-ons to build the commercial proposal.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsQuotationModalOpen(true)}
                    className="whitespace-nowrap gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300]"
                  >
                    <IconCalculator size={14} stroke={1.5} />
                    <span>Launch Quote Builder →</span>
                  </Button>
                </div>
              )}
            </Card>
          )}

          <Card className="p-6 md:p-8 flex flex-col gap-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white font-sans">
                Research Problem &amp; Analytical Scope
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40 font-bold">
                Statement of the Problem / Key Questions
              </span>
              <div
                className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                style={{ padding: "1rem" }}
              >
                {project.researchQuestions}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40 font-bold">
                Core Research Objectives
              </span>
              <div
                className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                style={{ padding: "1rem" }}
              >
                {project.researchObjectives}
              </div>
            </div>

            {project.hypotheses && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase text-white/40 font-bold">
                  Theoretical Hypotheses
                </span>
                <div
                  className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                  style={{ padding: "1rem" }}
                >
                  {project.hypotheses}
                </div>
              </div>
            )}
          </Card>

          {/* Attached Files Card */}
          <ProjectFilesCard files={project.files} studyId={project.intakeId} />
        </div>

        {/* Right Col: Client Institutional Identity */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold border-b border-white/[0.08] pb-2">
              Client & Institutional Profile
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-white/40 block">Full Name</span>
                <span className="text-white font-semibold font-sans">{project.client.fullName}</span>
              </div>

              <div>
                <span className="text-white/40 block">Email Address</span>
                <span className="text-white font-mono">{project.client.email}</span>
              </div>

              {project.client.clientProfile ? (
                <>
                  <div>
                    <span className="text-white/40 block">University / Institution</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.institutionSchool}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Academic Degree / Program</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.academicProgram}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Contact Number</span>
                    <span className="text-white font-mono">
                      {project.client.clientProfile.contactNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Philippine Region</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.region}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-[2px] text-amber-300 text-xs">
                  Institutional profile not registered.
                </div>
              )}
            </div>
          </Card>

          {/* Study Information Summary */}
          <Card className="p-6 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold border-b border-white/[0.08] pb-2">
              Study Information
            </h3>
            <div className="flex flex-col gap-2.5 text-xs font-mono text-white/60">
              <div className="flex justify-between items-center gap-2">
                <span>Created:</span>
                <span className="text-white text-right">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })},{" "}
                  {new Date(project.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span>Last Modified:</span>
                <span className="text-white text-right">
                  {new Date(project.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })},{" "}
                  {new Date(project.updatedAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span>Target Deadline:</span>
                <span className="text-amber-400 font-mono font-medium text-right">
                  {new Date(project.deadlineRequested).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dispute Flag:</span>
                <span className={project.hasActiveDispute ? "text-red-400" : "text-emerald-400"}>
                  {project.hasActiveDispute ? "Active Dispute" : "Clean"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Request Missing Info Modal ── */}
      {isMissingInfoModalOpen && (
        <Modal
          isOpen={isMissingInfoModalOpen}
          onClose={() => setIsMissingInfoModalOpen(false)}
          title={`Request Missing Information (${project.intakeId})`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Describe what research documents or dataset information the client must attach. This transitions status to <code className="text-amber-400 font-mono">AWAITING_INFORMATION</code>.
            </p>

            {/* Template Selector Dropdown */}
            <div className="flex flex-col gap-1.5">
              <FormSelect
                label="Pre-Configured Request Template (Optional)"
                monoLabel
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                options={[
                  { value: "", label: "-- Select a Standard Request Template (Auto-fills note) --" },
                  ...MISSING_INFO_TEMPLATES.map((t) => ({
                    value: t.id,
                    label: `[${t.category.toUpperCase()}] ${t.label}`,
                  })),
                ]}
              />
            </div>

            <FormTextarea
              label="Information Required Note"
              required
              rows={4}
              placeholder="e.g. Please upload the questionnaire tool and specify sample size N."
              value={missingInfoReason}
              onChange={(e) => {
                setMissingInfoReason(e.target.value);
                if (selectedTemplateId) setSelectedTemplateId("");
              }}
              error={missingInfoError || undefined}
              monoLabel
            />

            <ModalFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMissingInfoModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestMissingInfo}
                loading={isPending}
              >
                Send Request
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* ── Status Transition Modal ── */}
      {isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`State Machine Status Transition: ${project.intakeId}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Select an approved state transition from the JAXIS project lifecycle state machine.
            </p>

            <FormSelect
              label="Permitted Target Status"
              options={allowedTransitions.map((t) => ({
                label: `${PROJECT_STATUS_LABELS[t] || t} (${t})`,
                value: t,
              }))}
              value={selectedTargetStatus}
              onChange={(e) => setSelectedTargetStatus(e.target.value)}
              monoLabel
            />

            {statusModalError && (
              <span className="text-xs text-red-400 font-mono">{statusModalError}</span>
            )}

            <ModalFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStatusTransition}
                loading={isPending}
              >
                Apply Transition
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* Commercial Quotation Builder Modal */}
      {project && (
        <QuotationBuilderModal
          isOpen={isQuotationModalOpen}
          onClose={() => setIsQuotationModalOpen(false)}
          projectId={project.id}
          projectIntakeId={project.intakeId}
          projectTitle={project.researchTitle}
          clientName={project.client.fullName}
          existingQuotation={quotation}
          onSuccess={loadProject}
        />
      )}

      {/* Specialist Assignment Modal (Module 08) */}
      {project && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          projectId={project.id}
          projectTitle={project.researchTitle}
          projectMethod={project.packageName?.replace(/_/g, " ")}
          existingAssignment={assignment}
          onSuccess={() => {
            loadProject();
            setToastMessage({
              message: assignment ? "Specialist Reassigned" : "Specialists Assigned",
              description: `Study ${project.intakeId} has been successfully staffed. SLA countdown active.`,
              variant: "success",
            });
          }}
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
    </div>
  );
}

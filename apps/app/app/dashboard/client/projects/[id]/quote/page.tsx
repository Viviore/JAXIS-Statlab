"use client";

import React, { useState, useEffect, useCallback, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  Button,
  Modal,
  ModalFooter,
  Toast,
  LoadingState,
  Peso,
} from "@repo/ui";
import {
  IconArrowLeft,
  IconCheck,
  IconReceipt,
  IconClock,
  IconShieldCheck,
  IconSparkles,
  IconAlertTriangle,
  IconSchool,
  IconBolt,
  IconFlame,
  IconLock,
  IconCopy,
  IconX,
  IconClipboardList,
  IconFileText,
  IconFileCertificate,
} from "@tabler/icons-react";
import { getProjectById } from "@/features/projects/actions";
import {
  getQuotationByProject,
  respondQuotation,
} from "@/features/quotations/actions";
import {
  PACKAGES_CATALOG,
  ADDONS_CATALOG,
} from "@/lib/pricing-rules";
import type { ProjectDetailItem } from "@/features/projects/schemas";
import type { QuotationDetailItem } from "@/features/quotations/schemas";
import type { AddOnName } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientQuotationReviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [quotation, setQuotation] = useState<QuotationDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision Modal States
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projRes, quoteRes] = await Promise.all([
        getProjectById(projectId),
        getQuotationByProject(projectId),
      ]);

      if (projRes.success && projRes.data) {
        setProject(projRes.data);
      } else {
        setError(!projRes.success ? projRes.error.message : "Failed to load project details.");
      }

      setQuotation(quoteRes);
    } catch {
      setError("Failed to load commercial quotation proposal.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyId = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.intakeId);
    setToastMessage({
      message: "Copied to Clipboard",
      description: `Study ID ${project.intakeId} copied.`,
      variant: "info",
    });
  };

  const handleAcceptProposal = () => {
    if (!quotation) return;

    startTransition(async () => {
      try {
        const res = await respondQuotation({
          quotationId: quotation.id,
          decision: "ACCEPT",
        });

        if (res.success) {
          setToastMessage({
            message: "Proposal Accepted",
            description: "Your proposal is confirmed. Redirecting to Statement of Work agreement...",
            variant: "success",
          });
          setIsAcceptModalOpen(false);
          router.push(`/dashboard/client/projects/${projectId}/sow`);
        } else {
          setToastMessage({
            message: "Acceptance Failed",
            description: res.error?.message || "Failed to accept proposal.",
            variant: "danger",
          });
        }
      } catch (err: unknown) {
        setToastMessage({
          message: "System Error",
          description: (err as Error).message || "An unexpected error occurred.",
          variant: "danger",
        });
      }
    });
  };

  const handleDeclineProposal = () => {
    if (!quotation) return;

    startTransition(async () => {
      try {
        const res = await respondQuotation({
          quotationId: quotation.id,
          decision: "DECLINE",
          declineReason,
        });

        if (res.success) {
          setToastMessage({
            message: "Proposal Declined",
            description: "Your feedback has been transmitted to our statistical team for revision.",
            variant: "warning",
          });
          setIsDeclineModalOpen(false);
          await loadData();
        } else {
          setToastMessage({
            message: "Decline Failed",
            description: res.error?.message || "Failed to process decline response.",
            variant: "danger",
          });
        }
      } catch (err: unknown) {
        setToastMessage({
          message: "System Error",
          description: (err as Error).message || "An unexpected error occurred.",
          variant: "danger",
        });
      }
    });
  };

  const getAddOnIcon = (name: AddOnName | string) => {
    switch (name) {
      case "DEFENSELAB":
        return <IconSchool size={20} stroke={1.5} className="text-sky-400" />;
      case "RUSH":
        return <IconBolt size={20} stroke={1.5} className="text-amber-400" />;
      case "EXPRESS":
        return <IconFlame size={20} stroke={1.5} className="text-orange-400" />;
      case "EMERGENCY":
        return <IconAlertTriangle size={20} stroke={1.5} className="text-rose-400" />;
      default:
        return <IconSparkles size={20} stroke={1.5} className="text-amber-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[50vh] w-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Retrieving commercial proposal..."
          description="Loading analytical scope, milestone schedule, and pricing basis"
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
        <PageHeader
          title="Proposal Error"
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Projects", href: "/dashboard/client/projects" },
            { label: "Commercial Proposal" },
          ]}
        />
        <Card className="p-8 sm:p-12 text-center flex flex-col items-center gap-6 bg-[#01142B]/90 border border-white/10 rounded-[6px]">
          <IconAlertTriangle size={36} stroke={1.5} className="text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-sans">Unable to Load Quotation</h2>
            <p className="text-sm text-white/60 font-sans">{error || "Study not found."}</p>
          </div>
          <Link href="/dashboard/client/projects">
            <Button variant="secondary" size="md">
              ← Return to Projects Registry
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
        <PageHeader
          title={project.researchTitle}
          description={`Study ID: ${project.intakeId} · Primary Client: ${project.client.fullName}`}
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Client Portal", href: "/dashboard/client" },
            { label: "Projects", href: "/dashboard/client/projects" },
            { label: project.intakeId, href: `/dashboard/client/projects/${projectId}` },
            { label: "Commercial Proposal" },
          ]}
          actions={
            <Link href={`/dashboard/client/projects/${projectId}`}>
              <Button variant="secondary" size="sm" className="font-sans font-semibold text-xs">
                ← Return to Study Details
              </Button>
            </Link>
          }
        />

        <Card className="p-10 sm:p-14 bg-[#01142B] border border-white/10 rounded-[6px] text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
          <div className="h-14 w-14 rounded-full bg-[#CC6600]/15 border border-[#CC6600]/30 flex items-center justify-center mx-auto text-[#FFA040]">
            <IconClock size={32} stroke={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white font-sans">
              Proposal Under Statistical Modeling
            </h2>
            <p className="text-sm text-white/70 font-sans leading-relaxed">
              Our Senior Statistical Team is currently reviewing your study methodology, hypotheses, and uploaded data vectors to prepare a customized commercial proposal. You will be notified as soon as your quote is issued.
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/dashboard/client/projects/${projectId}`}>
              <Button variant="secondary" size="md">
                View Study Tracker
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const pkgDef = PACKAGES_CATALOG[quotation.packageName] || PACKAGES_CATALOG.JX_03_CORE;
  const activeAddOns = quotation.lineItems.filter((li) => li.itemType === "ADDON");

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
      {/* ── 1. Page Header ── */}
      <PageHeader
        title={project.researchTitle}
        description={`Study ID: ${project.intakeId} · Primary Client: ${project.client.fullName} · Submitted ${new Date(
          project.createdAt
        ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Projects", href: "/dashboard/client/projects" },
          { label: project.intakeId, href: `/dashboard/client/projects/${projectId}` },
          { label: "Commercial Proposal" },
        ]}
        actions={
          <Link href={`/dashboard/client/projects/${projectId}`}>
            <Button variant="secondary" size="sm" className="font-sans font-semibold text-xs flex items-center gap-2">
              <IconArrowLeft size={15} stroke={1.5} />
              <span>Return to Study Details</span>
            </Button>
          </Link>
        }
      />

      {/* ── 2. Governance Status Action Bar ── */}
      <Card className="p-5 sm:p-6 bg-[#01142B] border border-white/10 rounded-[4px] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-sans text-white/50 uppercase font-bold tracking-wider">
              Proposal Status:
            </span>
            {quotation.status === "CLIENT_APPROVED" ? (
              <span className="text-xs font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-[3px] uppercase font-bold flex items-center gap-1.5">
                <IconCheck size={14} stroke={2.5} />
                PROPOSAL ACCEPTED
              </span>
            ) : quotation.status === "QUOTE_DECLINED" ? (
              <span className="text-xs font-sans text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-[3px] uppercase font-bold flex items-center gap-1.5">
                <IconX size={14} stroke={2.5} />
                PROPOSAL DECLINED
              </span>
            ) : quotation.isExpired ? (
              <span className="text-xs font-sans text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-[3px] uppercase font-bold flex items-center gap-1.5">
                <IconAlertTriangle size={14} stroke={2} />
                PROPOSAL EXPIRED
              </span>
            ) : (
              <span className="text-xs font-sans text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-[3px] uppercase font-bold flex items-center gap-1.5">
                <IconClock size={14} stroke={2} />
                READY FOR YOUR REVIEW
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy Study ID"
              className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400 px-2.5 py-1 rounded-[3px] whitespace-nowrap cursor-pointer transition-all inline-flex items-center gap-1.5"
            >
              <span>{project.intakeId}</span>
              <IconCopy size={13} stroke={1.5} className="opacity-60" />
            </button>
          </div>

          {quotation.status === "QUOTE_SENT" && !quotation.isExpired && (
            <div className="text-xs font-sans text-white/70 flex items-center gap-2">
              <span className="text-white/40">Proposal Valid Until:</span>
              <span className="text-amber-300 font-mono font-bold">
                {new Date(quotation.expiresAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B]/90 border border-white/10 rounded-[4px] flex flex-col gap-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[2px] bg-[#CC6600]/15 border border-[#CC6600]/30 flex items-center justify-center shrink-0 text-[#FFA040]">
                  <IconClipboardList size={18} stroke={1.5} />
                </div>
                <div>
                  <span className="text-xs font-sans uppercase text-[#FFA040] font-semibold tracking-wider block">
                    Commercial Package Tier ({pkgDef?.id || quotation.packageName})
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white font-sans mt-0.5">
                    {pkgDef?.name || quotation.packageName}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-[2px] font-semibold uppercase self-start sm:self-auto">
                {pkgDef?.badge || "Ready"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed">
              {pkgDef?.tagline || "Comprehensive statistical modeling and hypothesis testing scope."}
            </p>

            {pkgDef?.deliverables && pkgDef.deliverables.length > 0 && (
              <div className="p-5 sm:p-6 rounded-[2px] bg-[#010D1F] border border-white/10 space-y-3">
                <div className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                  Guaranteed Deliverables Included in this Scope:
                </div>
                <ul className="space-y-2.5 pt-0.5">
                  {pkgDef.deliverables.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-white/85 font-sans flex items-start gap-2.5">
                      <IconCheck size={16} stroke={2} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-6 sm:p-8 bg-[#01142B]/90 border border-white/10 rounded-[4px] flex flex-col gap-5 shadow-xl">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2.5">
                <IconReceipt size={18} stroke={1.5} className="text-[#CC6600]" />
                <span>Itemized Commercial Schedule</span>
              </h3>
              <span className="text-xs font-sans text-white/60 uppercase font-semibold px-2.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10">
                {quotation.isUpfrontEnforced ? "100% Upfront" : "50% Milestone"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white font-sans">{pkgDef?.name || quotation.packageName}</span>
                    <span className="text-[0.6875rem] font-sans uppercase px-2 py-0.5 rounded-[2px] bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                      Base Service
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Core computational analysis &amp; APA 7th reporting
                  </p>
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-white flex-shrink-0 self-end sm:self-auto">
                  <Peso />{quotation.basePrice.toLocaleString()}
                </div>
              </div>

              {activeAddOns.map((addon) => {
                const addDef = ADDONS_CATALOG[addon.itemName as AddOnName];
                return (
                  <div
                    key={addon.id}
                    className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getAddOnIcon(addon.itemName)}
                        <span className="text-sm font-semibold text-white font-sans">
                          {addDef?.name || addon.itemName}
                        </span>
                        <span className="text-[0.6875rem] font-sans uppercase px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          Priority Add-on
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-sans leading-relaxed">
                        {addon.description || addDef?.tagline || "Optional Priority Service"}
                      </p>
                    </div>
                    <div className="text-base sm:text-lg font-mono font-bold text-amber-300 flex-shrink-0 self-end sm:self-auto">
                      +<Peso />{addon.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}

              <div className="p-5 sm:p-6 rounded-[2px] bg-[#010D1F] border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mt-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-semibold uppercase text-sky-400 tracking-wider block">
                    Total Contract Sum
                  </span>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    All-inclusive research computation, quality audit, and reporting deliverables
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#38BDF8] flex-shrink-0 self-end sm:self-auto">
                  <Peso />{quotation.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          {quotation.notes && (
            <Card className="p-6 sm:p-8 bg-[#01142B]/90 border border-white/10 rounded-[4px] flex flex-col gap-3 shadow-xl">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <IconFileText size={18} stroke={1.5} className="text-[#CC6600]" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Statistical Team Scope Notes &amp; Assumptions
                </h3>
              </div>
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/10 text-xs text-white/80 font-sans leading-relaxed whitespace-pre-line">
                {quotation.notes}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B]/90 border border-white/10 rounded-[4px] flex flex-col gap-5 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                Payment Milestones
              </span>
              <h3 className="text-base font-bold text-white font-sans mt-0.5">
                Escrow Settlement Schedule
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-emerald-500/25 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
                    <IconLock size={14} stroke={2} />
                    <span>1. Escrow Deposit</span>
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-400">
                    <Peso />{quotation.downpaymentRequired.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-sans leading-relaxed">
                  {quotation.isUpfrontEnforced
                    ? "100% Upfront deposit required to activate analysis queue."
                    : `Initial ${quotation.downpaymentPercentage}% deposit due upon SOW signing to commence computation.`}
                </p>
              </div>

              {!quotation.isUpfrontEnforced && quotation.releaseBalance > 0 && (
                <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans uppercase text-white/50 font-semibold tracking-wider">
                      2. Deliverable Release
                    </span>
                    <span className="text-base font-mono font-bold text-[#38BDF8]">
                      <Peso />{quotation.releaseBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Payable only after you inspect and accept the final statistical findings.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-[2px] bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-white/75 font-sans leading-relaxed flex items-start gap-2.5">
              <IconShieldCheck size={18} stroke={1.5} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300 font-semibold">JAXIS Escrow Protection:</strong> Funds remain securely vaulted until you review and approve your defense-ready deliverables.
              </span>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-[#01142B]/90 border border-white/10 rounded-[4px] flex flex-col gap-5 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-sans uppercase font-bold text-white/80 tracking-wider">
                Researcher Decision Deck
              </span>
            </div>

            {quotation.status === "QUOTE_SENT" && !quotation.isExpired ? (
              <div className="space-y-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAcceptModalOpen(true)}
                  disabled={isPending}
                  className="w-full gap-2 justify-center bg-[#CC6600] text-white hover:bg-[#E67300] min-h-[42px] text-xs font-sans font-semibold cursor-pointer flex items-center"
                >
                  <IconCheck size={16} stroke={2} />
                  <span>Accept Proposal &amp; Proceed to SOW</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={isPending}
                  className="w-full text-white/75 hover:text-rose-400 hover:border-rose-500/40 justify-center text-xs font-sans min-h-[38px] cursor-pointer flex items-center gap-2"
                >
                  <IconX size={15} stroke={1.5} />
                  <span>Decline / Request Scope Adjustment</span>
                </Button>
              </div>
            ) : quotation.status === "CLIENT_APPROVED" ? (
              <div className="space-y-4">
                <div className="p-5 rounded-[2px] bg-emerald-950/20 border border-emerald-500/30 text-left space-y-1.5">
                  <div className="text-xs font-sans text-emerald-400 font-bold flex items-center gap-2">
                    <IconCheck size={16} stroke={2} />
                    <span>Proposal Accepted</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Commercial terms approved. Your formal Statement of Work (SOW) agreement is ready for digital signature.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Link href={`/dashboard/client/projects/${projectId}/sow`} className="block w-full">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full min-h-[42px] font-sans text-xs font-semibold flex items-center justify-center gap-2 bg-[#CC6600] hover:bg-[#E67300] text-white"
                    >
                      <IconFileCertificate size={16} stroke={2} />
                      <span>Sign Statement of Work Now →</span>
                    </Button>
                  </Link>

                  <Link href={`/dashboard/client/projects/${projectId}`} className="block w-full">
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full min-h-[38px] font-sans text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <IconArrowLeft size={15} stroke={1.5} />
                      <span>Return to Study Details</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : quotation.status === "QUOTE_DECLINED" ? (
              <div className="space-y-4">
                <div className="p-5 rounded-[2px] bg-amber-950/20 border border-amber-500/30 text-left space-y-1.5">
                  <div className="text-xs font-sans text-amber-300 font-bold flex items-center gap-2">
                    <IconClock size={16} stroke={2} />
                    <span>Proposal Declined</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Our Senior Statistical Team is reviewing your requested adjustments and will prepare an updated scope.
                  </p>
                </div>

                <Link href={`/dashboard/client/projects/${projectId}`} className="block w-full">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full min-h-[38px] font-sans text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft size={15} stroke={1.5} />
                    <span>Return to Study Details</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-[2px] bg-rose-950/20 border border-rose-500/30 text-left space-y-1.5">
                  <div className="text-xs font-sans text-rose-400 font-bold flex items-center gap-2">
                    <IconAlertTriangle size={16} stroke={2} />
                    <span>Proposal Expired</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    This commercial quote has expired. Return to your study tracker to request an updated quotation.
                  </p>
                </div>

                <Link href={`/dashboard/client/projects/${projectId}`} className="block w-full">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full min-h-[38px] font-sans text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft size={15} stroke={1.5} />
                    <span>Return to Study Details</span>
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Accept Proposal Confirmation Modal ── */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title="Accept Commercial Proposal"
        size="md"
      >
        <div className="space-y-5 text-sm font-sans text-white/80 p-2">
          <p className="leading-relaxed">
            By accepting this commercial proposal for study{" "}
            <strong className="text-white font-mono">{project.intakeId}</strong>, you approve the selected{" "}
            <strong className="text-emerald-400">{pkgDef?.name || quotation.packageName}</strong> scope and total contract sum of{" "}
            <strong className="text-[#38BDF8] font-mono"><Peso />{quotation.totalAmount.toLocaleString()}</strong>.
          </p>

          <div className="p-5 rounded-[4px] bg-[#011735]/60 border border-white/10 space-y-3 font-sans text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Initial Downpayment:</span>
              <span className="text-emerald-400 font-mono font-bold"><Peso />{quotation.downpaymentRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Delivery Balance:</span>
              <span className="text-[#38BDF8] font-mono font-bold"><Peso />{quotation.releaseBalance.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-white/50 italic leading-relaxed">
            Upon confirmation, your project will advance to Statement of Work (SOW) agreement generation.
          </p>

          <ModalFooter>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsAcceptModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAcceptProposal}
              disabled={isPending}
              className="gap-2 bg-[#CC6600] text-white hover:bg-[#FFA040] font-sans font-semibold"
            >
              <IconCheck size={16} stroke={2.5} />
              <span>{isPending ? "Approving..." : "Confirm & Accept Proposal"}</span>
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* ── Decline Proposal Modal ── */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Commercial Proposal"
        size="md"
      >
        <div className="space-y-5 text-sm font-sans text-white/80 p-2">
          <p className="leading-relaxed">
            Please let our statistical team know why this proposal does not meet your requirements so we can adjust the scope or pricing.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-sans uppercase text-white/70 font-bold">
              Reason / Requested Adjustments (Optional)
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., I only need Chapter 4 descriptive tables, or my deadline is 1 week later..."
              rows={4}
              className="w-full bg-[#010114] border border-white/15 rounded-[4px] p-4 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          <ModalFooter>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsDeclineModalOpen(false)}
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeclineProposal}
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Decline"}
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* ── Global Toast ── */}
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

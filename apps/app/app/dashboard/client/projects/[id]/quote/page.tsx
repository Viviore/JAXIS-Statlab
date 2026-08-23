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

function Peso() {
  return <span className="font-sans font-normal opacity-85 select-none inline-block">₱</span>;
}

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

      if (projRes.success) {
        setProject(projRes.data);
      } else {
        setError(projRes.error.message);
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
      description: `Study ID "${project.intakeId}" has been copied to your clipboard.`,
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
            description: "Commercial terms approved. SOW agreement is being prepared.",
            variant: "success",
          });
          setIsAcceptModalOpen(false);
          await loadData();
          setTimeout(() => {
            router.push(`/dashboard/client/projects/${projectId}`);
          }, 1000);
        } else {
          setToastMessage({
            message: "Acceptance Failed",
            description: res.error?.message || "Failed to process approval.",
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
        return <IconSchool size={18} stroke={1.5} className="text-sky-400" />;
      case "RUSH":
        return <IconBolt size={18} stroke={1.5} className="text-amber-400" />;
      case "EXPRESS":
        return <IconFlame size={18} stroke={1.5} className="text-orange-400" />;
      case "EMERGENCY":
        return <IconAlertTriangle size={18} stroke={1.5} className="text-rose-400" />;
      default:
        return <IconSparkles size={18} stroke={1.5} className="text-amber-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <div className="h-6 w-36 bg-white/[0.04] animate-pulse rounded-[2px]" />
        <Card className="p-8 animate-pulse flex flex-col gap-4 bg-[#01142B]/90 border-white/[0.08]">
          <div className="h-4 bg-white/10 w-1/4 rounded-[2px]" />
          <div className="h-8 bg-white/10 w-2/3 rounded-[2px]" />
          <div className="h-24 bg-white/10 w-full rounded-[2px]" />
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Link href="/dashboard/client/projects" className="hover:text-white transition-colors">
            ← Return to Projects Registry
          </Link>
        </div>
        <Card className="p-8 text-center flex flex-col items-center gap-4 bg-[#01142B]/90 border-white/[0.08]">
          <IconAlertTriangle size={32} stroke={1.5} className="text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white font-sans">Unable to Load Quotation</h2>
          <p className="text-xs text-white/60 font-mono">{error || "Study not found."}</p>
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
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
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
              <Button variant="secondary" size="sm">
                ← BACK TO STUDY DETAILS
              </Button>
            </Link>
          }
        />

        <Card className="p-8 sm:p-10 bg-[#01142B] border-white/[0.08] text-center space-y-4 max-w-2xl mx-auto">
          <IconClock size={36} stroke={1.5} className="text-[#CC6600] mx-auto" />
          <h2 className="text-base font-bold text-white font-sans">
            Proposal Under Statistical Modeling
          </h2>
          <p className="text-xs text-white/70 font-sans leading-relaxed">
            Our Senior Statistical Team is currently reviewing your study methodology and data files to prepare a customized commercial proposal. You will receive an email notification as soon as your quote is issued.
          </p>
          <Link href={`/dashboard/client/projects/${projectId}`}>
            <Button variant="secondary" size="sm" className="mt-2">
              View Study Tracker
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pkgDef = PACKAGES_CATALOG[quotation.packageName];
  const activeAddOns = quotation.lineItems.filter((li) => li.itemType === "ADDON");

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      {/* ── 1. Page Header ── */}
      <PageHeader
        title={project.researchTitle}
        description={`Study ID: ${project.intakeId} · Submitted ${new Date(
          project.createdAt
        ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Projects", href: "/dashboard/client/projects" },
          { label: project.intakeId, href: `/dashboard/client/projects/${projectId}` },
          { label: "Commercial Proposal" },
        ]}
        actions={
          <Link href={`/dashboard/client/projects/${projectId}`}>
            <Button variant="secondary" size="sm">
              ← BACK TO STUDY DETAILS
            </Button>
          </Link>
        }
      />

      {/* ── 2. Governance Status Action Bar ── */}
      <Card className="p-4 sm:p-5 border-l-4 border-l-[#CC6600]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-white/50 uppercase font-bold tracking-wider">
              Proposal Status:
            </span>
            {quotation.status === "CLIENT_APPROVED" ? (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
                <IconCheck size={13} stroke={2} />
                PROPOSAL ACCEPTED
              </span>
            ) : quotation.status === "QUOTE_DECLINED" ? (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
                <IconX size={13} stroke={2} />
                PROPOSAL DECLINED
              </span>
            ) : quotation.isExpired ? (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
                <IconAlertTriangle size={13} stroke={1.5} />
                PROPOSAL EXPIRED
              </span>
            ) : (
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-[2px] uppercase font-bold flex items-center gap-1.5 animate-pulse">
                <IconClock size={13} stroke={1.5} />
                READY FOR REVIEW
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy Study ID"
              className="text-xs font-mono font-bold text-[#FF9433] bg-[#CC6600]/15 hover:bg-[#CC6600]/25 border border-[#CC6600]/30 hover:border-[#CC6600] px-2 py-0.5 rounded-[2px] whitespace-nowrap cursor-pointer transition-all inline-flex items-center gap-1 group/btn ml-1"
            >
              <span>{project.intakeId}</span>
              <IconCopy size={11} stroke={1.5} className="opacity-40 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          </div>

          {quotation.status === "QUOTE_SENT" && !quotation.isExpired && (
            <div className="text-xs font-mono text-white/60 flex items-center gap-1.5">
              <span>Valid Until:</span>
              <span className="text-amber-300 font-bold">
                {new Date(quotation.expiresAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* ── 3. Main Grid: Balanced 2-Column Desktop / Linear Mobile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column (7 cols): Analytical Scope & Line Items ── */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Card 1: Selected Analytical Package Scope */}
          <Card className="p-6 sm:p-8 bg-[#01142B] border-white/[0.08] flex flex-col gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
              <div className="flex items-center gap-3">
                <IconClipboardList size={22} stroke={1.5} className="text-[#CC6600] flex-shrink-0" />
                <div>
                  <span className="text-[0.6875rem] font-mono uppercase text-[#FFA040] font-bold tracking-wider block">
                    Commercial Package Tier ({pkgDef.id})
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
                    {pkgDef.name}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-[2px] font-bold uppercase self-start sm:self-auto">
                {pkgDef.badge}
              </span>
            </div>

            <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed">
              {pkgDef.tagline}
            </p>

            {/* Scope Deliverables Box */}
            {pkgDef.deliverables && pkgDef.deliverables.length > 0 && (
              <div className="p-5 sm:p-6 rounded-[2px] bg-[#010D1F] border border-white/[0.08] space-y-3.5">
                <div className="text-xs font-mono uppercase text-white/50 font-bold tracking-wider">
                  Guaranteed Deliverables Included in this Scope:
                </div>
                <ul className="space-y-3">
                  {pkgDef.deliverables.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-white/95 font-sans flex items-start gap-3">
                      <IconCheck size={18} stroke={2} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Card 2: Itemized Commercial Schedule & Totals */}
          <Card className="p-6 sm:p-8 bg-[#01142B] border-white/[0.08] flex flex-col gap-6 shadow-xl">
            <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white font-sans flex items-center gap-2.5">
                <IconReceipt size={20} stroke={1.5} className="text-[#CC6600]" />
                <span>Itemized Commercial Schedule</span>
              </h3>
              <span className="text-xs font-mono text-white/60 uppercase px-2.5 py-1 rounded-[2px] bg-white/[0.04] border border-white/[0.08]">
                {quotation.isUpfrontEnforced ? "100% Upfront" : "50% Milestone"}
              </span>
            </div>

            {/* Individual Clean Item Rows */}
            <div className="space-y-3">
              {/* Base Package Card Row */}
              <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/[0.10] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-white font-sans">{pkgDef.name}</span>
                    <span className="text-[0.625rem] font-mono uppercase px-2 py-0.5 rounded-[2px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      Base Service
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                    Core computational analysis &amp; APA 7th reporting
                  </p>
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-white flex-shrink-0 self-end sm:self-auto">
                  <Peso />{quotation.basePrice.toLocaleString()}
                </div>
              </div>

              {/* Priority Add-Ons Rows */}
              {activeAddOns.map((addon) => {
                const addDef = ADDONS_CATALOG[addon.itemName as AddOnName];
                return (
                  <div
                    key={addon.id}
                    className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/[0.10] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getAddOnIcon(addon.itemName)}
                        <span className="text-sm sm:text-base font-bold text-white font-sans">
                          {addDef?.name || addon.itemName}
                        </span>
                        <span className="text-[0.625rem] font-mono uppercase px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          Priority Add-on
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                        {addon.description || addDef?.tagline || "Optional Priority Service"}
                      </p>
                    </div>
                    <div className="text-base sm:text-lg font-mono font-bold text-amber-300 flex-shrink-0 self-end sm:self-auto">
                      +<Peso />{addon.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {/* Total Contract Sum Banner */}
              <div className="p-5 sm:p-6 rounded-[2px] bg-[#011B38] border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md mt-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-sky-400 tracking-wider block">
                    Total Contract Sum
                  </span>
                  <span className="text-xs text-white/60 font-sans mt-0.5 block">
                    All-inclusive research computation and reporting deliverables
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#38BDF8] flex-shrink-0 self-end sm:self-auto">
                  <Peso />{quotation.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Scope Notes (Only if notes exist) */}
          {quotation.notes && (
            <Card className="p-6 sm:p-7 bg-[#01142B] border-white/[0.08] flex flex-col gap-3 shadow-xl">
              <div className="border-b border-white/[0.08] pb-3 flex items-center gap-2">
                <IconFileText size={18} stroke={1.5} className="text-[#CC6600]" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Statistical Team Scope Notes &amp; Assumptions
                </h3>
              </div>
              <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.06] text-xs sm:text-sm text-white/85 font-sans leading-relaxed whitespace-pre-line">
                {quotation.notes}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right Column (5 cols): Milestones & Decision Deck ── */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Card 1: Milestone Escrow Settlement Schedule */}
          <Card className="p-6 sm:p-7 bg-[#01142B] border-white/[0.08] flex flex-col gap-5 shadow-xl">
            <div className="border-b border-white/[0.08] pb-3">
              <span className="text-[0.6875rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                PAYMENT MILESTONES
              </span>
              <h3 className="text-base font-bold text-white font-sans mt-0.5">
                Escrow Settlement Schedule
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Milestone 1: Initial Deposit */}
              <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-emerald-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
                    <IconLock size={14} stroke={1.5} />
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

              {/* Milestone 2: Deliverable Release */}
              {!quotation.isUpfrontEnforced && quotation.releaseBalance > 0 && (
                <div className="p-4 sm:p-5 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-white/50 font-bold tracking-wider">
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

            {/* Escrow Guarantee Disclaimer */}
            <div className="p-4 rounded-[2px] bg-emerald-500/[0.04] border border-emerald-500/20 text-xs text-white/75 font-sans leading-relaxed flex items-start gap-3">
              <IconShieldCheck size={18} stroke={1.5} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300 font-semibold">JAXIS Escrow Protection:</strong> Funds remain securely vaulted until you review and approve your defense-ready deliverables.
              </span>
            </div>
          </Card>

          {/* Card 2: Decision Actions Deck */}
          <Card className="p-6 sm:p-7 bg-[#01142B] border-white/[0.08] flex flex-col gap-4 shadow-xl">
            <div className="border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono uppercase font-bold text-white/80 tracking-wider">
                Researcher Decision Deck
              </span>
            </div>

            {quotation.status === "QUOTE_SENT" && !quotation.isExpired ? (
              <div className="space-y-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsAcceptModalOpen(true)}
                  disabled={isPending}
                  className="w-full gap-2 justify-center bg-[#CC6600] text-white hover:bg-[#E67300] py-3.5 text-xs font-mono font-bold tracking-wider h-12 shadow-lg shadow-[#CC6600]/25 cursor-pointer"
                >
                  <IconCheck size={16} stroke={2.5} />
                  <span>ACCEPT PROPOSAL &amp; PROCEED TO SOW</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={isPending}
                  className="w-full text-white/75 hover:text-rose-400 hover:border-rose-500/40 justify-center text-xs font-mono tracking-wider h-10 cursor-pointer"
                >
                  <IconX size={14} stroke={1.5} />
                  <span>DECLINE / REQUEST SCOPE ADJUSTMENT</span>
                </Button>
              </div>
            ) : quotation.status === "CLIENT_APPROVED" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-[2px] bg-emerald-500/10 border border-emerald-500/25 text-left space-y-1.5">
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <IconCheck size={15} stroke={2} />
                    <span>Proposal Accepted</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Commercial terms approved. Your formal Statement of Work (SOW) agreement is currently being prepared.
                  </p>
                </div>

                <Link href={`/dashboard/client/projects/${projectId}`} className="block w-full">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full h-11 font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IconArrowLeft size={14} stroke={1.5} />
                    <span>RETURN TO STUDY TRACKER</span>
                  </Button>
                </Link>
              </div>
            ) : quotation.status === "QUOTE_DECLINED" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-[2px] bg-amber-500/10 border border-amber-500/25 text-left space-y-1.5">
                  <div className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                    <IconClock size={15} stroke={1.5} />
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
                    className="w-full h-11 font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IconArrowLeft size={14} stroke={1.5} />
                    <span>RETURN TO STUDY TRACKER</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-[2px] bg-rose-500/10 border border-rose-500/25 text-left space-y-1.5">
                  <div className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                    <IconAlertTriangle size={15} stroke={1.5} />
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
                    className="w-full h-11 font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IconArrowLeft size={14} stroke={1.5} />
                    <span>RETURN TO STUDY TRACKER</span>
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
        <div className="space-y-4 text-xs font-sans text-white/80 p-1">
          <p className="leading-relaxed">
            By accepting this commercial proposal for study{" "}
            <strong className="text-white font-mono">{project.intakeId}</strong>, you approve the selected{" "}
            <strong className="text-emerald-400">{pkgDef.name}</strong> scope and total contract sum of{" "}
            <strong className="text-[#38BDF8] font-mono"><Peso />{quotation.totalAmount.toLocaleString()}</strong>.
          </p>

          <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-white/[0.08] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Initial Downpayment:</span>
              <span className="text-emerald-400 font-bold"><Peso />{quotation.downpaymentRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Delivery Balance:</span>
              <span className="text-[#38BDF8] font-bold"><Peso />{quotation.releaseBalance.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[0.688rem] text-white/50 italic leading-relaxed">
            Upon confirmation, your project will advance to Statement of Work (SOW) agreement generation.
          </p>

          <ModalFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAcceptModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptProposal}
              disabled={isPending}
              className="gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300]"
            >
              <IconCheck size={14} stroke={2.5} />
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
        <div className="space-y-4 text-xs font-sans text-white/80 p-1">
          <p className="leading-relaxed">
            Please let our statistical team know why this proposal does not meet your requirements so we can adjust the scope or pricing.
          </p>

          <div className="space-y-1.5">
            <label className="text-[0.688rem] font-mono uppercase text-white/60 font-bold">
              Reason / Requested Adjustments (Optional)
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., I only need Chapter 4 descriptive tables, or my deadline is 1 week later..."
              rows={4}
              className="w-full bg-[#010114] border border-white/[0.12] rounded-[2px] p-2.5 text-xs font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          <ModalFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeclineModalOpen(false)}
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
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

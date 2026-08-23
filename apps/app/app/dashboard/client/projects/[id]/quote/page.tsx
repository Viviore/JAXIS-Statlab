"use client";

import React, { useState, useEffect, useCallback, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Modal,
  ModalFooter,
  Toast,
} from "@repo/ui";
import {
  IconArrowLeft,
  IconCheck,
  IconReceipt2,
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
  IconChecklist,
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
        return <IconSchool size={16} stroke={1.5} className="text-sky-400" />;
      case "RUSH":
        return <IconBolt size={16} stroke={1.5} className="text-amber-400" />;
      case "EXPRESS":
        return <IconFlame size={16} stroke={1.5} className="text-orange-400" />;
      case "EMERGENCY":
        return <IconAlertTriangle size={16} stroke={1.5} className="text-rose-400" />;
      default:
        return <IconSparkles size={16} stroke={1.5} className="text-amber-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/[0.04] animate-pulse rounded-[2px]" />
        <Card className="p-8 bg-[#01142B] border-white/[0.08] text-center font-mono text-xs text-white/50">
          Loading commercial proposal details...
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/client/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <IconArrowLeft size={14} stroke={1.5} />
            <span>Return to Studies</span>
          </Button>
        </Link>
        <Card className="p-8 bg-[#01142B] border-white/[0.08] text-center space-y-3">
          <IconAlertTriangle size={32} stroke={1.5} className="text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white font-sans">Unable to Load Quotation</h2>
          <p className="text-xs text-white/60 font-mono">{error || "Study not found."}</p>
        </Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="space-y-6">
        <Link href={`/dashboard/client/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <IconArrowLeft size={14} stroke={1.5} />
            <span>Return to Study Details</span>
          </Button>
        </Link>

        <Card className="p-8 bg-[#01142B] border-white/[0.08] text-center space-y-4 max-w-2xl mx-auto">
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <Link
            href={`/dashboard/client/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors mb-2"
          >
            <IconArrowLeft size={13} stroke={1.5} />
            <span>Return to Study Details</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">
            Commercial Proposal &amp; Statistical Scope
          </h1>
          <p className="text-xs text-white/60 font-mono mt-1 flex items-center gap-2 flex-wrap">
            <span>Study ID:</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{project.intakeId}</span>
              <IconCopy size={11} stroke={1.5} />
            </button>
            <span>·</span>
            <span>Title: &ldquo;{project.researchTitle}&rdquo;</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {quotation.status === "CLIENT_APPROVED" ? (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
              <IconCheck size={14} stroke={2} />
              PROPOSAL ACCEPTED
            </span>
          ) : quotation.status === "QUOTE_DECLINED" ? (
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
              <IconX size={14} stroke={2} />
              PROPOSAL DECLINED
            </span>
          ) : quotation.isExpired ? (
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-[2px] uppercase font-bold flex items-center gap-1.5">
              <IconAlertTriangle size={14} stroke={1.5} />
              PROPOSAL EXPIRED
            </span>
          ) : (
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-[2px] uppercase font-bold flex items-center gap-1.5 animate-pulse">
              <IconClock size={14} stroke={1.5} />
              AWAITING YOUR APPROVAL
            </span>
          )}
        </div>
      </div>

      {/* Validity Banner */}
      {quotation.status === "QUOTE_SENT" && !quotation.isExpired && (
        <div className="p-4 rounded-[2px] bg-[#011B38] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[2px] bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0">
              <IconClock size={18} stroke={1.75} />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-sans">
                Commercial Quote Valid Until:{" "}
                <span className="text-amber-300 font-mono font-bold">
                  {new Date(quotation.expiresAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="text-[0.688rem] text-white/60 font-mono mt-0.5">
                Review terms below and click &ldquo;Accept Proposal&rdquo; to lock your dedicated statistician.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAcceptModalOpen(true)}
              className="gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300]"
            >
              <IconCheck size={14} stroke={2.5} />
              <span>Accept &amp; Proceed to SOW →</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Proposal Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left (2 cols): Package Scope & Line Items Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Selected Package Card */}
          <Card className="p-6 md:p-8 bg-[#01142B] border-white/[0.08] flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
              <div>
                <span className="text-[0.625rem] font-mono uppercase text-[#FFA040] font-bold tracking-wider">
                  COMMERCIAL PACKAGE TIER ({pkgDef.id})
                </span>
                <h2 className="text-lg font-bold text-white font-sans mt-0.5">
                  {pkgDef.name}
                </h2>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-[2px] font-bold uppercase self-start sm:self-auto">
                {pkgDef.badge}
              </span>
            </div>

            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {pkgDef.tagline}
            </p>

            {/* Scope Deliverables */}
            <div className="p-4 rounded-[2px] bg-[#010D1F] border border-white/[0.06] space-y-3">
              <div className="text-[0.625rem] font-mono uppercase text-white/50 font-bold tracking-wider flex items-center gap-1.5">
                <IconChecklist size={14} stroke={1.5} className="text-[#CC6600]" />
                <span>Guaranteed Deliverables Included in this Scope</span>
              </div>
              <ul className="space-y-2">
                {pkgDef.deliverables.map((item, idx) => (
                  <li key={idx} className="text-xs text-white/90 font-sans flex items-start gap-2.5">
                    <IconCheck size={15} stroke={2} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Itemized Cost Breakdown Table */}
          <Card className="p-6 md:p-8 bg-[#01142B] border-white/[0.08] flex flex-col gap-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <IconReceipt2 size={16} stroke={1.5} className="text-[#CC6600]" />
                <span>Itemized Commercial Schedule</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[0.625rem] font-mono uppercase text-white/50 tracking-wider">
                    <th className="pb-2">Line Item / Service Description</th>
                    <th className="pb-2 text-right">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {/* Base Package Line Item */}
                  <tr>
                    <td className="py-3">
                      <div className="font-bold text-white font-sans">{pkgDef.name}</div>
                      <div className="text-[0.688rem] text-white/50 font-mono mt-0.5">
                        Core computational analysis &amp; APA 7th reporting
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-[0.688rem] text-white/60 uppercase">
                      PACKAGE
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      ₱{quotation.basePrice.toLocaleString()}
                    </td>
                  </tr>

                  {/* Add-ons Line Items */}
                  {quotation.lineItems
                    .filter((li) => li.itemType === "ADDON")
                    .map((addon) => {
                      const addDef = ADDONS_CATALOG[addon.itemName as AddOnName];
                      return (
                        <tr key={addon.id}>
                          <td className="py-3">
                            <div className="font-bold text-amber-300 font-sans flex items-center gap-1.5">
                              {getAddOnIcon(addon.itemName)}
                              <span>{addDef?.name || addon.itemName}</span>
                            </div>
                            <div className="text-[0.688rem] text-white/50 font-mono mt-0.5">
                              {addon.description || addDef?.tagline || "Optional Priority Service"}
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-[0.688rem] text-amber-400 uppercase">
                            ADD-ON
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-amber-300">
                            +₱{addon.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/[0.12] bg-[#010D1F]">
                    <td colSpan={2} className="py-3.5 px-3 font-mono text-xs font-bold uppercase text-white tracking-wider">
                      Total Contract Sum
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-base font-bold text-[#38BDF8]">
                      ₱{quotation.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Notes & Boundary Stipulations from Team */}
          {quotation.notes && (
            <Card className="p-5 bg-[#01142B] border-white/[0.08] space-y-2">
              <div className="text-[0.625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                Statistical Team Scope Notes &amp; Assumptions
              </div>
              <p className="text-xs text-white/85 font-sans leading-relaxed bg-[#010D1F] p-3.5 rounded-[2px] border border-white/[0.06] whitespace-pre-line">
                {quotation.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right (1 col): Milestone Escrow Schedule & Action Deck */}
        <div className="flex flex-col gap-6">
          {/* Milestone Escrow Schedule Card */}
          <Card className="p-6 bg-[#01142B] border-white/[0.08] flex flex-col gap-5">
            <div className="border-b border-white/[0.08] pb-3">
              <span className="text-[0.625rem] font-mono uppercase text-white/40 font-bold tracking-wider">
                PAYMENT MILESTONES
              </span>
              <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                Escrow Settlement Schedule
              </h3>
            </div>

            <div className="space-y-3">
              {/* Milestone 1: Downpayment */}
              <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-emerald-500/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.625rem] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                    <IconLock size={12} stroke={1.5} />
                    <span>Milestone 1 · Escrow Deposit</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ₱{quotation.downpaymentRequired.toLocaleString()}
                  </span>
                </div>
                <div className="text-[0.688rem] text-white/60 font-sans">
                  {quotation.isUpfrontEnforced
                    ? "100% Upfront deposit required to activate analysis queue."
                    : `Initial ${quotation.downpaymentPercentage}% deposit due upon SOW signing to commence computation.`}
                </div>
              </div>

              {/* Milestone 2: Final Balance */}
              {!quotation.isUpfrontEnforced && quotation.releaseBalance > 0 && (
                <div className="p-3.5 rounded-[2px] bg-[#010D1F] border border-white/[0.08] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.625rem] font-mono uppercase text-white/50 font-bold tracking-wider">
                      Milestone 2 · Deliverable Release
                    </span>
                    <span className="text-xs font-mono font-bold text-[#38BDF8]">
                      ₱{quotation.releaseBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[0.688rem] text-white/60 font-sans">
                    Payable only after QA Lead verification and final findings release.
                  </div>
                </div>
              )}
            </div>

            {/* Escrow Guarantee Disclaimer */}
            <div className="p-3 rounded-[2px] bg-emerald-500/[0.04] border border-emerald-500/20 text-[0.688rem] text-white/70 font-sans leading-relaxed flex items-start gap-2">
              <IconShieldCheck size={16} stroke={1.5} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>JAXIS Escrow Protection:</strong> Funds remain securely vaulted in escrow until you inspect and accept your defense-ready statistical findings.
              </span>
            </div>
          </Card>

          {/* Decision Action Deck */}
          <Card className="p-6 bg-[#01142B] border-white/[0.08] flex flex-col gap-4">
            <div className="border-b border-white/[0.08] pb-2.5">
              <span className="text-xs font-mono uppercase font-bold text-white/80 tracking-wider">
                Researcher Decision Deck
              </span>
            </div>

            {quotation.status === "QUOTE_SENT" && !quotation.isExpired ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAcceptModalOpen(true)}
                  disabled={isPending}
                  className="w-full gap-2 justify-center bg-[#CC6600] text-white hover:bg-[#E67300] py-2.5"
                >
                  <IconCheck size={16} stroke={2.5} />
                  <span>Accept Proposal &amp; Proceed to SOW</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={isPending}
                  className="w-full text-white/60 hover:text-rose-400 justify-center"
                >
                  Decline / Request Custom Scope
                </Button>
              </div>
            ) : quotation.status === "CLIENT_APPROVED" ? (
              <div className="space-y-3 text-center">
                <div className="p-3 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 font-bold">
                  ✓ Proposal accepted. SOW contract is pending signature.
                </div>
                <Link href={`/dashboard/client/projects/${projectId}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Return to Study Tracker
                  </Button>
                </Link>
              </div>
            ) : quotation.status === "QUOTE_DECLINED" ? (
              <div className="space-y-3 text-center">
                <div className="p-3 rounded-[2px] bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
                  Proposal declined. Our statistical team is reviewing your feedback.
                </div>
                <Link href={`/dashboard/client/projects/${projectId}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Return to Study Tracker
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="p-3 rounded-[2px] bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400">
                  This proposal has expired. Please request an updated quotation.
                </div>
                <Link href={`/dashboard/client/projects/${projectId}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Return to Study Tracker
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Accept Proposal Confirmation Modal */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title="Accept Commercial Proposal"
        size="md"
      >
        <div className="space-y-4 text-xs font-sans text-white/80">
          <p className="leading-relaxed">
            By accepting this commercial proposal for study{" "}
            <strong className="text-white font-mono">{project.intakeId}</strong>, you approve the selected{" "}
            <strong className="text-emerald-400">{pkgDef.name}</strong> scope and total contract sum of{" "}
            <strong className="text-[#38BDF8] font-mono">₱{quotation.totalAmount.toLocaleString()}</strong>.
          </p>

          <div className="p-3 rounded-[2px] bg-[#010D1F] border border-white/[0.08] space-y-1.5 font-mono text-[0.688rem]">
            <div className="flex justify-between">
              <span className="text-white/50">Initial Downpayment:</span>
              <span className="text-emerald-400 font-bold">₱{quotation.downpaymentRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Delivery Balance:</span>
              <span className="text-[#38BDF8] font-bold">₱{quotation.releaseBalance.toLocaleString()}</span>
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

      {/* Decline Proposal Modal */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Commercial Proposal"
        size="md"
      >
        <div className="space-y-4 text-xs font-sans text-white/80">
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

      {/* Global Toast */}
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

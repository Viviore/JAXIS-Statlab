"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Button,
  Card,
  Alert,
  Toast,
  LoadingState,
  FormTextarea,
  EmptyState,
} from "@repo/ui";
import {
  IconArrowLeft,
  IconFileText,
  IconSparkles,
  IconShieldCheck,
  IconLock,
  IconCreditCard,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { getSOWByProject, generateSOW } from "@/features/sow/actions";
import { getProjectById } from "@/features/projects/actions";
import { getQuotationByProject } from "@/features/quotations/actions";
import { SowDocument } from "@/features/sow/components/SowDocument";
import type { SOWDetailItem } from "@/features/sow/schemas";
import type { ProjectDetailItem } from "@/features/projects/schemas";
import type { QuotationDetailItem } from "@/features/quotations/schemas";

export default function AdminSowPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [quotation, setQuotation] = useState<QuotationDetailItem | null>(null);
  const [sow, setSow] = useState<SOWDetailItem | null>(null);
  const [customTerms, setCustomTerms] = useState("");
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [projRes, sowRes, quoteRes] = await Promise.all([
          getProjectById(projectId),
          getSOWByProject(projectId),
          getQuotationByProject(projectId),
        ]);

        if (!projRes.success) {
          setError(projRes.error.message);
          setIsLoading(false);
          return;
        }

        setProject(projRes.data);

        if (sowRes.success && sowRes.data) {
          setSow(sowRes.data);
        }

        if (quoteRes) {
          setQuotation(quoteRes);
        }
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const handleManualCompile = () => {
    if (!project) return;

    setGenError(null);
    startTransition(async () => {
      const res = await generateSOW({
        projectId: project.id,
        customTerms: customTerms.trim() || undefined,
      });

      if (res.success && res.data) {
        setSow(res.data);
        setToastMessage({
          message: "Statement of Work Compiled",
          description: "Official SOW generated and dispatched to client for digital signature.",
          variant: "success",
        });
        router.refresh();
      } else {
        setGenError(!res.success ? res.error.message : "Failed to compile Statement of Work.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[50vh] w-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Loading contract console..."
          description="Retrieving study specification and quotation basis"
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
        <PageHeader
          title="Contract Console Error"
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Admin Command", href: "/dashboard/admin" },
            { label: "Projects", href: "/dashboard/admin/projects" },
            { label: "SOW Console" },
          ]}
        />
        <Alert variant="danger">{error || "Failed to load project."}</Alert>
        <Link href="/dashboard/admin/projects">
          <Button variant="secondary" size="md">
            ← Return to Projects Desk
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade print:p-0 print:m-0 print:max-w-none print:pb-0 print:animate-none">
      {/* ── Page Header (hidden in print) ── */}
      <div className="print:hidden">
        <PageHeader
          title="Statement of Work & Scope Audit"
          description={`Contract management and scope snapshot control for ${project.intakeId}`}
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Admin Command", href: "/dashboard/admin" },
            { label: "Projects", href: `/dashboard/admin/projects/${project.id}` },
            { label: project.intakeId, href: `/dashboard/admin/projects/${project.id}` },
            { label: "SOW Desk" },
          ]}
          actions={
            <Link href={`/dashboard/admin/projects/${project.id}`}>
              <Button variant="secondary" size="sm" className="flex items-center gap-2 font-sans font-semibold text-xs">
                <IconArrowLeft size={15} stroke={1.5} />
                <span>Return to Project Inspection</span>
              </Button>
            </Link>
          }
        />
      </div>

      {toastMessage && (
        <div className="print:hidden">
          <Toast
            message={toastMessage.message}
            description={toastMessage.description}
            variant={toastMessage.variant}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* ── Case 1: SOW Not Yet Generated (Waiting for Client Quote Acceptance) ── */}
      {!sow ? (
        <div className="flex flex-col gap-6">
          <Card className="p-8 sm:p-10 bg-[#01142B]/95 border border-white/15 rounded-[6px] flex flex-col gap-6 shadow-2xl">
            <div className="flex items-start gap-4 border-b border-white/10 pb-6">
              <div className="h-12 w-12 rounded-[4px] bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
                <IconSparkles size={24} stroke={1.5} className="text-sky-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-sans">
                  Statement of Work Auto-Generation
                </h3>
                <p className="text-sm text-white/70 font-sans leading-relaxed">
                  The formal Statement of Work is automatically compiled and dispatched to the client as soon as they accept the commercial quotation. No manual administrative action is needed.
                </p>
              </div>
            </div>

            {genError && <Alert variant="danger">{genError}</Alert>}

            {quotation ? (
              <div className="flex flex-col gap-6">
                {/* Target Commercial Basis */}
                <div className="p-6 rounded-[4px] bg-[#011735]/60 border border-white/10 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-sans uppercase font-bold text-white/60 tracking-wider">
                      Commercial Quotation Basis
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-[2px] bg-white/10 text-white/80 font-semibold uppercase">
                      Status: {quotation.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs font-sans text-white/40 block">Agreed Package</span>
                      <strong className="text-sm sm:text-base font-bold text-sky-400 font-sans block">
                        {quotation.packageName}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-sans text-white/40 block">Total Contract Sum</span>
                      <strong className="text-sm sm:text-base font-bold text-amber-400 font-mono block">
                        ₱{Number(quotation.totalAmount).toLocaleString()}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-sans text-white/40 block">Initial Downpayment</span>
                      <strong className="text-sm sm:text-base font-bold text-emerald-400 font-mono block">
                        ₱{Number(quotation.downpaymentRequired).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Collapsible Administrative Manual Override */}
                <div className="border border-white/10 rounded-[4px] bg-[#01142B]/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsOverrideOpen(!isOverrideOpen)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <IconFileText size={16} stroke={1.5} className="text-white/60" />
                      <span className="text-xs font-sans font-semibold text-white/80 uppercase tracking-wider">
                        Manual SOW Compile (Administrative Override)
                      </span>
                    </div>
                    {isOverrideOpen ? (
                      <IconChevronUp size={16} className="text-white/60" />
                    ) : (
                      <IconChevronDown size={16} className="text-white/60" />
                    )}
                  </button>

                  {isOverrideOpen && (
                    <div className="p-6 pt-2 border-t border-white/10 flex flex-col gap-4">
                      <p className="text-xs text-white/60 font-sans leading-relaxed">
                        Use this only if you need to manually force SOW generation before client acceptance or inject special contractual clauses.
                      </p>
                      <FormTextarea
                        label="Special Terms & Non-Standard Scope Boundaries (Optional)"
                        placeholder="e.g., Client to supply raw SPSS (.sav) matrix by Friday. Analysis excludes structural equation modeling."
                        value={customTerms}
                        onChange={(e) => setCustomTerms(e.target.value)}
                        rows={3}
                        className="font-sans text-sm"
                      />
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={isPending}
                          onClick={handleManualCompile}
                          className="font-sans font-semibold text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          <IconSparkles size={15} stroke={1.5} className="mr-1.5" />
                          <span>Force Compile SOW (Override)</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={IconFileText}
                title="No Quotation Created"
                description="No commercial quotation has been created for this study yet. Please create and send a proposal first."
              />
            )}
          </Card>
        </div>
      ) : (
        /* ── Case 2: SOW Exists — Full Document & Live Audit Status ── */
        <>
          <SowDocument sow={sow} />

          {/* Admin Status & Action Card */}
          <Card className="p-8 bg-[#01142B]/90 border border-white/15 rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:hidden shadow-xl">
            <div className="flex items-center gap-4">
              {sow.isLocked ? (
                <div className="h-12 w-12 rounded-[4px] bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <IconShieldCheck size={24} stroke={2} className="text-emerald-400" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-[4px] bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <IconLock size={24} stroke={1.5} className="text-amber-400" />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-base font-bold text-white font-sans">
                  {sow.isLocked ? "Contract Signed & Scope Locked" : "Dispatched — Awaiting Client Digital Signature"}
                </p>
                <p className="text-sm font-sans text-white/60">
                  {sow.isLocked
                    ? `Executed by ${sow.signedByName} on ${new Date(sow.signedAt || "").toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}.`
                    : "The contract is available in the client portal awaiting their digital signature."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/dashboard/admin/projects/${project.id}`}>
                <Button variant="secondary" size="md" className="font-sans font-semibold text-xs">
                  ← Back to Project Desk
                </Button>
              </Link>
              {sow.isLocked && (
                <Link href={`/dashboard/admin/projects/${project.id}/payment`}>
                  <Button variant="primary" size="md" className="font-sans font-semibold text-xs bg-[#CC6600] hover:bg-[#FFA040] text-white">
                    <IconCreditCard size={16} stroke={1.5} className="mr-1.5" />
                    <span>View Payment Status →</span>
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

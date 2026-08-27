"use client";

import React from "react";
import { Button, Badge, MoneyDisplay } from "@repo/ui";
import {
  IconPrinter,
  IconShieldCheck,
  IconClock,
  IconScale,
  IconCheck,
  IconFileCertificate,
} from "@tabler/icons-react";
import type { SOWDetailItem } from "../schemas";

export interface SowDocumentProps {
  sow: SOWDetailItem;
  className?: string;
  showPrintAction?: boolean;
}

export function SowDocument({
  sow,
  className = "",
  showPrintAction = true,
}: SowDocumentProps) {
  const { contentSnapshot } = sow;
  const { client, project, commercial, delivery, terms } = contentSnapshot;

  const handlePrint = () => {
    window.print();
  };

  const contractRef = `JAXIS-SOW-${sow.id.slice(-8).toUpperCase()}`;

  return (
    <div className={`flex flex-col gap-6 w-full max-w-5xl mx-auto ${className}`}>
      {/* ── Document Control Toolbar (hidden in print) ── */}
      {showPrintAction && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-white/50 tracking-wider">
                Document Ref:
              </span>
              <code className="text-xs font-mono font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-[3px] border border-sky-500/30">
                {contractRef}
              </code>
            </div>

            {sow.isLocked ? (
              <Badge variant="emerald" className="font-mono text-xs px-2.5 py-1">
                <IconCheck size={13} stroke={2.5} className="mr-1.5" />
                SIGNED & LEGALLY LOCKED
              </Badge>
            ) : (
              <Badge variant="amber" className="font-mono text-xs px-2.5 py-1">
                <IconClock size={13} stroke={2} className="mr-1.5" />
                AWAITING SIGNATURE
              </Badge>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrint}
            className="text-xs font-sans font-semibold tracking-wider flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.10] px-4 py-2"
          >
            <IconPrinter size={16} stroke={1.5} />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      )}

      {/* ── Official Document Paper Sheet ── */}
      <div className="sow-print-container bg-[#011126] border border-white/[0.12] rounded-[6px] p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
        
        {/* Subtle Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
          <span className="font-sans text-9xl font-black tracking-widest uppercase">
            JAXIS
          </span>
        </div>

        {/* ── Document Header ── */}
        <div className="border-b border-white/15 print:border-black/20 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFA040] font-bold tracking-widest uppercase">
                <IconFileCertificate size={16} stroke={2} />
                <span>Statistical Consulting Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white print:text-black">
                Statement of Work
              </h1>
              <p className="text-sm font-sans text-white/60 print:text-black/60 pt-1">
                Contract Reference: <span className="font-mono font-semibold text-white print:text-black">{contractRef}</span> · Intake ID: <span className="font-mono font-semibold text-white print:text-black">{project.intakeId}</span>
              </p>
            </div>

            <div className="text-left sm:text-right font-sans text-xs text-white/70 print:text-black/70 space-y-1.5 bg-white/[0.03] print:bg-transparent p-4 rounded-[4px] border border-white/10 print:border-none">
              <div><span className="text-white/40 print:text-black/50">Execution Date:</span> <strong className="text-white print:text-black font-mono">{new Date(sow.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div>
              <div><span className="text-white/40 print:text-black/50">Contract Type:</span> <strong className="text-white print:text-black">{sow.sowType === "PRIMARY" ? "Primary Research SOW" : "Supplemental SOW"}</strong></div>
              <div><span className="text-white/40 print:text-black/50">Turnaround SLA:</span> <strong className="text-white print:text-black font-mono">{delivery.turnaroundDays} Business Days</strong></div>
            </div>
          </div>
        </div>

        {/* ── Section 1: The Parties ── */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm font-sans font-bold tracking-wider text-[#FFA040] uppercase mb-4 pb-2 border-b border-white/10 print:border-black/20">
            <IconScale size={16} stroke={2} />
            <span>1. Parties to the Agreement</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#011735]/60 print:bg-slate-50 border border-white/10 print:border-slate-200 p-6 rounded-[4px] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] block font-semibold">
                Client / Lead Researcher
              </span>
              <p className="text-lg font-bold text-white print:text-black">{client.fullName}</p>
              <div className="text-xs text-white/75 print:text-black/75 space-y-1 pt-1 font-sans">
                <p>{client.academicProgram}</p>
                <p>{client.institution}</p>
                <p className="font-mono text-white/50 print:text-black/50 pt-2 border-t border-white/[0.08] print:border-slate-200">
                  {client.email} · {client.contactNumber}
                </p>
              </div>
            </div>

            <div className="bg-[#011735]/60 print:bg-slate-50 border border-white/10 print:border-slate-200 p-6 rounded-[4px] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FFA040] block font-semibold">
                Service Provider
              </span>
              <p className="text-lg font-bold text-white print:text-black">JAXIS STATLAB CONSULTANCY</p>
              <div className="text-xs text-white/75 print:text-black/75 space-y-1 pt-1 font-sans">
                <p>Division of Advanced Statistical Computing</p>
                <p>Academic Research & Psychometrics Division</p>
                <p className="font-mono text-white/50 print:text-black/50 pt-2 border-t border-white/[0.08] print:border-slate-200">
                  ops@jaxis.dev · Manila, Philippines
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Research Study Scope ── */}
        <div className="mb-12">
          <div className="text-sm font-sans font-bold tracking-wider text-[#FFA040] uppercase mb-4 pb-2 border-b border-white/10 print:border-black/20">
            <span>2. Research Study Objectives & Empirical Scope</span>
          </div>

          <div className="bg-[#011735]/60 print:bg-slate-50 border border-white/10 print:border-slate-200 p-6 sm:p-8 rounded-[4px] space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/40 print:text-black/50 block mb-1">
                Research Title
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white print:text-black leading-snug">
                {project.researchTitle}
              </h3>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/40 print:text-black/50 block mb-1.5">
                Statement of Research Objectives
              </span>
              <p className="text-sm text-white/85 print:text-black/85 leading-relaxed font-sans whitespace-pre-line">
                {project.researchObjectives}
              </p>
            </div>

            {project.researchQuestions && (
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/40 print:text-black/50 block mb-1.5">
                  Primary Research Questions
                </span>
                <p className="text-sm text-white/85 print:text-black/85 leading-relaxed font-sans whitespace-pre-line">
                  {project.researchQuestions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3: Commercial Terms & Milestone Schedule ── */}
        <div className="mb-12">
          <div className="text-sm font-sans font-bold tracking-wider text-[#FFA040] uppercase mb-4 pb-2 border-b border-white/10 print:border-black/20">
            <span>3. Commercial Terms & Payment Milestone Schedule</span>
          </div>

          <div className="bg-[#011735]/60 print:bg-slate-50 border border-white/10 print:border-slate-200 p-6 sm:p-8 rounded-[4px] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Package Fee */}
              <div className="bg-[#000E20]/80 print:bg-white border border-white/10 print:border-slate-200 p-5 rounded-[4px] flex flex-col justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 print:text-black/60">
                  Agreed Base Package
                </span>
                <div>
                  <p className="text-base font-bold text-white print:text-black">{commercial.packageLabel}</p>
                  <MoneyDisplay amount={commercial.basePrice} size="lg" className="mt-2" />
                </div>
                <span className="text-[0.6875rem] font-sans text-white/50 print:text-black/60">
                  Includes full analysis and reporting
                </span>
              </div>

              {/* Downpayment Due */}
              <div className="bg-[#000E20]/80 print:bg-white border border-amber-500/30 print:border-amber-400 p-5 rounded-[4px] flex flex-col justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Downpayment Required (To Start)
                </span>
                <div>
                  <MoneyDisplay amount={commercial.downpaymentRequired} size="lg" variant="amber" />
                </div>
                <span className="text-[0.6875rem] font-sans text-amber-300/80">
                  Verified receipt unlocks Expert Assignment
                </span>
              </div>

              {/* Release Balance */}
              <div className="bg-[#000E20]/80 print:bg-white border border-emerald-500/30 print:border-emerald-400 p-5 rounded-[4px] flex flex-col justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Final Deliverable Balance
                </span>
                <div>
                  <MoneyDisplay amount={commercial.balanceDue} size="lg" variant="emerald" />
                </div>
                <span className="text-[0.6875rem] font-sans text-emerald-300/80">
                  Due prior to final release of raw data matrix
                </span>
              </div>
            </div>

            {commercial.addOns && commercial.addOns.length > 0 && (
              <div className="pt-4 border-t border-white/10 print:border-slate-200">
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 print:text-black/60 block mb-2">
                  Included Special Services & Add-Ons:
                </span>
                <div className="flex flex-wrap gap-2">
                  {commercial.addOns.map((ao) => (
                    <span
                      key={ao}
                      className="px-3 py-1 bg-white/[0.06] print:bg-slate-200 border border-white/10 print:border-slate-300 text-xs font-sans font-medium rounded-[3px]"
                    >
                      {ao}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Terms of Service ── */}
        <div className="mb-12">
          <div className="text-sm font-sans font-bold tracking-wider text-[#FFA040] uppercase mb-4 pb-2 border-b border-white/10 print:border-black/20">
            <span>4. Terms of Service & Legal Boundaries</span>
          </div>

          <div className="space-y-4 text-sm text-white/80 print:text-black/80 leading-relaxed font-sans bg-[#011735]/40 print:bg-transparent p-6 rounded-[4px] border border-white/10 print:border-none">
            <div className="space-y-1">
              <strong className="text-white print:text-black font-semibold">4.1 Turnaround & Service Level Agreement: </strong>
              <span>
                Standard turnaround for the execution of this analysis is{" "}
                <strong className="text-white print:text-black font-mono font-bold">{delivery.turnaroundDays} business days</strong>. {delivery.slaStartTrigger}
              </span>
            </div>

            <div className="space-y-1">
              <strong className="text-white print:text-black font-semibold">4.2 Revisions Policy: </strong>
              <span>{terms.revisionPolicy}</span>
            </div>

            <div className="space-y-1">
              <strong className="text-white print:text-black font-semibold">4.3 Communication Firewall: </strong>
              <span>{terms.communicationPolicy}</span>
            </div>

            <div className="space-y-1">
              <strong className="text-white print:text-black font-semibold">4.4 Authorship & Academic Responsibility: </strong>
              <span>{terms.liabilityBoundary}</span>
            </div>

            {terms.customTerms && (
              <div className="mt-4 p-4 rounded-[4px] bg-amber-500/10 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 space-y-1">
                <strong className="text-amber-400 print:text-amber-800 font-semibold block text-xs font-mono uppercase tracking-wider">
                  Special Project Clauses:
                </strong>
                <p className="text-white/90 print:text-black/90 whitespace-pre-line text-sm">{terms.customTerms}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 5: Official Signature Seal ── */}
        <div className="pt-8 border-t border-white/20 print:border-black/30">
          <div className="text-sm font-sans font-bold tracking-wider text-[#FFA040] uppercase mb-6">
            <span>5. Contract Execution & Certified Signature</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Client Signature Block */}
            <div className="bg-[#011735]/80 print:bg-slate-50 border border-white/15 print:border-slate-300 p-6 sm:p-8 rounded-[4px] flex flex-col justify-between min-h-[160px]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 print:text-black/50 block mb-2">
                  Lead Researcher Digital Signature
                </span>
                {sow.isLocked && sow.signedByName ? (
                  <div className="space-y-1 pt-2">
                    <p className="text-2xl font-bold font-serif italic text-emerald-400 print:text-emerald-700 tracking-wider">
                      {sow.signedByName}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 print:text-emerald-700 font-sans pt-1">
                      <IconShieldCheck size={16} stroke={2} />
                      <span>Legally Executed & Digitally Certified</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-400/90 font-mono italic pt-3">
                    [Awaiting Client Digital Signature via Full Legal Name]
                  </p>
                )}
              </div>

              <div className="text-xs font-mono text-white/40 print:text-black/50 pt-4 border-t border-white/10 print:border-slate-200 mt-6 flex justify-between">
                <span>Date: {sow.signedAt ? new Date(sow.signedAt).toLocaleString("en-US") : "Pending"}</span>
                <span>ID: {sow.signedByUserId?.slice(-6) || "Pending"}</span>
              </div>
            </div>

            {/* Provider Certification Block */}
            <div className="bg-[#011735]/80 print:bg-slate-50 border border-white/15 print:border-slate-300 p-6 sm:p-8 rounded-[4px] flex flex-col justify-between min-h-[160px]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 print:text-black/50 block mb-2">
                  Provider Administrative Certification
                </span>
                <div className="pt-2 space-y-1">
                  <p className="text-xl font-bold font-sans uppercase text-white print:text-black tracking-wide">
                    JAXIS STATLAB GOVERNANCE
                  </p>
                  <p className="text-xs text-white/60 print:text-black/60 font-sans">
                    Authorized Commercial Officer
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-white/40 print:text-black/50 pt-4 border-t border-white/10 print:border-slate-200 mt-6 flex justify-between">
                <span>Generated: {new Date(sow.generatedAt).toLocaleDateString("en-US")}</span>
                <span>Status: {sow.isLocked ? "EXECUTION_COMPLETE" : "GENERATED_PENDING_CLIENT"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

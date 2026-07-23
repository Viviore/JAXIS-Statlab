"use client";

import React, { useState } from "react";

const STAGES = [
  {
    id: 1,
    title: "1. Intake & Triage",
    subtitle: "Specification & Research Objectives",
    desc: "Client submits research intake, hypotheses, target deadlines, and raw dataset specifications.",
    role: "Client & Admin",
    badge: "NEW_REQUEST",
    badgeColor: "border-white/30 text-white",
  },
  {
    id: 2,
    title: "2. Quotation Stage",
    subtitle: "Commercial Contract & Inclusions",
    desc: "Admin or CEO evaluates package requirements and issues formal binding quote. Statisticians cannot alter pricing.",
    role: "Admin or CEO",
    badge: "QUOTE_SENT",
    badgeColor: "border-[#CC6600]/50 text-[#CC6600] bg-[#CC6600]/10",
  },
  {
    id: 3,
    title: "3. Payment Verification",
    subtitle: "Fund Verification & Ledger Entry",
    desc: "Client uploads payment proof. Finance or Admin verifies deposit before work authorization.",
    role: "Client & Finance",
    badge: "FULLY_PAID / DOWNPAYMENT",
    badgeColor: "border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10",
  },
  {
    id: 4,
    title: "4. Staff Assignment",
    subtitle: "Statistician & Senior QA Match",
    desc: "Matched qualified statisticians and mandatory Senior QA lead are assigned to the project.",
    role: "Admin",
    badge: "ASSIGNED",
    badgeColor: "border-purple-500/50 text-purple-400 bg-purple-500/10",
  },
  {
    id: 5,
    title: "5. Analysis Workbench",
    subtitle: "Modeling & Draft Processing",
    desc: "Statistician executes statistical modeling, handles dataset processing, and drafts analysis reports.",
    role: "Statistician",
    badge: "IN_ANALYSIS",
    badgeColor: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  },
  {
    id: 6,
    title: "6. QA Review Audit",
    subtitle: "Methodological Verification",
    desc: "Senior QA Lead audits assumptions, evaluates statistical accuracy, logs scorecards, or escalates ethical issues.",
    role: "Senior QA Lead",
    badge: "QA_APPROVED",
    badgeColor: "border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10",
  },
  {
    id: 7,
    title: "7. Release Gate",
    subtitle: "Deliverable Package Release",
    desc: "Strict payment release gate check. Deliverables unlock strictly when payment status reaches FULLY_PAID.",
    role: "System & Client",
    badge: "RELEASED",
    badgeColor: "border-[#10B981]/50 text-[#10B981] bg-[#10B981]/20 font-bold",
  },
  {
    id: 8,
    title: "8. Revision Window",
    subtitle: "Controlled Scope Amendments",
    desc: "Revision request window countdown starts. Free minor tweaks within scope; scope creep triggers requotes.",
    role: "Client & QA",
    badge: "REVISION_PERIOD",
    badgeColor: "border-amber-500/50 text-amber-400 bg-amber-500/10",
  },
  {
    id: 9,
    title: "9. Archive & Payout",
    subtitle: "Read-Only Lock & Share Split",
    desc: "Project files locked in read-only archive. Financial ledger calculates percentage share splits for payout.",
    role: "Finance Officer",
    badge: "ARCHIVED & PAID",
    badgeColor: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
  },
];

export default function WorkflowStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStage = (STAGES[activeStep] ?? STAGES[0])!;

  return (
    <section id="workflow" className="py-24 px-6 bg-[#010114] relative z-10 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012E57] border border-[#CC6600]/30 text-xs font-mono text-[#CC6600] mb-4">
            MASTER 9-STAGE LIFECYCLE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            End-to-End Operational Pipeline
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            From client intake specifications to Senior QA audit gates and final payout disbursement.
          </p>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 mb-10 overflow-x-auto pb-4">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all text-center border ${
                activeStep === idx
                  ? "bg-[#012E57] border-[#CC6600] shadow-lg shadow-[#CC6600]/20 scale-105"
                  : "bg-[#012E57]/20 border-white/10 hover:border-white/30"
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-1 ${
                activeStep === idx ? "bg-[#CC6600] text-white" : "bg-white/10 text-white/70"
              }`}>
                {s.id}
              </span>
              <span className="text-[11px] font-semibold text-white truncate max-w-full">
                {s.title.split(". ")[1]}
              </span>
            </button>
          ))}
        </div>

        {/* Active Stage Detail Panel */}
        <div className="glass-panel p-8 sm:p-10 bg-[#012E57]/40 border border-white/15 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC6600]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs font-mono text-[#CC6600] tracking-wider uppercase font-semibold">
                STAGE 0{currentStage.id} OF 09
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {currentStage.title}
              </h3>
              <p className="text-sm font-mono text-white/60 mt-1">
                {currentStage.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/50">AUTHORITY:</span>
              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white font-semibold">
                {currentStage.role}
              </span>
              <span className={`text-xs font-mono px-3 py-1.5 rounded-lg border font-semibold ${currentStage.badgeColor}`}>
                {currentStage.badge}
              </span>
            </div>
          </div>

          <p className="text-white/90 text-lg leading-relaxed max-w-4xl mb-8">
            {currentStage.desc}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-white/60">
            <span>Click any stage above to inspect operational rules & status transitions.</span>
            <div className="flex gap-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono disabled:opacity-30"
              >
                ← Previous Stage
              </button>
              <button
                disabled={activeStep === STAGES.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(STAGES.length - 1, prev + 1))}
                className="px-4 py-2 rounded-lg bg-[#CC6600] hover:bg-[#E67300] text-white text-xs font-mono font-bold disabled:opacity-30"
              >
                Next Stage →
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

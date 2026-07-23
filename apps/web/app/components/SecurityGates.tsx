"use client";

import React from "react";

export default function SecurityGates() {
  return (
    <section id="security" className="py-24 px-6 bg-[#010114] relative z-10 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012E57] border border-[#10B981]/40 text-xs font-mono text-[#10B981] mb-4">
            COMPLIANCE & RELEASE GATES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Non-Negotiable Business Rules & Integrity Gates
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Built-in server-side authorization enforcement designed for enterprise audit integrity.
          </p>
        </div>

        {/* Security Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Rule 1: Payment Release Gate */}
          <div className="glass-panel p-8 bg-[#012E57]/30 border border-white/15 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CC6600]/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#CC6600]/20 text-[#CC6600] border border-[#CC6600]/40 font-bold">
                  RULE_REL_01
                </span>
                <span className="text-xs font-mono text-white/50">SERVER GATE</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Payment Release Gate</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Final project deliverable packages and certificate files are strictly blocked from release unless <code className="text-[#CC6600] font-mono font-bold">payment_status == &quot;FULLY_PAID&quot;</code>.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 font-mono text-xs text-white/80 flex items-center justify-between">
              <span>Status check:</span>
              <span className="text-[#10B981] font-bold">ENFORCED</span>
            </div>
          </div>

          {/* Rule 2: Senior QA Gate */}
          <div className="glass-panel p-8 bg-[#012E57]/30 border border-white/15 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold">
                  RULE_REL_02
                </span>
                <span className="text-xs font-mono text-white/50">QA AUDIT</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Senior QA Verification</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Complex, high-tier, or rush projects require explicit <code className="text-purple-400 font-mono font-bold">QA_APPROVED</code> audit scorecards from a Senior QA Lead before release authorization.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 font-mono text-xs text-white/80 flex items-center justify-between">
              <span>Audit score:</span>
              <span className="text-purple-400 font-bold">PASSED</span>
            </div>
          </div>

          {/* Rule 3: Zero Fraud Tolerance */}
          <div className="glass-panel p-8 bg-[#012E57]/30 border border-white/15 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                  RULE_ETH_01
                </span>
                <span className="text-xs font-mono text-white/50">ETHICS GUARD</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero-Tolerance Misconduct</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Unethical manipulation requests (e.g. forcing statistically significant p-values or data fabrication) trigger instant flags and executive CEO review.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 font-mono text-xs text-white/80 flex items-center justify-between">
              <span>Integrity check:</span>
              <span className="text-[#10B981] font-bold">PROTECTED</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

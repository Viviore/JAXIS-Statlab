"use client";

import React from "react";

export default function TrustBar() {
  return (
    <section className="py-12 border-y border-white/10 bg-[#010114]/90 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-mono tracking-widest text-white/50 uppercase mb-8">
          Built for High-Compliance Academic Institutions, Research Laboratories & Clinical Teams
        </p>

        {/* Compliance Badges & Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
          
          <div className="flex flex-col items-center p-4 rounded-xl glass-panel bg-[#012E57]/20 border border-white/10">
            <span className="text-2xl font-extrabold text-white font-mono">$10M+</span>
            <span className="text-xs text-white/60 font-medium">Research Financial Ledger Secured</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl glass-panel bg-[#012E57]/20 border border-white/10">
            <span className="text-2xl font-extrabold text-[#CC6600] font-mono">100%</span>
            <span className="text-xs text-white/60 font-medium">Senior QA Verification Gate</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl glass-panel bg-[#012E57]/20 border border-white/10">
            <span className="text-2xl font-extrabold text-white font-mono">SOC2 & ISO</span>
            <span className="text-xs text-white/60 font-medium">Enterprise Security Compliant</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl glass-panel bg-[#012E57]/20 border border-white/10">
            <span className="text-2xl font-extrabold text-[#10B981] font-mono">Zero Fraud</span>
            <span className="text-xs text-white/60 font-medium">Strict Ethical Misconduct Policy</span>
          </div>

        </div>
      </div>
    </section>
  );
}

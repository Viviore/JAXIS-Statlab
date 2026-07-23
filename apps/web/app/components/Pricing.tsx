"use client";

import React from "react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#010114] relative z-10 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012E57] border border-[#CC6600]/30 text-xs font-mono text-[#CC6600] mb-4">
            TRANSPARENT ENTERPRISE PACKAGES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Structured Pricing & Service Plans
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Strict quotation governance requiring Admin or CEO authorization. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Package 1: Standard Small Package */}
          <div className="glass-panel p-8 bg-[#012E57]/30 border border-white/15 rounded-2xl flex flex-col justify-between relative">
            <div>
              <div className="text-xs font-mono text-[#CC6600] uppercase tracking-wider mb-2 font-bold">Standard Scope</div>
              <h3 className="text-2xl font-bold text-white mb-2">Standard Package</h3>
              <p className="text-xs text-white/60 mb-6">Designed for standard statistical modeling and hypothesis testing.</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">$499</span>
                <span className="text-xs text-white/50">/ project</span>
              </div>

              <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 text-xs text-white/70 font-mono mb-6">
                ⚡ <span className="text-[#CC6600]">RULE_QUO_02:</span> 100% Upfront Payment structure required.
              </div>

              <ul className="space-y-3 text-sm text-white/80 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Descriptive & Inferential Testing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Processed Dataset Output (CSV/XLSX)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Basic QA Compliance Scorecard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> 7-Day Free Revision Window
                </li>
              </ul>
            </div>

            <a href="http://localhost:3001" className="btn-secondary w-full justify-center">
              Request Quotation
            </a>
          </div>

          {/* Package 2: Custom Enterprise (Featured) */}
          <div className="glass-panel p-8 bg-[#012E57]/80 border-2 border-[#CC6600] rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-[#CC6600]/20 transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#CC6600] text-white text-xs font-mono font-bold tracking-wider uppercase">
              MOST POPULAR FOR ENTERPRISE
            </div>

            <div>
              <div className="text-xs font-mono text-[#CC6600] uppercase tracking-wider mb-2 font-bold">Custom & Complex Scope</div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise Custom</h3>
              <p className="text-xs text-white/60 mb-6">For advanced statistical modeling, clinical trials, and multi-variable studies.</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">$1,299</span>
                <span className="text-xs text-white/50">/ custom quote</span>
              </div>

              <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 text-xs text-white/70 font-mono mb-6">
                🔒 Downpayment option available upon Admin authorization.
              </div>

              <ul className="space-y-3 text-sm text-white/90 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Advanced Multivariate & Bayesian Modeling
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Dedicated Senior QA Lead Audit
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Signed Certificate of Analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Priority Support Thread Access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> 14-Day Free Revision Window
                </li>
              </ul>
            </div>

            <a href="http://localhost:3001" className="btn-primary w-full justify-center text-base py-3">
              Request Enterprise Quote
            </a>
          </div>

          {/* Package 3: Rush Review */}
          <div className="glass-panel p-8 bg-[#012E57]/30 border border-white/15 rounded-2xl flex flex-col justify-between relative">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2 font-bold">Accelerated Timeline</div>
              <h3 className="text-2xl font-bold text-white mb-2">Rush Review</h3>
              <p className="text-xs text-white/60 mb-6">Expedited 24-48 hour turnaround with dedicated Senior QA Lead review.</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">$1,999</span>
                <span className="text-xs text-white/50">/ expedited</span>
              </div>

              <div className="p-3 rounded-lg bg-[#010114]/80 border border-white/10 text-xs text-white/70 font-mono mb-6">
                ⚡ Priority allocation to Senior QA Lead desk.
              </div>

              <ul className="space-y-3 text-sm text-white/80 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> 24 to 48 Hour Fast-Track Delivery
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Mandatory Senior QA Lead Oversight
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Real-Time Technical Support Thread
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#CC6600]">✓</span> Full Deliverable Package & Certificate
                </li>
              </ul>
            </div>

            <a href="http://localhost:3001" className="btn-secondary w-full justify-center">
              Submit Rush Intake
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#010114] border-t border-white/10 pt-16 pb-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#CC6600] flex items-center justify-center font-bold text-white shadow-lg shadow-[#CC6600]/30">
              JS
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              JAXIS <span className="text-[#CC6600] font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-[#012E57]/60 border border-[#CC6600]/30">StatLab</span>
            </span>
          </div>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            Enterprise workflow platform connecting clients, statisticians, QA leads, and finance officers from project intake to payout with strict compliance gates.
          </p>

          {/* System Uptime Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012E57]/60 border border-[#10B981]/40 text-xs font-mono text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>ALL PLATFORM SYSTEMS OPERATIONAL</span>
          </div>
        </div>

        {/* Links Col 1: Platform */}
        <div>
          <h4 className="text-xs font-mono text-[#CC6600] uppercase tracking-wider mb-4 font-bold">Platform</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#workflow" className="hover:text-white transition-colors">Master 9-Stage Workflow</a></li>
            <li><a href="#security" className="hover:text-white transition-colors">Payment Release Gates</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Quotation Engine</a></li>
            <li><a href="http://localhost:3001" className="hover:text-white transition-colors">StatLab Workspace</a></li>
          </ul>
        </div>

        {/* Links Col 2: Compliance */}
        <div>
          <h4 className="text-xs font-mono text-[#CC6600] uppercase tracking-wider mb-4 font-bold">Compliance</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#security" className="hover:text-white transition-colors">Senior QA Gate Audit</a></li>
            <li><a href="#security" className="hover:text-white transition-colors">Zero-Tolerance Misconduct Policy</a></li>
            <li><a href="#security" className="hover:text-white transition-colors">ISO 27001 & SOC2 Controls</a></li>
            <li><a href="#security" className="hover:text-white transition-colors">Financial Ledger Verification</a></li>
          </ul>
        </div>

        {/* Links Col 3: Legal & System */}
        <div>
          <h4 className="text-xs font-mono text-[#CC6600] uppercase tracking-wider mb-4 font-bold">Enterprise</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security Architecture</a></li>
            <li><a href="https://github.com/Viviore/JAXIS-Statlab" className="hover:text-white transition-colors">GitHub Repository</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div>
          © {new Date().getFullYear()} JAXIS StatLab Inc. All rights reserved. Enterprise Statistical Infrastructure.
        </div>
        <div className="font-mono text-white/40">
          Build v2.4.0-Production | Node v22.18.0 | Next.js 16
        </div>
      </div>
    </footer>
  );
}

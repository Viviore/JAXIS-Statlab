"use client";

import React from "react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-panel px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-9 h-9 rounded-lg bg-[#CC6600] flex items-center justify-center font-bold text-white shadow-lg shadow-[#CC6600]/30 transition-transform group-hover:scale-105">
            JS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              JAXIS <span className="text-[#CC6600] font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-[#012E57]/60 border border-[#CC6600]/30">StatLab</span>
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#workflow" className="hover:text-white transition-colors">Master Workflow</a>
          <a href="#security" className="hover:text-white transition-colors">Compliance & Gates</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3001"
            className="hidden sm:inline-flex text-sm text-white/80 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-[#012E57]/40 transition-all"
          >
            Sign In
          </a>
          <a href="http://localhost:3001" className="btn-primary">
            Launch Workspace
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

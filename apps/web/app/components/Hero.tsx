"use client";

import React, { useState, useEffect } from "react";

export default function Hero() {
  const [liveCounter, setLiveCounter] = useState(99.984);
  const [activeTab, setActiveTab] = useState<"regression" | "anova" | "bayesian">("regression");

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((prev) => +(prev + (Math.random() * 0.002 - 0.001)).toFixed(4));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-36 pb-24 px-6 bg-radial-glow overflow-hidden">
      {/* Background Radial Orange Lighting Subtle Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-radial-orange-glow pointer-events-none blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Release Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#012E57]/80 border border-[#CC6600]/30 text-xs font-semibold text-white mb-8 shadow-lg shadow-[#012E57]/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#CC6600] animate-pulse" />
          <span className="text-[#CC6600]">NEW RELEASE</span>
          <span className="text-white/40">|</span>
          <span className="text-white/90">Enterprise Statistical Compliance Engine v2.4</span>
        </div>

        {/* Oversized Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] text-gradient mb-6">
          Mission-Critical <span className="text-orange-gradient">Statistical Analysis</span> & Data Intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/70 max-w-3xl mb-10 leading-relaxed font-normal">
          The enterprise workflow platform connecting researchers, statisticians, QA leads, and finance officers from intake to payout—with strict payment release gates and Senior QA compliance.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a href="http://localhost:3001" className="btn-primary text-base px-8 py-3.5">
            Launch StatLab Workspace
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#workflow" className="btn-secondary text-base px-8 py-3.5">
            Explore 9-Stage Workflow
          </a>
        </div>

        {/* 3D Motion Statistical Telemetry Card Showcase */}
        <div className="w-full max-w-5xl perspective-container">
          <div className="glass-panel tilt-card-3d p-6 sm:p-8 bg-[#012E57]/40 border border-white/15 rounded-2xl shadow-2xl relative">
            
            {/* Window Bar Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs font-mono text-white/60">jaxis-engine://telemetry/session-84920</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  QA_APPROVED (Senior Lead verified)
                </span>
                <span className="text-xs font-mono text-[#CC6600] bg-[#CC6600]/10 px-2 py-1 rounded border border-[#CC6600]/30 font-semibold">
                  STATUS: FULLY_PAID
                </span>
              </div>
            </div>

            {/* Telemetry Dashboard Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-6">
              
              {/* Metric 1 */}
              <div className="p-4 rounded-xl bg-[#010114]/80 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#CC6600]/10 rounded-full blur-xl group-hover:bg-[#CC6600]/20 transition-all" />
                <div className="text-xs font-mono text-white/50 mb-1 uppercase tracking-wider">Statistical Accuracy</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
                  {liveCounter}%
                  <span className="text-xs text-[#10B981] font-semibold">CI 99.9%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#CC6600] h-full rounded-full w-[99.98%]" />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 rounded-xl bg-[#010114]/80 border border-white/10 relative overflow-hidden group">
                <div className="text-xs font-mono text-white/50 mb-1 uppercase tracking-wider">Hypothesis Significance</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
                  p &lt; 0.001
                  <span className="text-xs text-[#10B981] font-semibold">Reject H₀</span>
                </div>
                <div className="text-xs text-white/60 mt-2 font-mono">F-statistic: 142.85 | df: 148</div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 rounded-xl bg-[#010114]/80 border border-white/10 relative overflow-hidden group">
                <div className="text-xs font-mono text-white/50 mb-1 uppercase tracking-wider">Release Gate Status</div>
                <div className="text-xl sm:text-2xl font-bold text-[#10B981] font-mono flex items-center gap-2 mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  UNLOCKED
                </div>
                <div className="text-xs text-white/60 mt-2">All financial & QA gates cleared</div>
              </div>

            </div>

            {/* 3D Dynamic Animated Chart Visualization Mockup */}
            <div className="p-5 rounded-xl bg-[#010114]/90 border border-white/10 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/70">SELECT METHODOLOGY:</span>
                  <button
                    onClick={() => setActiveTab("regression")}
                    className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                      activeTab === "regression"
                        ? "bg-[#CC6600] text-white font-bold"
                        : "bg-[#012E57]/60 text-white/70 hover:text-white"
                    }`}
                  >
                    Multiple Regression
                  </button>
                  <button
                    onClick={() => setActiveTab("anova")}
                    className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                      activeTab === "anova"
                        ? "bg-[#CC6600] text-white font-bold"
                        : "bg-[#012E57]/60 text-white/70 hover:text-white"
                    }`}
                  >
                    MANOVA Model
                  </button>
                  <button
                    onClick={() => setActiveTab("bayesian")}
                    className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                      activeTab === "bayesian"
                        ? "bg-[#CC6600] text-white font-bold"
                        : "bg-[#012E57]/60 text-white/70 hover:text-white"
                    }`}
                  >
                    Bayesian Inference
                  </button>
                </div>
                <span className="text-xs font-mono text-[#CC6600] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CC6600] animate-ping" />
                  3D TELEMETRY LIVE
                </span>
              </div>

              {/* Dynamic Animated Bars */}
              <div className="h-44 flex items-end justify-between gap-2 pt-6 px-4 pb-2 bg-[#012E57]/20 rounded-lg border border-white/5 relative overflow-hidden">
                {[65, 82, 45, 95, 78, 88, 92, 70, 85, 100, 90, 75, 84, 96, 88].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-[#012E57] via-[#CC6600]/70 to-[#CC6600] rounded-t-md transition-all duration-700 group-hover:brightness-125"
                      style={{ height: `${activeTab === "anova" ? (height * 0.8) : activeTab === "bayesian" ? (height * 0.9) : height}%` }}
                    />
                    <span className="text-[10px] font-mono text-white/40 group-hover:text-white">v{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

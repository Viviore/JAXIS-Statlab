"use client";

import React from "react";

const SECTOR_DATA: Record<string, {
  cve: Array<{ id: string; type: string; desc: string; status: string }>;
  findings: { critical: number; minor: number };
  violations: Array<{ name: string; count: number }>;
  total: number;
}> = {
  publications: {
    total: 246,
    findings: { critical: 2, minor: 14 },
    violations: [
      { name: "! HETEROSKEDASTICITY_DETECTED", count: 2 },
      { name: "! MISSINGNESS_MCAR_VIOLATION", count: 14 }
    ],
    cve: [
      { id: "JAX-2025-318", type: "Survival Analysis", desc: "Cox Proportional Hazards in Oncology", status: "CLEARED" },
      { id: "JAX-2025-412", type: "Mixed Models", desc: "Longitudinal repeated measures", status: "CLEARED" },
      { id: "JAX-2025-501", type: "Bayesian Inference", desc: "MCMC chain convergence validation", status: "CLEARED" },
      { id: "JAX-2025-882", type: "Propensity Scoring", desc: "Observational cohort matching", status: "CLEARED" },
    ]
  },
};

export default function Solutions() {
  const currentData = SECTOR_DATA.publications!;

  return (
    <section 
      id="solutions" 
      style={{ 
        padding: "6rem 2rem 6rem 2rem", 
        position: "relative",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        borderTop: "1px solid var(--border-glass)"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Tabs */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          
          {/* Centered Header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ 
              fontFamily: "var(--font-mono)", 
              fontSize: "0.75rem", 
              letterSpacing: "0.15em", 
              color: "var(--accent-orange)", 
              textTransform: "uppercase", 
              display: "block", 
              marginBottom: "1rem" 
            }}>
              PEER-REVIEWED STANDARDS
            </span>
            <h2 style={{
              fontFamily: "var(--font-heading), sans-serif",
              fontSize: "clamp(2.5rem, 4vw, 4rem)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              maxWidth: "900px",
              margin: "0 auto",
              color: "#FFFFFF"
            }}>
              Not just output.
              <br />
              <span style={{ color: "var(--text-secondary)" }}>Defensible output.</span>
            </h2>
            <p style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "1.5rem auto 0"
            }}>
              Raw output. Assumption checks. APA tables. A narrative you can read out loud to your committee.
              That is the JAXIS deliverable.
            </p>
          </div>

          {/* 2-Column Split */}
          <div className="infra-layout" style={{ marginBottom: "4rem", alignItems: "flex-start" }}>
          {/* Left Col */}
          <div className="infra-sidebar solutions-sidebar">
            <p style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginBottom: "2.5rem"
            }}>
              We work with undergraduates, graduate researchers, clinical teams, and enterprise institutions.
              The standard is always the same: every output must withstand panel scrutiny.
            </p>
            
            {/* Minimal Horizontal Metric Group */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2.5rem",
              marginBottom: "2.5rem",
              borderTop: "1px solid var(--border-glass)",
              paddingTop: "1.5rem"
            }}>
              <div>
                <div style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  color: "var(--accent-orange)",
                  fontFamily: "var(--font-mono), monospace",
                  lineHeight: 1
                }}>100%</div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "0.35rem",
                  fontFamily: "var(--font-sans)"
                }}>Defended Deliverables</div>
              </div>
              <div>
                <div style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  color: "var(--accent-orange)",
                  fontFamily: "var(--font-mono), monospace",
                  lineHeight: 1
                }}>4-Eye</div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "0.35rem",
                  fontFamily: "var(--font-sans)"
                }}>QA Review Standard</div>
              </div>
            </div>
            
            <a href="#contact" className="hero-btn-primary" style={{ cursor: "pointer", display: "inline-flex" }}>
              Get Started
            </a>
          </div>

          {/* Right Col / Interactive Display */}
          <div className="infra-content solutions-interactive">
             <div style={{
               background: "var(--surface-glass)",
               backdropFilter: "blur(12px)",
               border: "1px solid var(--border-glass)",
               padding: "clamp(1.25rem, 5vw, 2.5rem)",
               width: "calc(100% - 2rem)",
               maxWidth: "540px"
             }}>
               <div style={{ width: "100%" }}>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", marginBottom: "2rem", alignItems: "flex-start" }}>
                   <div>
                     <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "var(--font-heading)" }}>Validation complete</div>
                     <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem", maxWidth: "200px" }}>
                       {currentData.findings.critical} critical & {currentData.findings.minor} minor findings filtered.
                     </div>
                   </div>
                   <div style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--text-primary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
                     {currentData.total}
                   </div>
                 </div>
                 
                 <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                   {currentData.violations.map((violation, idx) => (
                     <div key={idx} style={{ 
                       display: "flex", 
                       justifyContent: "space-between", 
                       fontSize: "0.65rem", 
                       fontFamily: "var(--font-mono), monospace", 
                       color: "#FF8080", 
                       marginBottom: idx === currentData.violations.length - 1 ? 0 : "0.5rem" 
                     }}>
                       <span>{violation.name}</span>
                       <span>x {violation.count}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
          </div>

          {/* Data Table Section */}
          <div style={{ marginBottom: "0" }}>
            <h2 style={{
              fontFamily: "var(--font-heading), sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              color: "#FFFFFF"
            }}>
              Validated statistical outputs published in top-tier peer-reviewed journals.
            </h2>
            
            <div style={{ width: "100%", borderTop: "1px solid var(--border-glass)" }}>
              {currentData.cve.map((row, idx) => (
                <div key={idx} className="cve-table-row">
                  <div style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 600, color: "#FFFFFF" }}>{row.id}</div>
                  <div style={{ color: "var(--accent-orange)" }}>{row.type}</div>
                  <div style={{ color: "var(--text-secondary)" }}>{row.desc}</div>
                  <div style={{ 
                    color: "var(--accent-orange)", 
                    background: "var(--accent-orange-tint)", 
                    border: "1px solid var(--accent-orange-border)",
                    padding: "0.15rem 0.6rem", 
                    fontSize: "0.65rem", 
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono), monospace"
                  }}>
                    {row.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 2x2 Bento Stat Grid */}
        <div className="infra-grid" style={{ marginTop: "6rem" }}>
          {/* Box 1 (Highlighted) */}
          <div className="bento-box" style={{ 
            background: "rgba(204, 102, 0, 0.05)", 
            border: "1px solid var(--accent-orange-border)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--accent-orange)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "var(--font-mono)" }}>
              &lt; 48hr
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
              From raw dataset to panel-ready deliverable
            </div>
          </div>
          
          {/* Box 2 */}
          <div className="bento-box" style={{ 
            background: "var(--surface-glass)", 
            border: "1px solid var(--border-glass)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#FFFFFF", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "var(--font-mono)" }}>
              98%
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
              Of JAXIS clients pass their panel defense on the first attempt
            </div>
          </div>
          
          {/* Box 3 */}
          <div className="bento-box" style={{ 
            background: "var(--surface-glass)", 
            border: "1px solid var(--border-glass)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#FFFFFF", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "var(--font-mono)" }}>
              3x
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
              Fixed price packages — no hourly billing, ever
            </div>
          </div>
          
          {/* Box 4 */}
          <div className="bento-box" style={{ 
            background: "var(--surface-glass)", 
            border: "1px solid var(--border-glass)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#FFFFFF", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "var(--font-mono)" }}>
              100%
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
              Reproducibility rate — every result is auditable by your committee
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const SECTORS = [
  { id: 'publications', name: "Peer-Reviewed Publications" },
  { id: 'dissertations', name: "Dissertations & Theses" },
  { id: 'grants', name: "Grant Proposals" },
  { id: 'longitudinal', name: "Longitudinal Studies" },
];

const CVE_DATA = [
  { id: "JAX-2025-318", type: "Survival Analysis", desc: "Cox Proportional Hazards in Oncology", status: "CLEARED" },
  { id: "JAX-2025-412", type: "Mixed Models", desc: "Longitudinal repeated measures", status: "CLEARED" },
  { id: "JAX-2025-501", type: "Bayesian Inference", desc: "MCMC chain convergence validation", status: "CLEARED" },
  { id: "JAX-2025-882", type: "Propensity Scoring", desc: "Observational cohort matching", status: "CLEARED" },
];

export default function Solutions() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState('publications');

  useEffect(() => {
    // Scroll fade observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -15% 0px" });

    const fadeEls = document.querySelectorAll('.sol-fade-up');
    fadeEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-light" ref={sectionRef} style={{ padding: "8rem 2rem", position: "relative" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Centered Header */}
        <div className="sol-fade-up scroll-fade-up" style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h2 style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "clamp(2.5rem, 4vw, 4rem)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: "900px",
            margin: "0 auto"
          }}>
            Built for academic researchers where statistical failure is not an option.
          </h2>
        </div>

        {/* 2-Column Split */}
        <div className="infra-layout" style={{ marginBottom: "8rem", alignItems: "flex-start" }}>
          {/* Left Col */}
          <div className="infra-sidebar sol-fade-up scroll-fade-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-muted-light" style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              marginBottom: "2.5rem"
            }}>
              JAXIS is built for high-stakes academic environments where a missed variable or assumption violation isn't just a typo—it's a retracted study or a rejected paper.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SECTORS.map((sec) => (
                <button 
                  key={sec.id}
                  className={`tab-light ${activeTab === sec.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  {sec.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Col */}
          <div className="sol-fade-up scroll-fade-up" style={{ flex: 1, minHeight: "450px", background: "var(--bg-primary)", position: "relative", overflow: "hidden", animationDelay: "0.3s" }}>
             {/* Technical visual overlay */}
             <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "radial-gradient(circle at 70% 30%, var(--surface-secondary) 0%, transparent 60%)" }}></div>
             
             {/* Terminal Card */}
             <div style={{ 
               position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
               background: "rgba(1, 46, 87, 0.4)",
               backdropFilter: "blur(12px)",
               border: "1px solid var(--border-glass)",
               padding: "2rem",
               width: "80%",
               maxWidth: "400px"
             }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", alignItems: "flex-start" }}>
                 <div>
                   <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "var(--font-montserrat)" }}>Validation complete</div>
                   <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem", maxWidth: "200px" }}>2 critical & 14 minor findings filtered.</div>
                 </div>
                 <div style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--text-primary)", lineHeight: 1 }}>
                   246
                 </div>
               </div>
               
               <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "'Courier New', monospace", color: "var(--status-crimson)", marginBottom: "0.5rem" }}>
                   <span>! HETEROSKEDASTICITY_DETECTED</span>
                   <span>x 2</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "'Courier New', monospace", color: "var(--status-crimson)" }}>
                   <span>! MISSINGNESS_MCAR_VIOLATION</span>
                   <span>x 14</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="sol-fade-up scroll-fade-up" style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            marginBottom: "2.5rem"
          }}>
            Validated statistical outputs published in top-tier peer-reviewed journals.
          </h2>
          
          <div style={{ width: "100%", borderTop: "1px solid rgba(1, 1, 20, 0.1)" }}>
            {CVE_DATA.map((row, idx) => (
              <div key={idx} style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr 2fr auto", 
                gap: "1rem",
                padding: "1.25rem 0",
                borderBottom: "1px solid rgba(1, 1, 20, 0.1)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "0.85rem",
                color: "var(--bg-primary)",
                alignItems: "center"
              }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 600 }}>{row.id}</div>
                <div style={{ color: "var(--accent-orange)" }}>{row.type}</div>
                <div style={{ color: "rgba(1, 1, 20, 0.6)" }}>{row.desc}</div>
                <div style={{ 
                  color: "var(--accent-orange)", 
                  background: "rgba(204, 102, 0, 0.1)", 
                  padding: "0.15rem 0.6rem", 
                  fontSize: "0.65rem", 
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}>
                  {row.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 2x2 Bento Stat Grid */}
        <div className="infra-grid sol-fade-up scroll-fade-up" style={{ animationDelay: "0.2s" }}>
          {/* Box 1 (Highlighted) */}
          <div style={{ 
            background: "rgba(204, 102, 0, 0.05)", 
            border: "1px solid rgba(204, 102, 0, 0.15)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--accent-orange)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              &lt; 48hr
            </div>
            <div style={{ fontSize: "1rem", color: "#010114" }}>
              From raw data to publication-ready tables and methodology
            </div>
          </div>
          
          {/* Box 2 */}
          <div style={{ 
            background: "rgba(1, 1, 20, 0.03)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#010114", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              98%
            </div>
            <div style={{ fontSize: "1rem", color: "rgba(1, 1, 20, 0.6)" }}>
              Reduction in Reviewer 2 pushback on methodology and assumptions
            </div>
          </div>
          
          {/* Box 3 */}
          <div style={{ 
            background: "rgba(1, 1, 20, 0.03)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#010114", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              3x
            </div>
            <div style={{ fontSize: "1rem", color: "rgba(1, 1, 20, 0.6)" }}>
              Faster manuscript submission cycles vs manual review
            </div>
          </div>
          
          {/* Box 4 */}
          <div style={{ 
            background: "rgba(1, 1, 20, 0.03)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "#010114", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              100%
            </div>
            <div style={{ fontSize: "1rem", color: "rgba(1, 1, 20, 0.6)" }}>
              Reproducibility guaranteed for stringent journal requirements
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

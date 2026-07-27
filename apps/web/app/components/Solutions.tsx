"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SECTORS = [
  { id: 'publications', name: "Peer-Reviewed Publications" },
  { id: 'dissertations', name: "Dissertations & Theses" },
  { id: 'grants', name: "Grant Proposals" },
  { id: 'longitudinal', name: "Longitudinal Studies" },
];

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
  dissertations: {
    total: 108,
    findings: { critical: 0, minor: 4 },
    violations: [
      { name: "! OUTLIER_INFLUENCE_HIGH", count: 3 },
      { name: "! MULTICOLLINEARITY_VIF_10", count: 1 }
    ],
    cve: [
      { id: "JAX-2025-102", type: "Linear Regression", desc: "Assumption check for student performance cohort", status: "CLEARED" },
      { id: "JAX-2025-115", type: "Logistic Regression", desc: "Multicollinearity diagnosis in binary models", status: "CLEARED" },
    ]
  },
  grants: {
    total: 62,
    findings: { critical: 1, minor: 3 },
    violations: [
      { name: "! POWER_UNDERPOWERED_TRIAL", count: 1 },
      { name: "! COVARIATE_IMBALANCE", count: 3 }
    ],
    cve: [
      { id: "JAX-2025-901", type: "Power Analysis", desc: "Sample size re-estimation for NIH application", status: "CLEARED" },
      { id: "JAX-2025-920", type: "ANCOVA Model", desc: "Covariate adjustment for multi-center trials", status: "CLEARED" },
    ]
  },
  longitudinal: {
    total: 315,
    findings: { critical: 3, minor: 18 },
    violations: [
      { name: "! AUTOCORRELATION_DETECTED", count: 3 },
      { name: "! SPATIAL_LAG_DEPENDENCY", count: 18 }
    ],
    cve: [
      { id: "JAX-2025-612", type: "GGE / GEE Models", desc: "Correlated clinical observations analysis", status: "CLEARED" },
      { id: "JAX-2025-703", type: "Time Series", desc: "ARIMA residuals autocorrelation check", status: "CLEARED" },
    ]
  }
};

export default function Solutions() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('publications');
  const currentData = (SECTOR_DATA[activeTab] || SECTOR_DATA.publications)!;

  useEffect(() => {
    // Scroll fade observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
          
          // Re-calculate GSAP pin spacing after the CSS fade-up animations complete
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 800);
        }
      });
    }, { rootMargin: "0px 0px -15% 0px" });

    const fadeEls = document.querySelectorAll('.sol-fade-up');
    fadeEls.forEach(el => observer.observe(el));

    // GSAP Scroll Pinning
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top 15%", // Pin a little below the navbar
        end: "+=2400", // 2400px of scroll distance to scrub through the 4 tabs
        pin: true,
        anticipatePin: 1, // Prevents layout bounce when entering/exiting the pin
        scrub: 1.5, // 1.5s of smooth interpolation catching up to the scroll position
        onUpdate: (self) => {
          const p = self.progress;
          let newTab = 'publications';
          if (p >= 0.75) newTab = 'longitudinal';
          else if (p >= 0.50) newTab = 'grants';
          else if (p >= 0.25) newTab = 'dissertations';

          // Only trigger React state update if it actually changed
          setActiveTab((prev) => {
            if (prev !== newTab) return newTab;
            return prev;
          });
        }
      });
    }, sectionRef);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  // Animate terminal content when tab changes
  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 15, filter: "blur(4px)" }, 
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out", overwrite: "auto" }
      );
    });
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section id="solutions" className="section-light" ref={sectionRef} style={{ padding: "14rem 2rem 8rem 2rem", position: "relative" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Pinned Composition: Header + Tabs */}
        <div ref={pinRef} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          
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
          <div className="infra-sidebar solutions-sidebar sol-fade-up scroll-fade-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-muted-light" style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              marginBottom: "2.5rem"
            }}>
              JAXIS is built for high-stakes academic environments where a missed variable or assumption violation isn&apos;t just a typo—it&apos;s a retracted study or a rejected paper.
            </p>
            
            <div role="tablist" aria-label="Research sectors" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {SECTORS.map((sec) => (
                <button 
                  key={sec.id}
                  id={`tab-${sec.id}`}
                  role="tab"
                  aria-selected={activeTab === sec.id}
                  aria-controls={`panel-${sec.id}`}
                  className={`tab-light ${activeTab === sec.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  <span>{sec.name}</span>
                  <span className="infra-tab-indicator"></span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Col */}
          <div 
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="sol-fade-up scroll-fade-up" 
            style={{ flex: 1, width: "100%", minHeight: "400px", background: "var(--bg-primary)", position: "relative", overflow: "hidden", animationDelay: "0.3s" }}
          >
             {/* Technical visual overlay */}
             <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "radial-gradient(circle at 70% 30%, var(--surface-secondary) 0%, transparent 60%)" }}></div>
             
             {/* Terminal Card */}
             <div style={{ 
               position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
               background: "var(--surface-glass)",
               backdropFilter: "blur(12px)",
               border: "1px solid var(--border-glass)",
               padding: "clamp(1.25rem, 5vw, 2.5rem)",
               width: "calc(100% - 2rem)",
               maxWidth: "540px"
             }}>
               <div ref={contentRef} style={{ width: "100%", willChange: "opacity, transform, filter" }}>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", marginBottom: "2rem", alignItems: "flex-start" }}>
                   <div>
                     <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "var(--font-montserrat)" }}>Validation complete</div>
                     <div style={{ color: "rgba(255, 255, 255, 0.72)", fontSize: "0.75rem", marginTop: "0.25rem", maxWidth: "200px" }}>
                       {currentData.findings.critical} critical & {currentData.findings.minor} minor findings filtered.
                     </div>
                   </div>
                   <div style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--text-primary)", lineHeight: 1 }}>
                     {currentData.total}
                   </div>
                 </div>
                 
                 <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                   {currentData.violations.map((violation, idx) => (
                     <div key={idx} style={{ 
                       display: "flex", 
                       justifyContent: "space-between", 
                       fontSize: "0.65rem", 
                       fontFamily: "var(--font-inter), sans-serif", 
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
        </div>
        {/* End Pinned Composition */}

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
          
          <div style={{ width: "100%", borderTop: "1px solid var(--border-light)" }}>
            {currentData.cve.map((row, idx) => (
              <div key={idx} className="cve-table-row">
                <div style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600 }}>{row.id}</div>
                <div style={{ color: "var(--accent-orange)" }}>{row.type}</div>
                <div style={{ color: "var(--text-muted-light)" }}>{row.desc}</div>
                <div style={{ 
                  color: "var(--accent-orange)", 
                  background: "var(--accent-orange-tint)", 
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
            background: "var(--accent-orange-light-tint)", 
            border: "1px solid var(--accent-orange-border)",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--accent-orange)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              &lt; 48hr
            </div>
            <div style={{ fontSize: "1rem", color: "var(--bg-primary)" }}>
              From raw data to publication-ready tables and methodology
            </div>
          </div>
          
          {/* Box 2 */}
          <div style={{ 
            background: "var(--bg-light-tint)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--bg-primary)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              98%
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-muted-light)" }}>
              Reduction in Reviewer 2 pushback on methodology and assumptions
            </div>
          </div>
          
          {/* Box 3 */}
          <div style={{ 
            background: "var(--bg-light-tint)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--bg-primary)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              3x
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-muted-light)" }}>
              Faster manuscript submission cycles vs manual review
            </div>
          </div>
          
          {/* Box 4 */}
          <div style={{ 
            background: "var(--bg-light-tint)", 
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px"
          }}>
            <div style={{ fontSize: "4rem", fontWeight: 300, color: "var(--bg-primary)", marginBottom: "1rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
              100%
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-muted-light)" }}>
              Reproducibility guaranteed for stringent journal requirements
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

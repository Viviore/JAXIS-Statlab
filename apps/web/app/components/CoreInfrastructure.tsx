"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  { 
    title: "The Methodology Lock", 
    desc: "A binding Scope of Work upfront. No revisions. No surprise fees. You get exactly what was agreed, down to the final decimal.",
    visual: "scan" 
  },
  { 
    title: "The Data Pre-Flight", 
    desc: "Our engine scans your dataset for missing values, outliers, and normality violations before any human touches it.",
    visual: "levene" 
  },
  { 
    title: "The 2-Pass QA Gateway", 
    desc: "A Senior Methodologist audits reproducibility. Our team verifies SOW compliance and APA 7th formatting. Nothing ships without both.",
    visual: "model3" 
  },
  { 
    title: "The Anti-P-Hacking Guarantee", 
    desc: "We never force significance. You get the raw output alongside a plain-English narrative — fully reproducible, fully auditable.",
    visual: "model4" 
  },
];

export default function CoreInfrastructure() {
  const [activeTab, setActiveTab] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {

    // Intersection Observer for scroll-spy highlighting
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pillarNum = Number(entry.target.getAttribute("data-pillar"));
          if (pillarNum) setActiveTab(pillarNum);
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px" });

    const cards = document.querySelectorAll('.pillar-card-observe');
    cards.forEach(card => observer.observe(card));

    // Intersection Observer for typewriter text and header intro
    const twObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("scroll-fade-up")) {
            entry.target.classList.add("active");
          } else {
            (entry.target as HTMLElement).style.opacity = "1";
            const lines = entry.target.querySelectorAll('.tw-line');
            lines.forEach((line, index) => {
              if (index === lines.length - 1) {
                line.classList.add("snippet-line", "snippet-line-last");
              } else {
                line.classList.add("snippet-line");
              }
            });
          }
          twObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -15% 0px" });

    const twElement = document.querySelector('.infra-typewriter-anim');
    if (twElement) twObserver.observe(twElement);
    
    const fadeUpElements = document.querySelectorAll('.scroll-fade-up');
    fadeUpElements.forEach(el => twObserver.observe(el));

    // GSAP context for grid entrance and terminal lines
    const ctx = gsap.context(() => {
      // Find all cards
      const cards = gsap.utils.toArray<HTMLElement>('.infra-card');
      
      if (cards.length > 0) {
        // Stagger cards in
        gsap.fromTo(cards, 
          { opacity: 0, y: 50 }, 
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".infra-grid",
              start: "top 85%",
            }
          }
        );

        // Terminal text staggering
        cards.forEach(card => {
          const termLines = gsap.utils.toArray<HTMLElement>('.term-line, .term-flex', card);
          if (termLines.length > 0) {
            gsap.fromTo(termLines,
              { opacity: 0, x: -10 },
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: "power1.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 90%",
                }
              }
            );
          }
        });
      }
    }, sectionRef);

    return () => {
      observer.disconnect();
      twObserver.disconnect();
      ctx.revert();
    };
  }, []);

  // Helper to render the terminal visuals based on the type
  const renderVisual = (type: string) => {
    switch(type) {
      case "scan":
        return (
          <div className="terminal-block">
            <div className="term-line"><span className="term-label">SCANNING:</span> CLINICAL_COHORT_V2.SAV <span style={{ float: 'right' }}>9.8s</span></div>
            <div className="term-line term-dim" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>ROWS: 54,021 | COLS: 304 | MISSING: YES</div>
            <div className="term-line"><span className="term-dim">ANALYZING...</span> <span style={{ color: 'var(--accent-orange)', letterSpacing: '2px' }}>||||||||||||||||||||||||</span></div>
            <div className="term-flex" style={{ marginTop: '1.5rem' }}>
              <span>SHAPIRO_WILK_NORM</span>
              <span className="term-badge term-emerald">CLEARED</span>
            </div>
            <div className="term-flex">
              <span>HOMOSCEDASTICITY_CHK</span>
              <span className="term-badge term-amber">SUSPICIOUS PATTERN</span>
            </div>
            <div className="term-flex">
              <span>MULTICOLLINEARITY</span>
              <span className="term-badge term-crimson">[CRIT] VIF &gt; 10</span>
            </div>
          </div>
        );
      case "levene":
        return (
          <div className="terminal-block">
            <div className="term-flex"><span>LEVENE_TEST</span><span className="term-dim">DAY 0</span></div>
            <div className="term-flex"><span>HETERO_VARIANCE <span className="term-crimson">[FAIL]</span></span><span className="term-dim">DAY 0</span></div>
            <div className="term-flex"><span>VENDOR_NOTIFIED</span><span className="term-dim">DAY 1</span></div>
            <div className="term-flex" style={{ marginTop: '1rem', borderLeft: '2px solid var(--status-emerald)', paddingLeft: '8px' }}>
              <span>WELCH_ANOVA_APPLIED <span className="term-emerald">[FIXED]</span></span>
              <span className="term-dim">DAY 12</span>
            </div>
          </div>
        );
      case "anova":
        return (
          <div className="terminal-block" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div className="term-flex"><span className="term-emerald">■</span><span> OUTLIERS DETECTED</span></div>
              <div className="term-flex" style={{ marginTop: '0.5rem' }}><span className="term-dim">COOKS_D</span><span style={{float: 'right'}}>142</span></div>
              <div className="term-flex"><span className="term-dim">MAHALANOBIS</span><span style={{float: 'right'}}>68</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="term-flex"><span className="term-accent">■</span><span> IMPACT VERIFIED</span></div>
              <div className="term-flex" style={{ marginTop: '0.5rem' }}><span className="term-dim">EFFECT_SKEW</span><span style={{float: 'right'}}>HIGH</span></div>
              <div className="term-flex"><span className="term-dim">INFLUENCE</span><span style={{float: 'right'}}>CRITICAL</span></div>
            </div>
          </div>
        );
      case "summary":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">[REPORTING]</div>
            <div className="term-line" style={{ marginBottom: '1.5rem' }}>FINAL_MODEL_OUTPUT_V4</div>
            <div className="term-flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="term-dim">■ DATA SCAN</span><span>10,000 VARS FLAGGED</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">■ JAXIS VALIDATED</span><span className="term-emerald">7 CRITICAL</span>
            </div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span className="term-crimson">HIGH</span><span className="term-crimson">4</span>
            </div>
            <div className="term-flex">
              <span className="term-amber">MEDIUM</span><span className="term-amber">3</span>
            </div>
          </div>
        );
      case "model1":
        return (
          <div className="terminal-block">
            <div className="term-flex"><span>CROSS_VALIDATION</span><span className="term-dim">K=5</span></div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span className="term-dim">FOLD 1</span>
              <span style={{ color: 'var(--status-emerald)' }}>████████████ 98%</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">FOLD 2</span>
              <span style={{ color: 'var(--status-emerald)' }}>████████████ 97%</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">FOLD 3</span>
              <span style={{ color: 'var(--status-emerald)' }}>████████████ 99%</span>
            </div>
            <div className="term-flex" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              <span>DATA_LEAKAGE</span><span className="term-emerald">NONE</span>
            </div>
          </div>
        );
      case "model2":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">BAYESIAN_OPTIMIZATION</div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>LR_RATE</span>
              <div style={{ display: 'flex', gap: '2px', width: '60px' }}>
                <div style={{ height: '4px', width: '10px', background: 'var(--text-muted)' }}></div>
                <div style={{ height: '8px', width: '10px', background: 'var(--accent-orange)' }}></div>
                <div style={{ height: '12px', width: '10px', background: 'var(--text-muted)' }}></div>
              </div>
            </div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span>DEPTH</span>
              <div style={{ display: 'flex', gap: '2px', width: '60px' }}>
                <div style={{ height: '10px', width: '10px', background: 'var(--text-muted)' }}></div>
                <div style={{ height: '14px', width: '10px', background: 'var(--text-muted)' }}></div>
                <div style={{ height: '6px', width: '10px', background: 'var(--accent-orange)' }}></div>
              </div>
            </div>
            <div className="term-line" style={{ marginTop: '1.5rem' }}>
              <span className="term-emerald">[CONVERGED]</span> GLOBAL MAXIMA
            </div>
          </div>
        );
      case "model3":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">SHAP_VALUE_IMPACT</div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>AGE</span>
              <div style={{ width: '80px', height: '8px', background: 'var(--accent-orange)' }}></div>
            </div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span>BIOMARKER_C</span>
              <div style={{ width: '50px', height: '8px', background: 'rgba(204,102,0,0.6)' }}></div>
            </div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span>TREATMENT_GRP</span>
              <div style={{ width: '30px', height: '8px', background: 'rgba(204,102,0,0.3)' }}></div>
            </div>
            <div className="term-line term-emerald" style={{ marginTop: '1rem' }}>XAI_REPORT_GENERATED</div>
          </div>
        );
      case "model4":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">DOCKER_BUILD</div>
            <div className="term-line">STEP 1/4: FROM python:3.9-slim</div>
            <div className="term-line">STEP 2/4: COPY model.onnx .</div>
            <div className="term-line">STEP 3/4: EXPOSE 8080</div>
            <div className="term-line">STEP 4/4: RUN inference.py</div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>STATUS</span><span className="term-badge term-emerald">READY</span>
            </div>
          </div>
        );
      case "trial1":
        return (
          <div className="terminal-block">
            <div className="term-flex"><span>INTERIM_LOOK</span><span className="term-dim">PHASE II</span></div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span className="term-dim">ARM_A (CONTROL)</span>
              <span style={{ color: 'var(--status-amber)' }}>█████ 40%</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">ARM_B (HIGH_DOSE)</span>
              <span style={{ color: 'var(--accent-orange)' }}>█████████ 60%</span>
            </div>
            <div className="term-flex" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              <span>ADAPTIVE_SHIFT</span><span className="term-emerald">VALIDATED</span>
            </div>
          </div>
        );
      case "trial2":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">N_REESTIMATION</div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>ORIGINAL_N</span><span className="term-dim">350</span>
            </div>
            <div className="term-flex">
              <span>OBSERVED_VARIANCE</span><span className="term-amber">HIGH</span>
            </div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>RECALCULATED_N</span><span className="term-accent">412</span>
            </div>
            <div className="term-line term-emerald" style={{ marginTop: '0.5rem' }}>POWER MAINTAINED &gt; 90%</div>
          </div>
        );
      case "trial3":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">O_BRIEN_FLEMING_BOUNDARY</div>
            <div className="term-flex" style={{ marginTop: '1rem' }}>
              <span>Z_STATISTIC</span><span className="term-accent">3.41</span>
            </div>
            <div className="term-flex">
              <span>EFFICACY_BOUNDARY</span><span className="term-dim">2.96</span>
            </div>
            <div className="term-flex" style={{ marginTop: '1.5rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
              <span className="term-emerald">EARLY_STOPPING</span>
              <span className="term-emerald">RECOMMENDED</span>
            </div>
          </div>
        );
      case "trial4":
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">[MAPPING] RAW_TO_SDTM</div>
            <div className="term-flex" style={{ marginTop: '0.5rem' }}>
              <span className="term-dim">■ DEMOGRAPHICS (DM)</span><span className="term-emerald">PASS</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">■ ADVERSE_EVENTS (AE)</span><span className="term-emerald">PASS</span>
            </div>
            <div className="term-flex">
              <span className="term-dim">■ LAB_RESULTS (LB)</span><span className="term-emerald">PASS</span>
            </div>
            <div className="term-line" style={{ marginTop: '1.5rem', color: 'var(--text-primary)' }}>
              CDISC_COMPLIANCE_SCORE: 100%
            </div>
          </div>
        );
      default:
        return (
          <div className="terminal-block">
            <div className="term-line term-dim">AWAITING_INPUT_STREAM...</div>
            <div className="term-line" style={{ color: 'var(--accent-orange)' }}>&gt; _</div>
          </div>
        );
    }
  };

  return (
    <section 
      id="approach" 
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bg-primary)",
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,8,0.5) 0%, rgba(0,0,8,0) 150px)",
        color: "var(--text-primary)",
        padding: "8rem 2rem 4rem 2rem",
        position: "relative",
        zIndex: 10,
        marginTop: "-100vh",
        borderTopLeftRadius: "32px",
        borderTopRightRadius: "32px",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 -30px 80px rgba(0, 0, 0, 0.6)",
        overflow: "hidden"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 5 }}>
        
        {/* Header Area */}
        <div className="infra-layout" style={{ marginBottom: "4rem" }}>
          {/* Aligned with sidebar */}
          <div className="infra-sidebar" style={{ position: "static", gap: 0, padding: 0 }}>
            <div className="infra-typewriter-anim" style={{ 
              fontFamily: "var(--font-inter), sans-serif", 
              fontSize: "0.7rem", 
              letterSpacing: "0.08em", 
              color: "var(--text-muted)",
              lineHeight: 1.6,
              opacity: 0,
              maxWidth: "100%",
              overflow: "hidden"
            }}>
              <span className="tw-line" style={{ display: 'block' }}>
                WHY STUDENTS FAIL
              </span>
            </div>
          </div>
          
          {/* Aligned with grid */}
          <div style={{ flex: 1 }}>
              <h2 className="scroll-fade-up" style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginTop: "-0.5rem"
            }}>
              Nobody taught you how
              <br />
              <span style={{ color: "var(--text-secondary)" }}>to prove it.</span>
            </h2>
            <p className="scroll-fade-up" style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "var(--text-secondary)",
              maxWidth: "560px",
              marginTop: "1.5rem",
              animationDelay: "0.15s"
            }}>
              Your panel expects you to defend every decimal. Cheap freelancers hand you a file you cannot explain. JAXIS closes that gap.
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="infra-layout">
          
          {/* Left Tabs (Sticky Anchor Menu) */}
          <div className="infra-sidebar" style={{ position: "static", gap: 0, padding: 0 }}>
            {[1, 2].map((pillarNum) => (
              <button
                key={pillarNum}
                onClick={() => {
                  setActiveTab(pillarNum);
                  document.getElementById(`pillar-${pillarNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`infra-tab ${activeTab === pillarNum ? "active" : ""}`}
              >
                {pillarNum === 1 ? 'OUR INFRASTRUCTURE' : 'THE 4 PILLARS'}
              </button>
            ))}
          </div>

          {/* Right Grid (2-column layout) */}
          <div className="infra-grid">
            {FEATURES.map((card, idx) => (
              <div 
                key={idx} 
                id={idx % 2 === 0 ? `pillar-${Math.floor(idx / 2) + 1}` : undefined}
                className="infra-card pillar-card-observe"
                data-pillar={Math.floor(idx / 2) + 1}
              >
                <div className="infra-card-header">
                  <h3 className="infra-card-title">{card.title}</h3>
                  <p className="infra-card-desc">{card.desc}</p>
                </div>
                <div className="infra-card-visual">
                  {renderVisual(card.visual)}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}

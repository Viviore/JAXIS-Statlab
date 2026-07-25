"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    id: "validation",
    label: "PILLAR I - CONTINUOUS VALIDATION",
    cards: [
      { 
        title: "Understand all your data", 
        desc: "We detect unvalidated variables, missingness patterns, and assumption violations across datasets, with or without dictionary access.",
        visual: "scan" 
      },
      { 
        title: "Control your statistical risk", 
        desc: "Move from trusting third-party vendors to verifying statistical outputs yourself. Find critical flaws in clinical pipelines before they are published.",
        visual: "levene" 
      },
      { 
        title: "Focus on what actually matters", 
        desc: "JAXIS verifies every finding through rigorous robustness checks. Not every flagged outlier is relevant — we show you which ones actually skew your results.",
        visual: "anova" 
      },
      { 
        title: "StatLab in action", 
        desc: "Data scan: 10,000 variables flagged. StatLab validated: 7 critical assumptions violated. Your team saves weeks and fixes what matters.",
        visual: "summary" 
      }
    ]
  },
  {
    id: "modeling",
    label: "PILLAR II - PREDICTIVE MODELING",
    cards: [
      { 
        title: "Train with confidence", 
        desc: "Our ensemble models run through rigorous cross-validation pipelines automatically, ensuring zero data leakage.", 
        visual: "model1" 
      },
      { 
        title: "Hyperparameter tuning", 
        desc: "Bayesian optimization finds the global maxima without the manual guesswork or compute waste.", 
        visual: "model2" 
      },
      { 
        title: "Explainable AI (XAI)", 
        desc: "SHAP values and LIME are built into every model delivery for full regulatory compliance and stakeholder trust.", 
        visual: "model3" 
      },
      { 
        title: "Deployment ready", 
        desc: "Export models directly to ONNX or secure Docker containers for immediate production inference.", 
        visual: "model4" 
      }
    ]
  },
  {
    id: "trial",
    label: "PILLAR III - TRIAL SUPPORT",
    cards: [
      { 
        title: "Adaptive Designs", 
        desc: "Modify trial parameters mid-course without inflating the Type I error rate or compromising integrity.", 
        visual: "trial1" 
      },
      { 
        title: "Power Analysis", 
        desc: "Dynamic sample size re-estimation based on interim variance checks ensures you never under-enroll.", 
        visual: "trial2" 
      },
      { 
        title: "Interim Monitoring", 
        desc: "Automated O'Brien-Fleming boundaries for early stopping for efficacy or futility.", 
        visual: "trial3" 
      },
      { 
        title: "CDISC Compliance", 
        desc: "Raw clinical data transformed to strict SDTM and ADaM formats seamlessly and securely.", 
        visual: "trial4" 
      }
    ]
  }
];

export default function CoreInfrastructure() {
  const [activeTab, setActiveTab] = useState(PILLARS[0]!.id);
  const sectionRef = useRef<HTMLElement>(null);

  const activeData = PILLARS.find(p => p.id === activeTab)!;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        });

        tl.from(".infra-header-anim", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.2
        })
        .from(".infra-sidebar-anim", {
          x: -30,
          opacity: 0,
          duration: 1.0,
          ease: "power3.out"
        }, "-=0.8")
        .from(".infra-grid-anim", {
          y: 30,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out"
        }, "-=0.8");
      });
    }, sectionRef);

    return () => ctx.revert();
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
      id="core-infrastructure" 
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "8rem 2rem",
        position: "relative",
        zIndex: 10
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Area */}
        <div style={{ marginBottom: "5rem" }}>
          <div className="infra-header-anim" style={{ 
            fontFamily: "'Courier New', monospace", 
            fontSize: "0.75rem", 
            letterSpacing: "0.15em", 
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "2rem"
          }}>
            WHAT JAXIS STATLAB ACTUALLY DOES
            <div style={{ width: "6px", height: "12px", backgroundColor: "var(--text-muted)" }}></div>
          </div>
          
          <h2 className="infra-header-anim" style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            maxWidth: "800px"
          }}>
            End-to-end statistical intelligence.<br/>
            <span style={{ color: "var(--text-secondary)" }}>Validated from raw data to clinical release.</span>
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="infra-layout">
          
          {/* Left Tabs */}
          <div className="infra-sidebar infra-sidebar-anim">
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id)}
                className={`infra-tab ${activeTab === pillar.id ? "active" : ""}`}
              >
                {pillar.label}
                <span style={{ opacity: activeTab === pillar.id ? 1 : 0, transition: 'opacity 0.2s' }}>▶</span>
              </button>
            ))}
          </div>

          {/* Right Grid */}
          <div className="infra-grid infra-grid-anim" key={activeTab} style={{ animation: 'fadeSlideUp 0.4s ease-out forwards' }}>
            {activeData.cards.map((card, idx) => (
              <div key={idx} className="infra-card">
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

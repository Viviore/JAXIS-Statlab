"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SolutionCard, { StackedCardData } from "../ui/SolutionCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STACKED_CARDS: StackedCardData[] = [
  {
    id: "intake-diagnostics",
    step: "01",
    badge: "PHASE 01 // INTAKE AUDIT",
    title: "Distribution Diagnostics & Assumption Shield",
    subtitle: "Before fitting any statistical model, your raw dataset passes 18 automated mathematical assumption gates to prevent model misspecification.",
    accent: "#FACC15", // Yellow
    bgGradient: "linear-gradient(180deg, #2E2304 0%, #171202 100%)",
    tabBg: "linear-gradient(90deg, rgba(250, 204, 21, 0.25) 0%, rgba(46, 35, 4, 0.95) 100%)",
    borderColor: "rgba(250, 204, 21, 0.35)",
    pills: [
      "Shapiro-Wilk Normality",
      "Breusch-Pagan Homoscedasticity",
      "VIF Multicollinearity (< 5.0)",
      "Mahalanobis Distance Outliers",
      "Little's MCAR Missingness Matrix"
    ],
    features: [
      {
        tag: "DISTRIBUTION",
        title: "Normality Verification",
        desc: "Q-Q residual plotting, Kolmogorov-Smirnov bounds, and skewness/kurtosis z-score tests.",
        metric: "p > .05",
        metricLabel: "ASSUMPTION CLEARED"
      },
      {
        tag: "VARIANCE",
        title: "Homoscedasticity Gate",
        desc: "Levene's and White tests with automated robust standard error (HC3) fallback corrections.",
        metric: "F = 1.14",
        metricLabel: "EQUAL VARIANCE"
      },
      {
        tag: "COLLINEARITY",
        title: "VIF Multicollinearity",
        desc: "Variance Inflation Factor auditing to isolate collinear predictors before estimation.",
        metric: "VIF < 2.1",
        metricLabel: "OPTIMAL PRECISION"
      },
      {
        tag: "INTEGRITY",
        title: "Missingness Taxonomy",
        desc: "Full Information Maximum Likelihood (FIML) & Little's MCAR test for unbiased imputation.",
        metric: "0.0%",
        metricLabel: "DATA LEAKAGE"
      }
    ]
  },
  {
    id: "inferential-modeling",
    step: "02",
    badge: "PHASE 02 // INFERENTIAL ENGINE",
    title: "Multivariate, Structural & Longitudinal Modeling",
    subtitle: "Custom statistical architectures coded in R and Python tailored to your exact experimental design and research questions.",
    accent: "#38BDF8", // Blue
    bgGradient: "linear-gradient(180deg, #033266 0%, #01142B 100%)",
    tabBg: "linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(3, 50, 102, 0.95) 100%)",
    borderColor: "rgba(56, 189, 248, 0.35)",
    pills: [
      "Hierarchical Linear (HLM)",
      "Structural Equation (SEM / Path)",
      "Cox Proportional Hazards",
      "Bayesian MCMC Posterior",
      "Propensity Score Matching"
    ],
    features: [
      {
        tag: "MULTILEVEL",
        title: "Hierarchical Linear (HLM)",
        desc: "Random intercept & random slope specifications for nested clinical cohorts and multi-site trials.",
        metric: "ICC = 0.28",
        metricLabel: "COHORT ACCOUNTED"
      },
      {
        tag: "STRUCTURAL",
        title: "SEM & Path Analysis",
        desc: "Confirmatory factor analysis (CFA) with CFI, TLI, and RMSEA fit indices.",
        metric: "CFI = .986",
        metricLabel: "EXCELLENT FIT"
      },
      {
        tag: "LONGITUDINAL",
        title: "Survival & Hazard Rates",
        desc: "Kaplan-Meier survival curves and Cox proportional hazards regression with risk ratios.",
        metric: "HR = 0.42",
        metricLabel: "p < .001 CONFIRMED"
      },
      {
        tag: "BAYESIAN",
        title: "MCMC Convergence",
        desc: "Posterior probability distributions, Gelman-Rubin diagnostics, and 95% highest density intervals.",
        metric: "R̂ = 1.001",
        metricLabel: "CHAINS CONVERGED"
      }
    ]
  },
  {
    id: "qa-verification",
    step: "03",
    badge: "PHASE 03 // 4-EYE REVIEW",
    title: "Independent Dual-Statistician Verification Gate",
    subtitle: "No deliverable leaves JAXIS without independent dual-analyst cross-calculation and senior sign-off.",
    accent: "#EF4444", // Red
    bgGradient: "linear-gradient(180deg, #420A0A 0%, #1C0303 100%)",
    tabBg: "linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(66, 10, 10, 0.95) 100%)",
    borderColor: "rgba(239, 68, 68, 0.35)",
    pills: [
      "Double-Blind Code Replication",
      "Zero P-Hacking Policy",
      "APA 7th Format Tables",
      "Senior QA Lead Sign-Off"
    ],
    features: [
      {
        tag: "REPRODUCIBILITY",
        title: "Blind Replication",
        desc: "A second senior statistician recalculates every figure from raw data without seeing initial notes.",
        metric: "100%",
        metricLabel: "REPRODUCIBILITY"
      },
      {
        tag: "PUBLICATION",
        title: "APA 7th Tables",
        desc: "Publication-grade typography with exact decimal precision, standard errors, and significance notations.",
        metric: "APA 7.0",
        metricLabel: "JOURNAL COMPLIANT"
      },
      {
        tag: "INTEGRITY",
        title: "Anti-P-Hacking Gate",
        desc: "Strict zero-tolerance policy against post-hoc manipulation, p-hacking, or fabricated significance.",
        metric: "0.00",
        metricLabel: "FRAUD TOLERANCE"
      },
      {
        tag: "GOVERNANCE",
        title: "Senior Lead Gate",
        desc: "Deliverables require formal sign-off from a Senior QA Lead before payment release (RULE_REL_02).",
        metric: "PASSED",
        metricLabel: "QA LEAD APPROVED"
      }
    ]
  },
  {
    id: "defense-synthesis",
    step: "04",
    badge: "PHASE 04 // DEFENSE READINESS",
    title: "1-on-1 Mock Panel Defense & Narrative Synthesis",
    subtitle: "A complete 4-part writeup you can read aloud, paired with live 1-on-1 coaching so you defend every decimal with confidence.",
    accent: "#10B981", // Green
    bgGradient: "linear-gradient(180deg, #053D2E 0%, #021F17 100%)",
    tabBg: "linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 61, 46, 0.95) 100%)",
    borderColor: "rgba(16, 185, 129, 0.35)",
    pills: [
      "Live 1-on-1 GMeet Defense",
      "Top 20 Panel Questions Script",
      "Null-Result Defense",
      "Free Academic Revision Shield"
    ],
    features: [
      {
        tag: "COACHING",
        title: "Live Mock Defense",
        desc: "1-on-1 simulated panel session with a Senior Statistician grilling you on methodology and test choice.",
        metric: "1-ON-1",
        metricLabel: "LIVE SIMULATION"
      },
      {
        tag: "SYNTHESIS",
        title: "Defense Narrative Script",
        desc: "Verbatim speaking scripts explaining why every statistical test was chosen and what findings mean.",
        metric: "20+",
        metricLabel: "SCRIPTED ANSWERS"
      },
      {
        tag: "METHODOLOGY",
        title: "Null-Result Defense",
        desc: "Rigorous theoretical and power justifications when hypotheses yield non-significant findings.",
        metric: "β = .85",
        metricLabel: "POWER VALIDATED"
      },
      {
        tag: "WARRANTY",
        title: "Revision Guarantee",
        desc: "Rapid turnaround on methodology revisions requested by your panel or peer-review committee.",
        metric: "100%",
        metricLabel: "REVISION BACKED"
      }
    ]
  }
];

export default function Solutions() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinStageRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (typeof window === "undefined" || !pinStageRef.current) return;

    const totalCards = STACKED_CARDS.length;
    const wrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];

    // Master Timeline calibrated to natural 1:1 scroll speed
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinStageRef.current,
        start: "top 85px",
        end: "+=1100", // Snappy, natural scroll distance per card (~360px per card transition)
        pin: true,
        pinSpacing: true,
        scrub: 0.3, // Immediate 1:1 tracking without dragging lag
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
      }
    });

    // Animate Cards 02 (Blue), 03 (Red), 04 (Green) with natural physical travel distance
    for (let i = 1; i < totalCards; i++) {
      const cardEl = wrappers[i];
      if (!cardEl) continue;

      tl.fromTo(
        cardEl,
        {
          y: window.innerHeight * 0.7,
          force3D: true,
        },
        {
          y: 0,
          ease: "none",
          duration: 1,
          force3D: true,
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section 
      id="solutions" 
      ref={sectionRef}
      style={{ 
        position: "relative",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        paddingTop: "clamp(5rem, 8vh, 7rem)",
        paddingBottom: "clamp(8rem, 12vh, 10rem)",
        borderTop: "1px solid var(--border-glass)"
      }}
    >
      {/* Background ambient lighting */}
      <div 
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1400px",
          height: "1600px",
          background: "radial-gradient(circle, rgba(1, 46, 87, 0.45) 0%, rgba(1, 1, 20, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
        
        {/* ── Unified Pinned Stage (Header + Cards stay locked together) ── */}
        <div 
          ref={pinStageRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1160px",
            margin: "0 auto",
          }}
        >
          {/* Section Header */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: "1.75rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(204, 102, 0, 0.1)",
              border: "1px solid rgba(204, 102, 0, 0.3)",
              padding: "0.25rem 0.8rem",
              borderRadius: "999px",
              marginBottom: "0.5rem"
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-orange)" }}></span>
              <span style={{ 
                fontFamily: "var(--font-mono)", 
                fontSize: "0.7rem", 
                letterSpacing: "0.15em", 
                color: "var(--accent-orange)", 
                textTransform: "uppercase", 
                fontWeight: 600
              }}>
                SECTION 03 // END-TO-END METHODOLOGY
              </span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-heading), sans-serif",
              fontSize: "clamp(1.75rem, 3vw, 2.4rem)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              maxWidth: "1050px",
              margin: "0 auto",
              color: "#FFFFFF"
            }}>
              Not just raw output. <span style={{ color: "var(--text-secondary)" }}>An airtight, defensible methodology.</span>
            </h2>
            
            <p style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.88rem",
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              maxWidth: "880px",
              margin: "0.4rem auto 0"
            }}>
              Explore the 4 execution gates of the JAXIS pipeline — from pre-flight diagnostics to live 1-on-1 panel defense readiness.
            </p>
          </div>

          {/* ── Cards Stacking Deck (Fixed absolute stack: Card 04 fully covers Card 03 content) ── */}
          <div 
            className="stacked-cards-deck"
            style={{ 
              position: "relative",
              width: "100%",
              minHeight: "560px",
            }}
          >
            {STACKED_CARDS.map((card, idx) => (
              <div
                key={card.id}
                ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  top: idx === 0 ? 0 : `${idx * 52}px`,
                  left: 0,
                  right: 0,
                  zIndex: idx + 1,
                  width: "100%",
                  willChange: "transform",
                  transform: "translate3d(0, 0, 0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <SolutionCard
                  card={card}
                  index={idx}
                  isStaticLayout={true}
                />
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

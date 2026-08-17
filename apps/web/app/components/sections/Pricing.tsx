"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PACKAGES = [
  {
    name: "DataCheck",
    catalog: "JX-01 // DIAGNOSTIC",
    price: "1,000",
    desc: "Essential automated diagnostics to ensure your raw data satisfies all parametric assumptions before formal estimation.",
    features: [
      "Automated Data Cleaning & Outlier Audit",
      "Shapiro-Wilk Normality & Skewness Clearance",
      "Scale Reliability (Cronbach's Alpha / McDonald's Omega)",
      "Official JAXIS Data Health Clearance Sheet"
    ],
    highlighted: false,
    isPerVar: false
  },
  {
    name: "Start Package",
    catalog: "JX-02 // BASELINE",
    price: "1,500",
    desc: "Ideal for demographic profiling, baseline survey summaries, and descriptive frequency distributions.",
    features: [
      "Descriptive Statistics & Frequency Distributions",
      "Cross-tabulations & Chi-Square Contingency Tests",
      "Publication-Ready APA 7th Edition Table Generation",
      "Plain-English Narrative Findings Translation",
      "100% Upfront Transparent Scope Freeze"
    ],
    highlighted: false,
    isPerVar: false
  },
  {
    name: "Core Package ★",
    catalog: "JX-03 // INFERENTIAL",
    price: "2,400",
    desc: "The standard analytical requirement for Undergraduate, Master's, and Ph.D. dissertations requiring inferential models.",
    features: [
      "Standard Inferential Models (T-Tests, ANOVA, Multiple Regression)",
      "Automated Assumption Audits (VIF, Levene's, Little's MCAR)",
      "Full JAXIS 4-Part Methodology & Defense Report",
      "Dual-Pass QA Gate (Senior Methodologist Re-calculation)",
      "Annotated Source Code Scripts (.R / .py / .sps)"
    ],
    highlighted: true,
    isPerVar: false
  },
  {
    name: "Advanced Package",
    catalog: "JX-04 // COMPLEX",
    price: "3,000+",
    desc: "Complex statistical architectures executed by elite Senior Methodologists for high-stakes research.",
    features: [
      "Advanced Modeling (SEM, Path Analysis, HLM, Survival Cox, MCMC)",
      "Custom Methodological Architecture Blueprint",
      "Priority Senior QA Lead Replication Routing",
      "Comprehensive Panel Question Preparation Suite",
      "Free Academic Revision Shield on Scope Scope"
    ],
    highlighted: false,
    isPerVar: false
  },
];

const CONSULTING = {
  name: "DefenseLab Module",
  catalog: "JX-DL // MOCK DEFENSE",
  desc: "Live 1-on-1 simulated panel defense with a Senior JAXIS Statistician. We grill you on your methodology, sample power, and test choices so you defend every decimal with unshakeable confidence.",
  price: "₱250/hr"
};

const ADDITIONS = [
  {
    name: "JAXIS Rush",
    desc: "3-day guaranteed turnaround upgrade",
    price: "₱300"
  },
  {
    name: "JAXIS Express",
    desc: "48-hour expedited delivery upgrade",
    price: "₱600"
  },
  {
    name: "JAXIS Emergency",
    desc: "24-hour mission-critical overnight delivery",
    price: "₱1,000"
  }
];

function padIndex(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Timeline
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".pricing-title-area",
          start: "top 85%",
          once: true,
        },
      });

      headerTl.fromTo(
        ".pricing-kicker",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );

      headerTl.fromTo(
        ".pricing-heading-line",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" },
        "-=0.3"
      );

      headerTl.fromTo(
        ".pricing-title-area p",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );

      // 2. Pricing Cards reveal
      gsap.fromTo(
        ".pricing-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".packages-grid",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 3. Offering Cards reveal
      ScrollTrigger.batch(".offering-card", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
          );
        },
        start: "top 90%",
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      style={{
        position: "relative",
        backgroundColor: "#010114",
        color: "#FFFFFF",
        padding: "6rem 2rem 8rem 2rem",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        
        {/* Section Header */}
        <div
          className="pricing-title-area"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "2.5rem",
            marginBottom: "4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem",
            alignItems: "flex-end",
          }}
        >
          <div>
            <span
              className="pricing-kicker"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "#CC6600",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              <span style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#CC6600" }} />
              SECTION // 04 — FIXED PRICING & SCOPE FREEZE
            </span>

            <h2
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: 0,
                color: "#FFFFFF",
              }}
            >
              <span className="pricing-heading-line block">Transparent Pricing.</span>
              <span className="pricing-heading-line block" style={{ color: "#38bdf8", fontWeight: 400 }}>
                Guaranteed Scope.
              </span>
            </h2>
          </div>

          <div>
            <p
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.88rem",
                lineHeight: 1.72,
                color: "rgba(255, 255, 255, 0.70)",
                margin: 0,
                maxWidth: "480px",
              }}
            >
              Every package includes raw output, assumption scans, statistical interpretation, and APA 7th Edition publication tables. Fixed price guarantee — no hourly billing, ever.
            </p>
          </div>
        </div>

        {/* Packages Strict 2x2 Grid */}
        <div className="packages-grid">
          {PACKAGES.map((pkg, idx) => (
            <div
              key={idx}
              className={`pricing-card ${pkg.highlighted ? "featured" : ""}`}
            >
              {pkg.highlighted && <div className="pricing-card-scanline" />}
              <span className="pricing-card-index">{padIndex(idx + 1)}</span>
              
              <div style={{ flex: 1 }}>
                <span className="pricing-card-catalog">{pkg.catalog}</span>
                {pkg.highlighted && (
                  <span className="pricing-card-tag">[ RECOMMENDED_FOR_THESIS_DEFENSE ]</span>
                )}
                
                <h3 className="pricing-card-name">{pkg.name}</h3>
                <p className="pricing-card-desc">{pkg.desc}</p>
                
                <div className="pricing-card-price-container">
                  <span className="pricing-card-price">
                    <span className="price-currency">₱</span>
                    {pkg.price}
                  </span>
                  <span className="pricing-card-price-suffix">
                    {pkg.isPerVar ? "PHP // PER_VAR" : "PHP // FIXED"}
                  </span>
                </div>

                <hr className="pricing-card-divider" />

                <ul className="pricing-card-list">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="pricing-card-list-item">
                      <span className="pricing-card-bullet">[✓]</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#contact"
                className="pricing-card-cta"
                style={{ marginTop: "1.5rem" }}
              >
                Initialize Scope Freeze
              </a>
            </div>
          ))}
        </div>

        {/* Offerings Area (Upgrades & DefenseLab) */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: "3.5rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "#38bdf8",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              DEFENSE READINESS & EXPEDITED TURNAROUND
            </span>
            <h3
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "1.5rem",
                fontWeight: 400,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              DefenseLab & Delivery Upgrades
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* DefenseLab Module Card */}
            <div
              className="offering-card"
              style={{
                padding: "2.25rem 2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "260px",
                position: "relative",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.64rem",
                    color: "#CC6600",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  {CONSULTING.catalog}
                </span>
                <h4
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "1.35rem",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    margin: "0 0 0.75rem 0",
                  }}
                >
                  {CONSULTING.name}
                </h4>
                <p
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                    color: "rgba(255, 255, 255, 0.70)",
                    margin: 0,
                  }}
                >
                  {CONSULTING.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "1.75rem", fontWeight: 300, color: "#FFFFFF" }}>
                  {CONSULTING.price}
                </span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", color: "#38bdf8", letterSpacing: "0.08em" }}>
                  LIVE 1-ON-1 SESSION
                </span>
              </div>
            </div>

            {/* Turnaround Add-ons List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {ADDITIONS.map((add, idx) => (
                <div
                  key={idx}
                  className="offering-card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.98rem",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        margin: "0 0 0.25rem 0",
                      }}
                    >
                      {add.name}
                    </h4>
                    <p
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.78rem",
                        color: "rgba(255, 255, 255, 0.60)",
                        margin: 0,
                      }}
                    >
                      {add.desc}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "#CC6600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {add.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.64rem",
              color: "rgba(255, 255, 255, 0.40)",
              letterSpacing: "0.1em",
            }}
          >
            SYS // ALL_PRICES_IN_PHP // ZERO_SCOPE_CREEP_GUARANTEE // JAXIS_STATLAB_V2
          </span>

          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.64rem",
              color: "#38bdf8",
              letterSpacing: "0.08em",
            }}
          >
            RULE_QUO_01 & RULE_QUO_02 COMPLIANT ✓
          </span>
        </div>

      </div>
    </section>
  );
}

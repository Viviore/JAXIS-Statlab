"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Mathematical Vector Line Art Components ───

function MethodologyLockCAD() {
  return (
    <svg viewBox="0 0 360 140" className="w-full h-36 block" fill="none">
      <line x1="20" y1="70" x2="340" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="180" y1="10" x2="180" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Isometric Blueprint Box */}
      <polygon
        className="vector-draw-path"
        points="180,24 250,56 180,88 110,56"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.2"
        strokeDasharray="400"
        strokeDashoffset="400"
      />
      <polygon
        className="vector-draw-path"
        points="110,56 180,88 180,122 110,90"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
        strokeDasharray="400"
        strokeDashoffset="400"
      />
      <polygon
        className="vector-draw-path"
        points="250,56 180,88 180,122 250,90"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
        strokeDasharray="400"
        strokeDashoffset="400"
      />

      {/* Precision Dimension Caliper Lines */}
      <line x1="92" y1="56" x2="92" y2="90" stroke="#CC6600" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="88" y1="56" x2="96" y2="56" stroke="#CC6600" strokeWidth="1" />
      <line x1="88" y1="90" x2="96" y2="90" stroke="#CC6600" strokeWidth="1" />
      <text x="52" y="76" fill="#CC6600" fontSize="8.5" fontFamily="monospace" letterSpacing="0.8">Δ=0.00</text>

      {/* Nodes */}
      <circle cx="180" cy="24" r="2.5" fill="#38bdf8" />
      <circle cx="250" cy="56" r="2.5" fill="#38bdf8" />
      <circle cx="180" cy="88" r="2.5" fill="#38bdf8" />
      <circle cx="110" cy="56" r="2.5" fill="#38bdf8" />

      <text x="20" y="130" fill="rgba(255,255,255,0.50)" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        SOW BOUNDS: [FROZEN]
      </text>
      <text x="230" y="130" fill="rgba(255,255,255,0.50)" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        POWER: 1-β = .80 ✓
      </text>
    </svg>
  );
}

function GaussianPreFlightLineArt() {
  return (
    <svg viewBox="0 0 360 140" className="w-full h-36 block" fill="none">
      <line x1="20" y1="108" x2="340" y2="108" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <line x1="180" y1="15" x2="180" y2="108" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Parametric Gaussian Normal Curve */}
      <path
        className="vector-draw-path"
        d="M 28,108 Q 108,108 144,60 T 180,22 T 216,60 Q 252,108 332,108"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeDasharray="400"
        strokeDashoffset="400"
      />

      {/* ±1.96 Sigma Calipers */}
      <line x1="125" y1="45" x2="125" y2="108" stroke="rgba(204, 102, 0, 0.85)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="235" y1="45" x2="235" y2="108" stroke="rgba(204, 102, 0, 0.85)" strokeWidth="1" strokeDasharray="2 2" />

      <circle cx="180" cy="22" r="3" fill="#CC6600" />
      <circle cx="125" cy="75" r="2.5" fill="#38bdf8" />
      <circle cx="235" cy="75" r="2.5" fill="#38bdf8" />

      <text x="112" y="128" fill="#CC6600" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        -1.96σ
      </text>
      <text x="174" y="128" fill="rgba(255,255,255,0.55)" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        μ=0
      </text>
      <text x="226" y="128" fill="#CC6600" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        +1.96σ
      </text>
      <text x="20" y="26" fill="#38bdf8" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        SHAPIRO-WILK: P=.240 [NORMAL] ✓
      </text>
    </svg>
  );
}

function DualPassQALineArt() {
  return (
    <svg viewBox="0 0 360 140" className="w-full h-36 block" fill="none">
      <line x1="20" y1="70" x2="340" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="90" y1="15" x2="90" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="180" y1="15" x2="180" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="270" y1="15" x2="270" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />

      {/* Waveform Trace 01 (Primary Methodologist) */}
      <path
        className="vector-draw-path"
        d="M 22,70 Q 62,25 102,70 T 182,70 T 262,70 T 338,70"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
        strokeDasharray="400"
        strokeDashoffset="400"
      />

      {/* Waveform Trace 02 (Senior QA Auditor - 100% Phase Match Overlay) */}
      <path
        className="vector-draw-path"
        d="M 22,70 Q 62,25 102,70 T 182,70 T 262,70 T 338,70"
        stroke="#CC6600"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        strokeDashoffset="400"
      />

      <circle cx="102" cy="70" r="2.5" fill="#38bdf8" />
      <circle cx="182" cy="70" r="2.5" fill="#38bdf8" />
      <circle cx="262" cy="70" r="2.5" fill="#38bdf8" />

      <text x="20" y="26" fill="rgba(255,255,255,0.50)" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        TRACE_01: METHODOLOGIST
      </text>
      <text x="195" y="26" fill="#CC6600" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        TRACE_02: SENIOR QA (REPLICATED)
      </text>
      <text x="20" y="128" fill="#38bdf8" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        CONCORDANCE: r=0.998 [100% MATCH] ✓
      </text>
    </svg>
  );
}

function RegressionDefenseLineArt() {
  return (
    <svg viewBox="0 0 360 140" className="w-full h-36 block" fill="none">
      <line x1="35" y1="20" x2="35" y2="115" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <line x1="35" y1="115" x2="335" y2="115" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

      {/* Regression Slope Line */}
      <line
        className="vector-draw-path"
        x1="48"
        y1="105"
        x2="318"
        y2="35"
        stroke="#38bdf8"
        strokeWidth="1.6"
        strokeDasharray="400"
        strokeDashoffset="400"
      />

      {/* Empirical Scatter Points & Residual Vertical Drop Lines */}
      {[
        { x: 70, y: 96, py: 99 },
        { x: 105, y: 84, py: 90 },
        { x: 145, y: 82, py: 79 },
        { x: 185, y: 66, py: 70 },
        { x: 220, y: 59, py: 61 },
        { x: 260, y: 48, py: 50 },
        { x: 298, y: 38, py: 41 },
      ].map((pt, i) => (
        <g key={i}>
          <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.py} stroke="rgba(204, 102, 0, 0.45)" strokeWidth="0.8" strokeDasharray="1 1" />
          <circle cx={pt.x} cy={pt.y} r="2" fill="rgba(255,255,255,0.85)" />
        </g>
      ))}

      <text x="48" y="26" fill="#38bdf8" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        FIT: R²=0.942 | P&lt;.001 ✓
      </text>
      <text x="215" y="128" fill="#CC6600" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        RESIDUALS: GAUSSIAN NORMAL ✓
      </text>
    </svg>
  );
}

// ─── Gate Data ───

interface GateData {
  code: string;
  index: string;
  tag: string;
  title: string;
  subtitle: string;
  desc: string;
  deliverableBadge: string;
  illustration: React.ReactNode;
  specs: { label: string; value: string; isHighlight?: boolean }[];
}

const GATES: GateData[] = [
  {
    code: "GATE_01",
    index: "01",
    tag: "HYPOTHESIS & SCOPE LOCK",
    title: "Methodology Lock",
    subtitle: "FORMAL PROTOCOL & SOW FREEZE",
    desc: "Binding Scope of Work established upfront. Research objectives, target sample power, and exact statistical test families are formally frozen before analysis starts to eliminate scope creep.",
    deliverableBadge: "DELIVERABLE: SOW & G*POWER BLUEPRINT",
    illustration: <MethodologyLockCAD />,
    specs: [
      { label: "SOW BOUNDS", value: "FROZEN AT INTAKE", isHighlight: true },
      { label: "POWER ANALYSIS", value: "1-β = .80 VERIFIED" },
      { label: "TEST FAMILY", value: "GLM / ANOVA / SEM" },
      { label: "SIGNIFICANCE", value: "TWO-TAILED α = .05", isHighlight: true },
    ],
  },
  {
    code: "GATE_02",
    index: "02",
    tag: "PRE-FLIGHT DIAGNOSTICS",
    title: "Data Pre-Flight Engine",
    subtitle: "AUTOMATED ASSUMPTION AUDIT",
    desc: "Every raw dataset is scanned for missingness patterns, high-leverage outliers, and parametric violations prior to model estimation. No raw data is ever plugged blindly into tests.",
    deliverableBadge: "DELIVERABLE: DIAGNOSTIC AUDIT SHEET",
    illustration: <GaussianPreFlightLineArt />,
    specs: [
      { label: "NORMALITY TEST", value: "SHAPIRO-WILK (p > .05)", isHighlight: true },
      { label: "HOMOSCEDASTICITY", value: "LEVENE'S TEST [CLEARED]" },
      { label: "MULTICOLLINEARITY", value: "VIF < 5.0 [CLEARED]" },
      { label: "MISSING DATA", value: "LITTLE'S MCAR [PASSED]", isHighlight: true },
    ],
  },
  {
    code: "GATE_03",
    index: "03",
    tag: "DUAL-STATISTICIAN AUDIT",
    title: "2-Pass QA Gateway",
    subtitle: "INDEPENDENT DUAL REPLICATION",
    desc: "Primary analysis is executed by a Methodologist, then independently replicated from scratch by a Senior QA Lead. If a single decimal differs, the deliverable does not release.",
    deliverableBadge: "DELIVERABLE: REPLICATION CERTIFICATE",
    illustration: <DualPassQALineArt />,
    specs: [
      { label: "PRIMARY RUN", value: "METHODOLOGIST [PASSED]" },
      { label: "REPLICATION AUDIT", value: "SENIOR QA [REPLICATED]", isHighlight: true },
      { label: "FORMATTING", value: "APA 7TH / IEEE STANDARD" },
      { label: "DECIMAL TOLERANCE", value: "100% REPRODUCIBLE", isHighlight: true },
    ],
  },
  {
    code: "GATE_04",
    index: "04",
    tag: "AUDITABLE DEFENSE SUITE",
    title: "Defense Blueprint",
    subtitle: "PANEL-DEFENSE READY DELIVERABLE",
    desc: "You receive raw, fully commented scripts in R, Python, or SPSS alongside a line-by-line plain-English narrative so you can defend every number in front of your adviser or panel with total confidence.",
    deliverableBadge: "DELIVERABLE: CODE & DEFENSE SCRIPT",
    illustration: <RegressionDefenseLineArt />,
    specs: [
      { label: "SOURCE CODE", value: "R / PYTHON / SPSS SCRIPT" },
      { label: "ETHICAL POLICY", value: "ZERO P-HACKING POLICY", isHighlight: true },
      { label: "NARRATIVE", value: "PLAIN-ENGLISH DEFENSE" },
      { label: "FINAL RELEASE", value: "PANEL VERIFIED", isHighlight: true },
    ],
  },
];

export default function Approach() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Section Header Animation
      gsap.fromTo(
        ".approach-header",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".approach-header",
            start: "top 85%",
          },
        }
      );

      // 2. 2x2 Bento Matrix Cards Entry & Vector Self-Drawing
      const cards = gsap.utils.toArray<HTMLElement>(".approach-bento-card");
      cards.forEach((card) => {
        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });

        cardTl.fromTo(
          card,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }
        );

        const paths = card.querySelectorAll(".vector-draw-path");
        if (paths.length > 0) {
          cardTl.fromTo(
            paths,
            { strokeDashoffset: 400 },
            { strokeDashoffset: 0, duration: 1.1, stagger: 0.08, ease: "power2.out" },
            "-=0.4"
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="approach"
      ref={sectionRef}
      style={{
        backgroundColor: "#010114",
        color: "#FFFFFF",
        padding: "6rem 2rem 8rem 2rem",
        position: "relative",
        zIndex: 10,
        borderRadius: 0,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 5 }}>
        
        {/* ── Section Header ── */}
        <div
          className="approach-header"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "2.5rem",
            marginBottom: "3.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "#CC6600",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#CC6600" }} />
              SECTION // 02 — THE JAXIS METHODOLOGY
            </div>
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
              Engineered for
              <br />
              <span style={{ color: "#38bdf8", fontWeight: 400 }}>Panel Scrutiny.</span>
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
              Your panel expects you to defend every decimal. Cheap freelancers hand you raw output you cannot explain. JAXIS builds four non-negotiable verification gates into every project.
            </p>
          </div>
        </div>

        {/* ── Strict 2x2 Architectural Bento Matrix (High Surface Contrast & Tactile Depth) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "2rem",
          }}
        >
          {GATES.map((gate) => (
            <div
              key={gate.code}
              className="approach-bento-card"
              style={{
                backgroundColor: "rgba(2, 11, 34, 0.85)", // Elevated surface token
                border: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "2rem",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {/* Corner crosshairs */}
              <span style={{ position: "absolute", top: "5px", left: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", top: "5px", right: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", bottom: "5px", left: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", bottom: "5px", right: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>

              <div>
                {/* Top Bar: Gate Index & Deliverable Tag */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingBottom: "0.85rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.74rem",
                      color: "#CC6600",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                    }}
                  >
                    [{gate.index}] {gate.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.64rem",
                      color: "rgba(255, 255, 255, 0.45)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {gate.deliverableBadge}
                  </span>
                </div>

                {/* Gate Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "1.45rem",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    margin: "0 0 0.65rem 0",
                    color: "#FFFFFF",
                  }}
                >
                  {gate.title}
                </h3>

                {/* Gate Description */}
                <p
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.84rem",
                    lineHeight: 1.65,
                    color: "rgba(255, 255, 255, 0.70)",
                    margin: "0 0 1.5rem 0",
                  }}
                >
                  {gate.desc}
                </p>

                {/* CAD Vector Schematic Box */}
                <div
                  style={{
                    backgroundColor: "#00000a",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {gate.illustration}
                </div>
              </div>

              {/* Auditable Spec Matrix (2x2 Grid) */}
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "0.85rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                {gate.specs.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.66rem",
                      padding: "5px 8px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      borderLeft: spec.isHighlight
                        ? "1px solid #CC6600"
                        : "1px solid rgba(56, 189, 248, 0.40)",
                    }}
                  >
                    <span style={{ color: "rgba(255, 255, 255, 0.45)", letterSpacing: "0.04em", fontSize: "0.58rem" }}>
                      {spec.label}
                    </span>
                    <span
                      style={{
                        color: spec.isHighlight ? "#38bdf8" : "#FFFFFF",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

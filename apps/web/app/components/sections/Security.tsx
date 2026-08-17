"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SECURITY_PILLARS = [
  {
    code: "SEC_01 // ANONYMITY",
    title: "100% Anonymity & Data Privacy",
    subtitle: "ZERO IDENTITY LEAKAGE",
    desc: "We remove all participant names, student IDs, emails, and school identifiers from your raw data before our analysts begin work. Your participants stay 100% anonymous.",
    badge: "CONFIDENTIAL & PRIVATE",
    specs: [
      { label: "IDENTITY PROTECTION", value: "NAMES & IDS REMOVED" },
      { label: "STORAGE SECURITY", value: "ENCRYPTED AT REST" },
    ],
  },
  {
    code: "SEC_02 // HONEST MATH",
    title: "We Never Fake or Manipulate Data",
    subtitle: "ZERO P-HACKING POLICY",
    desc: "We never fabricate numbers or alter survey data to force statistical significance. If your results show no significant difference, we provide legitimate academic explanations so your panel respects your research integrity.",
    badge: "ACADEMIC HONESTY",
    specs: [
      { label: "DATA MANIPULATION", value: "0.00 ZERO TOLERANCE" },
      { label: "NULL FINDINGS", value: "SCIENTIFICALLY DEFENDED" },
    ],
  },
  {
    code: "SEC_03 // OWNERSHIP",
    title: "You Own 100% of Your Research & Code",
    subtitle: "STRICT NON-DISCLOSURE AGREEMENTS",
    desc: "Every JAXIS statistician signs a legally binding Non-Disclosure Agreement (NDA). Your data, analysis scripts, and findings belong 100% to you. We never publish or claim co-authorship.",
    badge: "100% YOUR PROPERTY",
    specs: [
      { label: "NDA SIGNED", value: "ALL STAFF LEGALLY BOUND" },
      { label: "AUTHORSHIP", value: "100% RETAINED BY YOU" },
    ],
  },
  {
    code: "SEC_04 // ESCROW",
    title: "Safe Escrow Payment Protection",
    subtitle: "VERIFIED BEFORE FINAL RELEASE",
    desc: "Your payment is held safely in escrow upon project agreement. Deliverables are only released once an independent Senior QA Lead validates 100% decimal accuracy.",
    badge: "PAYMENT PROTECTED",
    specs: [
      { label: "QUALITY CHECK", value: "SENIOR QA STAMP REQUIRED" },
      { label: "PAYMENT GATING", value: "ESCROW SECURITY VERIFIED" },
    ],
  },
];

export default function Security() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Animation
      gsap.fromTo(
        ".security-header",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".security-header",
            start: "top 85%",
          },
        }
      );

      // 2. Security Cards Entry
      gsap.fromTo(
        ".security-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".security-grid",
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="security"
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
        
        {/* Header Block */}
        <div
          className="security-header"
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
              SECTION // 05 — PRIVACY & INTEGRITY
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
              Your Research Data Is Safe.
              <br />
              <span style={{ color: "#38bdf8", fontWeight: 400 }}>
                Guaranteed 100%.
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
              We protect your student identity, intellectual property, and academic reputation with four strict privacy and ethical guarantees.
            </p>
          </div>
        </div>

        {/* 2x2 Security Grid */}
        <div
          className="security-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "2rem",
            marginBottom: "4rem",
          }}
        >
          {SECURITY_PILLARS.map((item, idx) => (
            <div
              key={idx}
              className="security-card"
              style={{
                backgroundColor: "rgba(2, 11, 34, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "2.25rem 2rem",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "290px",
                position: "relative",
                transition: "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              {/* Corner crosshairs */}
              <span style={{ position: "absolute", top: "5px", left: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", top: "5px", right: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", bottom: "5px", left: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>
              <span style={{ position: "absolute", bottom: "5px", right: "5px", fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>+</span>

              <div>
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
                      fontSize: "0.72rem",
                      color: "#CC6600",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                    }}
                  >
                    {item.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.62rem",
                      color: "#38bdf8",
                      letterSpacing: "0.06em",
                      padding: "2px 8px",
                      backgroundColor: "rgba(56, 189, 248, 0.08)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "1.35rem",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    letterSpacing: "-0.01em",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.84rem",
                    lineHeight: 1.65,
                    color: "rgba(255, 255, 255, 0.70)",
                    margin: "0 0 1.5rem 0",
                  }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Spec Rows */}
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "0.85rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {item.specs.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.64rem",
                      padding: "5px 8px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      borderLeft: "1px solid rgba(56, 189, 248, 0.40)",
                    }}
                  >
                    <span style={{ color: "rgba(255, 255, 255, 0.40)", letterSpacing: "0.04em", fontSize: "0.56rem" }}>
                      {spec.label}
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security Matrix Certification Footer */}
        <div
          style={{
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
            SYS // STRICT_NDA_LOCK // PII_CLEANSED // ZERO_P_HACKING_POLICY // JAXIS_SEC
          </span>

          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.64rem",
              color: "#38bdf8",
              letterSpacing: "0.08em",
            }}
          >
            RULE_ETH_01 & RULE_REL_01 VERIFIED ✓
          </span>
        </div>

      </div>
    </section>
  );
}

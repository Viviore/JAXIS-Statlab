"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SECURITY_PILLARS = [
  {
    code: "SEC_01 // PII_SANITY",
    title: "Cryptographic PII Scrubbing",
    subtitle: "ZERO DATA LEAKAGE PROTOCOL",
    desc: "Every raw dataset is automatically scrubbed of Personally Identifiable Information (PII) before ingestion. Patient IDs, respondent names, and institutional identifiers are hashed so your participants stay 100% anonymous.",
    badge: "HIPAA & GDPR ALIGNED",
    specs: [
      { label: "INGESTION ENCRYPTION", value: "AES-256 AT REST" },
      { label: "PII SANITIZATION", value: "DE-IDENTIFIED AT INTAKE" },
    ],
  },
  {
    code: "SEC_02 // ETH_GUARD",
    title: "Zero-Tolerance Anti-P-Hacking",
    subtitle: "RULE_ETH_01 GOVERNANCE GATE",
    desc: "We enforce an uncompromising zero-tolerance policy against p-hacking, outcome fabrication, or post-hoc data manipulation. If your hypothesis yields a null result, we build rigorous methodological and theoretical defenses, never fabricated numbers.",
    badge: "ETHICAL INTEGRITY CERTIFIED",
    specs: [
      { label: "FRAUD TOLERANCE", value: "0.00 ZERO TOLERANCE" },
      { label: "NULL DEFENSE", value: "POWER-BACKED JUSTIFICATION" },
    ],
  },
  {
    code: "SEC_03 // IP_FENCE",
    title: "Binding Institutional NDAs",
    subtitle: "100% INTELLECTUAL PROPERTY LOCK",
    desc: "All JAXIS statisticians operate under binding Non-Disclosure Agreements. Your raw data, custom R/Python scripts, and derived findings remain 100% your proprietary academic intellectual property. We never claim co-authorship.",
    badge: "AUTHORSHIP PRESERVED",
    specs: [
      { label: "NDA STATUS", value: "LEGALLY BINDING (ALL STAFF)" },
      { label: "CODE OWNERSHIP", value: "100% CLIENT PROPRIETARY" },
    ],
  },
  {
    code: "SEC_04 // ESCROW_QA",
    title: "QA-Gated Escrow Treasury",
    subtitle: "RULE_REL_01 & RULE_REL_02 REPLICATION",
    desc: "Funds are held in secure escrow upon SOW protocol lock. Payout is permanently gated until your deliverable passes independent Senior QA replication (RULE_REL_02) and receives final client authorization (RULE_REL_01).",
    badge: "DUAL REPLICATION RELEASE",
    specs: [
      { label: "RELEASE GATE", value: "SENIOR QA STAMP REQUIRED" },
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
              SECTION // 05 — SECURITY & GOVERNANCE SHIELD
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
              Zero Data Leakage.
              <br />
              <span style={{ color: "#38bdf8", fontWeight: 400 }}>
                100% Ethical Integrity.
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
              Your research data, intellectual property, and academic reputation are protected by four non-negotiable institutional governance protocols.
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

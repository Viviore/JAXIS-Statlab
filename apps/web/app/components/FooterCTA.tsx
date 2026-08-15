"use client";

import Image from "next/image";
import { Hero as FooterBackground } from "./ui/tailwind-css-background-snippet";

export default function FooterCTA() {
  return (
    <>
      {/* ── Security Shield Section ── */}
      <section
        id="security"
        style={{
          backgroundColor: "var(--bg-primary)",
          padding: "8rem 2rem",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* DefenseLab */}
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent-orange)",
                  display: "block",
                  marginBottom: "1.25rem",
                }}
              >
                ADD-ON MODULE
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "1.25rem",
                }}
              >
                The DefenseLab Module
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: "2rem",
                }}
              >
                Terrified of your panel defense? Add the DefenseLab module for{" "}
                <strong style={{ color: "var(--accent-orange)" }}>₱250/hr</strong>. Sit
                down for a live, 1-on-1 GMeet mock defense with a JAXIS senior
                statistician. We will grill you on your methodology and probe your
                weak points so you can practice explaining your results to a hostile
                academic panel before the real thing.
              </p>
              <a
                href="#contact"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "10px 28px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "transparent",
                  display: "inline-block",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-orange)";
                  e.currentTarget.style.background = "rgba(204,102,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Add DefenseLab
              </a>
            </div>

            {/* Security Shield */}
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent-orange)",
                  display: "block",
                  marginBottom: "1.25rem",
                }}
              >
                SECURITY & INTEGRITY
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "1.75rem",
                }}
              >
                The JAXIS Security Shield
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  {
                    label: "Total Anonymity",
                    desc: "Your data is scrubbed of Personally Identifiable Information (PII) before it ever enters our execution lab.",
                  },
                  {
                    label: "Strict NDAs",
                    desc: "All JAXIS statisticians operate under binding Non-Disclosure Agreements. Your research remains entirely your intellectual property.",
                  },
                  {
                    label: "Escrow Treasury",
                    desc: "Your payment is held securely in our system upon signing the SOW. It is only released to the execution team once our internal QA team approves the final, flawless deliverable.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderLeft: "2px solid rgba(204,102,0,0.4)",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: "#FFFFFF",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.825rem",
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Footer CTA ── */}
      <footer
        id="contact"
        style={{
          position: "relative",
          backgroundColor: "var(--bg-primary)",
          padding: "10rem 2rem 6rem",
          textAlign: "center",
          color: "var(--text-primary)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <FooterBackground className="h-full" />
        </div>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-heading), sans-serif",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Stop guessing.
            <span style={{ color: "var(--accent-orange)" }}> Start knowing.</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "480px",
              margin: "0 auto 3rem",
            }}
          >
            Submit Chapter 1. We will tell you exactly what your research needs — at no charge.
          </p>

          <a
            href="mailto:submit@jaxisstatlab.com"
            id="footer-cta"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "14px 40px",
              border: "1px solid rgba(255,255,255,0.45)",
              background: "transparent",
              display: "inline-block",
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.background = "rgba(204,102,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Get My Free SOW Review
          </a>

          {/* Footer Nav */}
          <div
            style={{
              marginTop: "6rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image 
                src="/jaxislogo.png" 
                alt="JAXIS Logo" 
                width={18}
                height={18}
                style={{ height: "18px", width: "auto", opacity: 0.5 }} 
              />
              <span
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                }}
              >
                JAXIS StatLab
              </span>
            </div>
            {["Privacy Policy", "Terms of Service", "Academic Integrity Policy", "Enterprise API"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                  }}
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

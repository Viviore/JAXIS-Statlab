"use client";

import Image from "next/image";
import { Hero as FooterBackground } from "../ui/tailwind-css-background-snippet";

export default function FooterCTA() {
  return (
    <>
      {/* ── Security Shield Section ── */}
      <section
        id="security"
        style={{
          backgroundColor: "#F8FAFC",
          padding: "8rem 2rem",
          color: "#010114",
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
                  fontWeight: 600,
                }}
              >
                ADD-ON MODULE
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "1.25rem",
                  color: "#010114",
                }}
              >
                The DefenseLab Module
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.75,
                  color: "#475569",
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
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "12px 32px",
                  border: "1px solid #010114",
                  background: "#010114",
                  display: "inline-block",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-orange)";
                  e.currentTarget.style.background = "var(--accent-orange)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#010114";
                  e.currentTarget.style.background = "#010114";
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
                  fontWeight: 600,
                }}
              >
                SECURITY & INTEGRITY
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "1.75rem",
                  color: "#010114",
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
                      borderLeft: "2px solid var(--accent-orange)",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        color: "#010114",
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
                        color: "#64748B",
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
              color: "#FFFFFF",
            }}
          >
            Stop guessing.
            <span style={{ color: "var(--accent-orange)" }}> Start knowing.</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.6)",
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
              padding: "16px 44px",
              border: "1px solid rgba(255,255,255,0.45)",
              background: "transparent",
              display: "inline-block",
              transition: "border-color 0.2s ease, background 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.background = "rgba(204,102,0,0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            Get My Free SOW Review
          </a>

          {/* Footer Nav */}
          <div
            style={{
              marginTop: "6rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
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
                style={{ height: "18px", width: "auto", opacity: 0.6 }} 
              />
              <span
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  fontWeight: 600,
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
                    fontSize: "0.725rem",
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    fontWeight: 500,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
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

"use client";

import Image from "next/image";
import { Hero as FooterBackground } from "../ui/tailwind-css-background-snippet";

export default function FooterCTA() {
  return (
    <footer
      id="contact"
      style={{
        position: "relative",
        backgroundColor: "#010114",
        padding: "10rem 2rem 6rem",
        textAlign: "center",
        color: "#FFFFFF",
        overflow: "hidden",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <FooterBackground className="h-full" />
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: "#CC6600",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "1.25rem",
            fontWeight: 600,
          }}
        >
          <span style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#CC6600" }} />
          GET YOUR FREE STATISTICAL CONSULTATION
        </span>

        <h2
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            marginBottom: "1.5rem",
            color: "#FFFFFF",
          }}
        >
          Stop worrying about defense.
          <br />
          <span style={{ color: "#38bdf8", fontWeight: 400 }}> Start feeling confident.</span>
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.95rem",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.75)",
            maxWidth: "480px",
            margin: "0 auto 3rem",
          }}
        >
          Send us your Chapter 1 or raw survey spreadsheet. Our senior statisticians will review your study and give you an exact, custom Scope of Work quote within 24 hours at zero charge.
        </p>

        <a
          href="mailto:submit@jaxisstatlab.com"
          id="footer-cta"
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            textDecoration: "none",
            padding: "16px 44px",
            border: "1px solid rgba(255,255,255,0.45)",
            background: "transparent",
            display: "inline-block",
            borderRadius: 0,
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
          Get Free Thesis Review
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Image
              src="/jaxislogo.png"
              alt="JAXIS Logo"
              width={18}
              height={18}
              style={{ height: "18px", width: "auto", opacity: 0.8 }}
            />
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.60)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              JAXIS StatLab
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms of Service", "RULE_ETH_01 Anti-P-Hacking", "Escrow & QA Gate"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.725rem",
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    fontWeight: 500,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#38bdf8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                  }}
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

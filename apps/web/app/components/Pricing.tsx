"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import PixelCard from "./PixelCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PACKAGES = [
  {
    name: "DataCheck",
    catalog: "JX-01 // DIAGNOSTIC",
    price: "1,000",
    desc: "Essential automated diagnostics to ensure your data is ready for human analysis.",
    features: [
      "Automated Data Cleaning & Scrubber",
      "Normality & Outlier Identification",
      <span key="1" className="jargon-tooltip" data-tooltip="Measures internal consistency of surveys. Required for valid results.">Scale Reliability (Cronbach&apos;s Alpha)</span>,
      "The JAXIS \"Readiness Report\""
    ],
    highlighted: false,
    isPerVar: false
  },
  {
    name: "Start Package",
    catalog: "JX-02 // BASELINE",
    price: "1,500 – 1,800",
    desc: "Ideal for demographic profiling and baseline survey summaries.",
    features: [
      "Descriptive Statistics & Frequencies",
      <span key="2" className="jargon-tooltip" data-tooltip="Examines the relationship between two categorical variables.">Cross-tabulations</span>,
      <span key="3" className="jargon-tooltip" data-tooltip="Ready-to-paste tables formatted exactly to American Psychological Association standards.">Full APA 7th Ed. Table Generation</span>,
      "Plain-English Narrative Translation"
    ],
    highlighted: false,
    isPerVar: false
  },
  {
    name: "Core Package ★",
    catalog: "JX-03 // INFERENTIAL",
    price: "1,800 – 3,000",
    desc: "The standard analytical requirement for Undergraduate, Master's and Ph.D. dissertations.",
    features: [
      "Standard Inferential Tests (T-Tests, ANOVA, Regression)",
      "Assumption Checks & Effect Sizes",
      "Full JAXIS 4-Part Narrative Report",
      "Tier 2 Human QA (Senior Expert Review)"
    ],
    highlighted: true,
    isPerVar: false
  },
  {
    name: "Advanced Package",
    catalog: "JX-04 // COMPLEX",
    price: "3,000+",
    desc: "Complex modeling executed by elite Senior Methodologists.",
    features: [
      <span key="4" className="jargon-tooltip" data-tooltip="Structural Equation Modeling and other advanced techniques for complex variable relationships.">Advanced Modeling (SEM, Factor Analysis, Time-Series)</span>,
      "Custom Methodological Consultation",
      "Priority Tier 2 QA Routing"
    ],
    highlighted: false,
    isPerVar: false
  },
];

const CONSULTING = {
  name: "DefenseLab Module",
  desc: "Live 1-on-1 mock panel defense with a JAXIS senior statistician. We grill you on your methodology so you're ready for the real thing.",
  price: "₱250/hr"
};

const ADDITIONS = [
  {
    name: "JAXIS Rush",
    desc: "3-day turnaround upgrade",
    price: "₱300"
  },
  {
    name: "JAXIS Express",
    desc: "48-hour turnaround upgrade",
    price: "₱600"
  },
  {
    name: "JAXIS Emergency",
    desc: "24-hour turnaround upgrade",
    price: "₱1,000"
  }
];

/** Zero-padded index for brutalist data-density markers */
function padIndex(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Header Timeline ──────────────────────────────
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.pricing-title-area',
          start: "top 85%",
          once: true,
        }
      });

      // Kicker: clipPath wipe left→right
      headerTl.fromTo('.pricing-kicker',
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Heading lines: slide in from opposite directions
      headerTl.fromTo('.pricing-heading-line:first-child',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        "-=0.1"
      );

      headerTl.fromTo('.pricing-heading-line:last-child',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        "-=0.15"
      );

      // Paragraph fade up
      headerTl.fromTo('.pricing-title-area p',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        "-=0.1"
      );

      // ── 2. Pricing Cards: clipPath wipe from bottom ─────
      gsap.fromTo('.pricing-card',
        { clipPath: "inset(100% 0 0 0)", y: 15 },
        {
          clipPath: "inset(0% 0 0 0)",
          y: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.packages-grid',
            start: "top 85%",
            once: true,
          }
        }
      );

      // Featured card: orange glow pulse after cards are revealed
      gsap.fromTo('.pricing-card.featured',
        { boxShadow: "inset 0 0 0 0 rgba(204,102,0,0)" },
        {
          boxShadow: "inset 0 0 40px 0 rgba(204,102,0,0.08)",
          duration: 0.6,
          ease: "power1.inOut",
          delay: 0.4,
          scrollTrigger: {
            trigger: '.packages-grid',
            start: "top 85%",
            once: true,
          }
        }
      );

      // ── 3. Offerings Area ───────────────────────────────

      // ── 3. Offerings Area ───────────────────────────────

      // Offering cards: batch reveal with scale pop
      ScrollTrigger.batch('.offering-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 10, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.25, stagger: 0.04, ease: "power2.out" }
          );
        },
        start: "top 90%",
        once: true,
      });

      // System status footer
      gsap.fromTo('.pricing-sys-status',
        { opacity: 0 },
        {
          opacity: 0.5,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.pricing-sys-status',
            start: "top 95%",
            once: true,
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const featuredPkg = PACKAGES.find(p => p.highlighted)!;
  const regularPkgs = PACKAGES.filter(p => !p.highlighted);

  return (
    <section id="pricing" className="pricing-section" ref={sectionRef}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        
        {/* Header Block */}
        <div className="pricing-title-area mb-12 max-w-2xl" style={{ willChange: "opacity, transform" }}>
          <span className="pricing-kicker" style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "var(--accent-orange)", textTransform: "uppercase", display: "block", marginBottom: "1rem" }}>
            FIXED PRICING. ZERO SURPRISES.
          </span>
          <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            <span className="pricing-heading-line block text-white">Transparent Pricing.</span>
            <span className="pricing-heading-line block" style={{ color: "var(--text-muted-light)" }}>Complete Deliverables.</span>
          </h2>
          <p className="mt-6" style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(255,255,255,0.6)", maxWidth: "45ch" }}>
            Every package includes raw output, assumption checks,
            statistical interpretation, and APA 7th Edition tables.
            No hourly billing. No scope creep.
          </p>
        </div>
        
        {/* Packages 2x2 Grid */}
        <div className="packages-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem", marginBottom: "4rem" }}>
          {PACKAGES.map((pkg, idx) => (
            <PixelCard
              key={idx}
              variant="jaxis"
              className={`pricing-card ${pkg.highlighted ? "featured" : ""}`}
              style={{ willChange: "clip-path, transform", display: "flex", flexDirection: "column", height: "100%" }}
            >
              {pkg.highlighted && <div className="pricing-card-scanline" />}
              <span className="pricing-card-index">{padIndex(idx + 1)}</span>
              <div style={{ flex: 1 }}>
                <span className="pricing-card-catalog">{pkg.catalog}</span>
                {pkg.highlighted && <span className="pricing-card-tag">[ RECOMMENDED_PLAN ]</span>}
                <h3 className="pricing-card-name">{pkg.name}</h3>
                <p className="pricing-card-desc">{pkg.desc}</p>
                <div className="pricing-card-price-container">
                  <span className="pricing-card-price">
                    <span className="price-currency">₱</span>{pkg.price}
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
              <a href="#contact" className="pricing-card-cta" style={{ marginTop: "2rem" }}>
                Initialize Intake
              </a>
            </PixelCard>
          ))}
        </div>

        {/* Offerings Area (Upgrades & Consulting) */}
        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "3rem", marginTop: "3rem" }}>
          <h3 className="offering-card text-white text-xl font-light tracking-wide mb-8 opacity-0" style={{ willChange: "opacity, transform", marginBottom: "2rem" }}>
            Turnaround Upgrades & Add-ons
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
              <PixelCard variant="jaxis" className="offering-card featured-consulting" style={{ padding: "2rem", minHeight: "auto", willChange: "opacity, transform" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
                  <div>
                    <h4 style={{ color: "var(--accent-orange)", fontSize: "1.25rem", fontWeight: 400 }}>{CONSULTING.name}</h4>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginTop: "0.75rem", lineHeight: 1.6 }}>{CONSULTING.desc}</p>
                  </div>
                  <span style={{ fontSize: "1.75rem", fontWeight: 300, color: "#FFF", marginTop: "auto" }}>{CONSULTING.price}</span>
                </div>
              </PixelCard>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {ADDITIONS.map((add, idx) => (
                  <PixelCard key={idx} variant="jaxis" className="offering-card" style={{ padding: "1.5rem", minHeight: "auto", willChange: "opacity, transform", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div>
                      <h4 style={{ color: "#FFF", fontSize: "1rem", fontWeight: 400 }}>{add.name}</h4>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{add.desc}</p>
                    </div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 300, color: "var(--accent-orange)", whiteSpace: "nowrap" }}>{add.price}</span>
                  </PixelCard>
                ))}
              </div>
          </div>
        </div>
        
        {/* System Status Footer */}
        <p className="pricing-sys-status text-[0.65rem] text-[rgba(255,255,255,0.3)] tracking-[0.1em] font-mono mt-16 pt-8 border-t border-[var(--border-glass)]">
          SYS // ALL_PRICES_IN_PHP // LAST_UPDATED 2025 // JAXIS_STATLAB_V2
        </p>

      </div>
    </section>
  );
}

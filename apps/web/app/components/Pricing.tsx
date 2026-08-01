"use client";

import React from "react";
import PixelCard from "./PixelCard";

const PACKAGES = [
  {
    name: "DataCheck",
    catalog: "JX-01 // DIAGNOSTIC",
    price: "1,000",
    desc: "Essential automated diagnostics to ensure your data is ready for human analysis.",
    features: [
      "Automated Data Cleaning & Scrubber",
      "Normality & Outlier Identification",
      "Scale Reliability (Cronbach's Alpha)",
      "The JAXIS \"Readiness Report\""
    ],
    highlighted: false
  },
  {
    name: "Start Package",
    catalog: "JX-02 // BASELINE",
    price: "1,500 – 1,800",
    desc: "Ideal for demographic profiling and baseline survey summaries.",
    features: [
      "Descriptive Statistics & Frequencies",
      "Cross-tabulations",
      "Full APA 7th Ed. Table Generation",
      "Plain-English Narrative Translation"
    ],
    highlighted: false
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
    highlighted: true
  },
  {
    name: "Advanced Package",
    catalog: "JX-04 // COMPLEX",
    price: "3,000+",
    desc: "Complex modeling executed by elite Senior Methodologists.",
    features: [
      "Advanced Modeling (SEM, Factor Analysis, Time-Series)",
      "Custom Methodological Consultation",
      "Priority Tier 2 QA Routing"
    ],
    highlighted: false
  },
];

const ADDITIONS = [
  {
    name: "DefenseLab Module",
    desc: "Live 1-on-1 mock panel defense with a JAXIS senior statistician. We grill you on your methodology so you're ready for the real thing.",
    price: "₱250/hr"
  },
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

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Block */}
        <div className="pricing-title-area scroll-fade-up active">
          <span className="pricing-kicker">FIXED PRICING. ZERO SURPRISES.</span>
          <h2>Transparent Pricing.<br />Complete Deliverables.</h2>
          <p>
            Every package includes raw output, assumption checks,
            statistical interpretation, and APA 7th Edition tables.
            No hourly billing. No scope creep.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="pricing-grid scroll-fade-up active">
          {PACKAGES.map((pkg, idx) => (
            <PixelCard 
              key={idx} 
              variant="jaxis"
              className={`pricing-card ${pkg.highlighted ? "featured" : ""}`}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div>
                {/* Catalog Indexer */}
                <span className="pricing-card-catalog">{pkg.catalog}</span>
                
                {/* Featured Highlight Tag */}
                {pkg.highlighted && (
                  <span className="pricing-card-tag">[ RECOMMENDED_PLAN ]</span>
                )}
                
                {/* Plan Name */}
                <h3 className="pricing-card-name">{pkg.name}</h3>
                
                {/* Brief description */}
                <p className="pricing-card-desc">{pkg.desc}</p>
                
                {/* Price block */}
                <div className="pricing-card-price-container">
                  <span className="pricing-card-price">₱{pkg.price}</span>
                  <span className="pricing-card-price-suffix">
                    {pkg.isPerVar ? "PHP // PER_VAR" : "PHP // FIXED"}
                  </span>
                </div>
                
                {/* Feature List */}
                <ul className="pricing-card-list">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="pricing-card-list-item">
                      <span className="pricing-card-bullet">[✓]</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Trigger */}
              <a href="#contact" className="pricing-card-cta">
                Initialize Intake
              </a>
            </PixelCard>
          ))}
        </div>

        {/* Additional Offerings Panel */}
        <div className="offerings-area scroll-fade-up active">
          <div className="offerings-header">
            <h3>Additional Turnaround Offerings</h3>
            <p>Availability of rush services varies depending on the nature and complexity of your project.</p>
          </div>

          <div className="offerings-grid">
            {ADDITIONS.map((add, idx) => (
              <PixelCard key={idx} variant="jaxis" className="offering-card">
                <div className="offering-info">
                  <h4>{add.name}</h4>
                  <p>{add.desc}</p>
                </div>
                <span className="offering-price">{add.price}</span>
              </PixelCard>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

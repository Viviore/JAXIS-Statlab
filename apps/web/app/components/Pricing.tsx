"use client";

import React from "react";
import PixelCard from "./PixelCard";

const PACKAGES = [
  {
    name: "JAXIS Start",
    catalog: "JX-01 // BASELINE",
    price: "1,200",
    desc: "Descriptive statistics summary for baseline validation.",
    features: [
      "Descriptive statistics only",
      "Basic interpretation (1-2 sentences per table)",
      "No statistical test included",
      "3-day chat support",
      "Certificate included"
    ],
    highlighted: false
  },
  {
    name: "JAXIS Essential",
    catalog: "JX-02 // SINGLE_TEST",
    price: "1,500",
    desc: "Single-hypothesis testing and descriptive parameters.",
    features: [
      "1 Statistical test",
      "Includes descriptive statistics",
      "Statistical Interpretation",
      "5-min online consultation",
      "Certificate included"
    ],
    highlighted: false
  },
  {
    name: "JAXIS Complete ★",
    catalog: "JX-03 // DUAL_TEST",
    price: "1,800",
    desc: "Best-value package covering dual hypothesis analyses.",
    features: [
      "Up to 2 statistical tests",
      "Includes descriptive statistics",
      "Statistical Interpretation",
      "15-min online consultation",
      "Certificate included"
    ],
    highlighted: true
  },
  {
    name: "JAXIS Advanced",
    catalog: "JX-04 // MULTI_TEST",
    price: "2,000",
    desc: "Multi-group comparative study validation.",
    features: [
      "Up to 3 statistical tests",
      "Includes descriptive statistics",
      "Statistical Interpretation",
      "30-mins online consultation",
      "Certificate included"
    ],
    highlighted: false
  },
  {
    name: "JAXIS Premium",
    catalog: "JX-05 // COMPLEX_MODEL",
    price: "2,500",
    desc: "Complex statistical modeling and exploratory analysis.",
    features: [
      "Advanced/complex statistical models",
      "Includes descriptive statistics",
      "Item-total correlation + factor analysis",
      "Basic factor analysis (if applicable)",
      "Retention recommendations",
      "60-mins online consultation",
      "Certificate included"
    ],
    highlighted: false
  },
  {
    name: "JAXIS Validate",
    catalog: "JX-06 // PILOT_SCALABLE",
    price: "70",
    isPerVar: true,
    desc: "Scalable validation for pilot study instruments.",
    features: [
      "Pilot testing descriptive statistics",
      "Reliability test — Cronbach's Alpha",
      "Item-total correlation + factor analysis",
      "Basic factor analysis (if applicable)",
      "Retention recommendations",
      "3-day chat support + 5-min consultation",
      "Certificate included"
    ],
    highlighted: false
  }
];

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

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Block */}
        <div className="pricing-title-area scroll-fade-up active">
          <span className="pricing-kicker">Operational Costs</span>
          <h2>Service Packages</h2>
          <p>
            All statistical analysis usually takes 3-5 days and may take longer 
            depending on project complexity.
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

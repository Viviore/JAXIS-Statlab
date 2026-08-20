"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FAQ_DATA = [
  {
    index: "01",
    question: "How fast will I receive my analysis?",
    answer:
      "Standard thesis and survey packages (DataCheck, Start, Core) take 3 to 7 business days. Complex structural equation modeling (SEM) or medical dissertations take 2 to 3 weeks. If you are on a tight deadline, our 24-Hour and 48-Hour Rush delivery upgrades guarantee you submit on time.",
    category: "TIMELINE & TURNAROUND",
  },
  {
    index: "02",
    question: "What if my thesis adviser or panel asks for revisions?",
    answer:
      "Revisions are 100% free. If your panel, adviser, or committee asks for changes, clarifications, or alternate tables within your study's original scope, our senior statisticians will revise your deliverables promptly at zero additional cost.",
    category: "FREE REVISION GUARANTEE",
  },
  {
    index: "03",
    question: "Is my survey data and student identity kept confidential?",
    answer:
      "Yes, completely. We scrub all respondent names, emails, and student ID numbers from your files before our analysts ever see them. Every statistician operates under legally binding NDAs, and your research findings remain 100% your own intellectual property.",
    category: "PRIVACY & NDAS",
  },
  {
    index: "04",
    question: "What happens if my results are not statistically significant (p > .05)?",
    answer:
      "Non-significant results are a normal part of real academic research! We never fake data or manipulate numbers. Instead, we provide rigorous theoretical explanations and sample justifications so you can defend your findings to your panel with complete academic credibility.",
    category: "ETHICAL INTEGRITY & P-VALUES",
  },
  {
    index: "05",
    question: "I know nothing about statistics. How will I defend my numbers?",
    answer:
      "That is exactly why students choose JAXIS! You don't just get raw numbers — you receive a plain-English speaking script that explains what each table means in simple words, plus the exact answers to the top 20 questions your panel is likely to ask. You can also book our 1-on-1 mock defense session to practice.",
    category: "DEFENSE READINESS",
  },
  {
    index: "06",
    question: "What exact files will I receive upon delivery?",
    answer:
      "You receive: (1) Publication-ready APA 7th Edition tables ready to paste into Chapter 4, (2) A plain-English narrative report explaining your findings, (3) The cleaned dataset file (.sav / .csv), and (4) The full statistical software code (R, Python, or SPSS) so your study is 100% reproducible.",
    category: "DELIVERABLES & CODE",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-header",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".faq-header",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".faq-container",
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{
        position: "relative",
        backgroundColor: "#010114",
        padding: "6rem 2rem 8rem 2rem",
        color: "#FFFFFF",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        
        {/* Header Block */}
        <div
          className="faq-header"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "2.5rem",
            marginBottom: "3.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
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
              SECTION // 06 — FREQUENTLY ASKED QUESTIONS
            </span>
            <h2
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: 0,
                color: "#FFFFFF",
              }}
            >
              Clear Answers.
              <br />
              <span style={{ color: "#38bdf8", fontWeight: 400 }}>
                Zero Ambiguity.
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
                maxWidth: "420px",
              }}
            >
              Everything you need to know about our statistical protocols, turnaround times, academic revisions, and code deliverables.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Container */}
        <div className="faq-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="faq-item"
                style={{
                  border: isOpen
                    ? "1px solid rgba(56, 189, 248, 0.55)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 0,
                  backgroundColor: isOpen
                    ? "rgba(2, 16, 48, 0.95)"
                    : "rgba(2, 11, 34, 0.85)",
                  transition: "background 0.25s ease, border-color 0.25s ease",
                  position: "relative",
                }}
              >
                {/* Active Indicator Line */}
                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: "3px",
                      backgroundColor: "#CC6600",
                    }}
                  />
                )}

                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.5rem 1.75rem",
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.78rem",
                        color: isOpen ? "#CC6600" : "rgba(255, 255, 255, 0.40)",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      [{faq.index}]
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "1.08rem",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: isOpen ? "#FFFFFF" : "rgba(255, 255, 255, 0.90)",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "1.25rem",
                      color: isOpen ? "#CC6600" : "#38bdf8",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease, color 0.3s ease",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        padding: "0 1.75rem 1.5rem 3.5rem",
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        paddingTop: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono), monospace",
                          fontSize: "0.60rem",
                          color: "#38bdf8",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {"// "}{faq.category}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "var(--font-sans), sans-serif",
                          fontSize: "0.88rem",
                          lineHeight: 1.72,
                          color: "rgba(255, 255, 255, 0.72)",
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const FAQ_DATA = [
  {
    question: "What is your standard turnaround time?",
    answer: "Turnaround depends on project scope. Standard statistical modeling typically takes 3 to 7 business days, while full clinical trial analysis or comprehensive dissertation support may take 2 to 4 weeks. We establish strict timelines in the Statement of Work (SOW) before we begin."
  },
  {
    question: "Do you offer revisions if my committee has feedback?",
    answer: "Yes. Every engagement includes dedicated revision cycles as outlined in your SOW. If your academic panel or peer-reviewers request adjustments to the methodology or reporting, our team will execute those changes swiftly to ensure approval."
  },
  {
    question: "How do you handle data privacy and intellectual property?",
    answer: "All client data is scrubbed of Personally Identifiable Information (PII) before it enters our execution lab. Every JAXIS statistician operates under strict, binding Non-Disclosure Agreements (NDAs). Your research and findings remain entirely your intellectual property."
  },
  {
    question: "What happens if my results are not statistically significant?",
    answer: "We are committed to scientific truth. We do not manipulate data or engage in p-hacking to force significance. If your results are null, our statisticians will help you rigorously explain and defend the findings to your panel, providing robust methodological justification."
  },
  {
    question: "How does the payment and escrow system work?",
    answer: "To ensure mutual security, your payment is held in escrow upon signing the SOW. The funds are only released to our execution team once the final, flawless deliverable has passed our internal Senior QA check and is ready for you."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      style={{ 
        backgroundColor: "var(--bg-primary)", 
        padding: "10rem 2rem", 
        color: "var(--text-primary)" 
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "4rem", textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent-orange)",
              display: "block",
              marginBottom: "1rem",
            }}
          >
            KNOWLEDGE BASE
          </span>
          <h2
            style={{
              fontFamily: "var(--font-heading), sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0px",
                  overflow: "hidden",
                  backgroundColor: isOpen ? "rgba(255,255,255,0.02)" : "transparent",
                  transition: "background-color 0.3s ease",
                }}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.5rem",
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-heading), sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span style={{ color: isOpen ? "var(--accent-orange)" : "white", transition: "color 0.2s ease" }}>
                    {faq.question}
                  </span>
                  <span 
                    style={{ 
                      fontSize: "1.2rem", 
                      color: isOpen ? "var(--accent-orange)" : "rgba(255,255,255,0.3)",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease, color 0.3s ease",
                    }}
                  >
                    +
                  </span>
                </button>
                
                <div 
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <p
                      style={{
                        padding: "0 1.5rem 1.5rem",
                        margin: 0,
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {faq.answer}
                    </p>
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

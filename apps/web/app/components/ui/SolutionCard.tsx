"use client";

import React from "react";

export interface FeatureItem {
  tag: string;
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
}

export interface StackedCardData {
  id: string;
  step: string;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
  bgGradient?: string;
  tabBg?: string;
  borderColor?: string;
  pills: string[];
  features: FeatureItem[];
}

interface SolutionCardProps {
  card: StackedCardData;
  index: number;
  isLast?: boolean;
  topOffset?: string;
  isStaticLayout?: boolean;
}

export default function SolutionCard({
  card,
  index,
  isLast = false,
  topOffset,
  isStaticLayout = false,
}: SolutionCardProps) {
  const calculatedTop = topOffset ?? `calc(165px + ${index * 52}px)`;
  const borderColor = card.borderColor ?? "#CBD5E1";

  return (
    <div
      id={card.id}
      className="stacked-card-wrapper"
      style={{
        position: isStaticLayout ? "relative" : "sticky",
        top: isStaticLayout ? "auto" : calculatedTop,
        zIndex: index + 1,
        marginBottom: isStaticLayout ? 0 : isLast ? "3rem" : "18vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#FFFFFF",
        border: `1px solid ${borderColor}`,
        borderRadius: "0px", // Strict Modern Industrial Brutalist 90-degree corners
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* ── 52px Dedicated Header Tab Bar (Always visible in the stack) ── */}
      <div
        style={{
          height: "52px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1.5rem",
          background: card.tabBg ?? "#F8FAFC",
          borderBottom: `1px solid ${borderColor}`,
          userSelect: "none",
        }}
      >
        {/* Left: Terminal indicator + Protocol Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: card.accent,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              color: card.accent,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {card.badge}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "#64748B",
              letterSpacing: "0.08em",
              display: "inline-block",
            }}
          >
            // VERIFIED_PROTOCOL
          </span>
        </div>

        {/* Right: Technical Index Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              color: "#64748B",
              textTransform: "uppercase",
            }}
          >
            [ EXECUTION GATE ]
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: card.accent,
              background: "#FFFFFF",
              border: `1px solid ${borderColor}`,
              padding: "2px 8px",
              letterSpacing: "0.05em",
            }}
          >
            {card.step}
          </span>
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div style={{ padding: "clamp(1.5rem, 2.8vw, 2.25rem)", background: "#FFFFFF" }}>
        {/* Top Header Row with Title + Telemetry Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: "1 1 550px" }}>
            <h3
              style={{
                fontFamily: "var(--font-heading), sans-serif",
                fontSize: "clamp(1.4rem, 2.4vw, 1.95rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#010114",
                lineHeight: 1.2,
                marginBottom: "0.6rem",
              }}
            >
              {card.title}
            </h3>

            <p
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                color: "#475569",
                maxWidth: "840px",
                margin: 0,
              }}
            >
              {card.subtitle}
            </p>
          </div>

          {/* Telemetry Matrix Meta Readout (Industrial Brutalism) */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              padding: "0.6rem 1rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              color: "#010114",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              alignSelf: "flex-start",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem" }}>
              <span style={{ color: "#64748B" }}>ENGINE:</span>
              <span style={{ color: card.accent, fontWeight: 700 }}>R 4.4 / PYTHON 3.12</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem" }}>
              <span style={{ color: "#64748B" }}>SPEC:</span>
              <span style={{ fontWeight: 600 }}>APA 7.0 COMPLIANT</span>
            </div>
          </div>
        </div>

        {/* Tactical Check Pills (Industrial Monospace Tags) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {card.pills.map((pill, pIdx) => (
            <div
              key={pIdx}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                padding: "0.35rem 0.75rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "#010114",
                letterSpacing: "0.04em",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <span style={{ color: card.accent, fontWeight: 700 }}>[✓]</span>
              <span>{pill}</span>
            </div>
          ))}
        </div>

        {/* 4-Column Blueprint Feature Matrix Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1px",
            background: "#E2E8F0",
            border: "1px solid #E2E8F0",
          }}
        >
          {card.features.map((feat, fIdx) => (
            <div
              key={fIdx}
              style={{
                background: "#FFFFFF",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "155px",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.12em",
                    color: "#64748B",
                    textTransform: "uppercase",
                    marginBottom: "0.45rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>// {feat.tag}</span>
                  <span style={{ color: card.accent, fontWeight: 600 }}>[0{fIdx + 1}]</span>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-heading), sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#010114",
                    marginBottom: "0.4rem",
                    lineHeight: 1.3,
                  }}
                >
                  {feat.title}
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    color: "#475569",
                  }}
                >
                  {feat.desc}
                </div>
              </div>

              {/* Bottom Telemetry Metric Readout */}
              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "0.65rem",
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: card.accent,
                    letterSpacing: "0.02em",
                  }}
                >
                  {feat.metric}
                </span>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.08em",
                    color: "#64748B",
                    textTransform: "uppercase",
                  }}
                >
                  &lt; {feat.metricLabel} &gt;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

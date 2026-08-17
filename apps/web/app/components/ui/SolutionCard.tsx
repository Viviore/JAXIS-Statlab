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
  const cardBg = card.bgGradient ?? "#01162E";
  const tabBg = card.tabBg ?? "linear-gradient(90deg, rgba(1, 46, 87, 0.95) 0%, rgba(1, 20, 45, 0.98) 100%)";
  const borderColor = card.borderColor ?? "rgba(255, 255, 255, 0.16)";

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
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: "0px",
        overflow: "hidden",
        boxShadow: "0 -6px 20px rgba(0, 0, 0, 0.6), 0 30px 60px -15px rgba(0, 0, 0, 0.9)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* ── 50px Dedicated Header Tab Bar (Always visible in the stack) ── */}
      <div
        style={{
          height: "50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1.5rem",
          background: tabBg,
          borderBottom: `1px solid ${borderColor}`,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              background: card.accent,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              color: card.accent,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {card.badge}
          </span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: 600,
            color: card.accent,
            letterSpacing: "-0.02em",
          }}
        >
          {card.step}
        </div>
      </div>

      {/* ── Card Content Body (Cleanly covered by subsequent card tops) ── */}
      <div style={{ padding: "clamp(1.25rem, 2.8vw, 2rem)" }}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.35rem, 2.4vw, 1.85rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            lineHeight: 1.2,
            marginBottom: "0.6rem",
          }}
        >
          {card.title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            lineHeight: 1.55,
            color: "var(--text-secondary)",
            maxWidth: "860px",
            marginBottom: "1.25rem",
          }}
        >
          {card.subtitle}
        </p>

        {/* Tab Pills / Check Tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.45rem",
            marginBottom: "1.5rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {card.pills.map((pill, pIdx) => (
            <div
              key={pIdx}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "0.3rem 0.7rem",
                borderRadius: "0px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.725rem",
                color: "rgba(255, 255, 255, 0.9)",
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span style={{ color: card.accent }}>✓</span>
              <span>{pill}</span>
            </div>
          ))}
        </div>

        {/* 4-Column Feature Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.15rem",
          }}
        >
          {card.features.map((feat, fIdx) => (
            <div
              key={fIdx}
              style={{
                background: "rgba(1, 1, 20, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "0px",
                padding: "1.15rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "150px",
                transition: "all 0.25s ease",
              }}
              className="feature-card-hover"
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    marginBottom: "0.35rem",
                  }}
                >
                  {feat.tag}
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    marginBottom: "0.35rem",
                    lineHeight: 1.3,
                  }}
                >
                  {feat.title}
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    lineHeight: 1.45,
                    color: "var(--text-secondary)",
                  }}
                >
                  {feat.desc}
                </div>
              </div>

              {/* Bottom Metric Badge */}
              <div
                style={{
                  marginTop: "0.85rem",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#38bdf8",
                  }}
                >
                  {feat.metric}
                </span>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {feat.metricLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

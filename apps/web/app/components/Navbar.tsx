"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Our Approach", href: "#approach" },
  { label: "Solutions", href: "#solutions" },
  { label: "Packages", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      // Remove hash from URL on initial load so it doesn't auto-jump
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
    
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const solutionsEl = document.getElementById("solutions");
      if (solutionsEl) {
        const rect = solutionsEl.getBoundingClientRect();
        // The navbar is 64px tall. 
        // We consider it over the solutions section if the top of the section is <= 64, 
        // and the bottom of the section is >= 64.
        if (rect.top <= 64 && rect.bottom >= 64) {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount in case we start scrolled down
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.8s ease, border-color 0.8s ease",
        background: scrolled ? (theme === "light" ? "#F8F9FA" : "#010114") : "transparent",
        borderBottom: scrolled 
          ? (theme === "light" ? "1px solid rgba(1,1,20,0.06)" : "1px solid rgba(255,255,255,0.06)") 
          : "1px solid transparent",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: theme === "light" ? "#010114" : "#fff",
            transition: "color 0.8s ease",
          }}
          aria-label="JAXIS StatLab Home"
        >
          {/* Logo mark — angular accent */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "26px",
              height: "26px",
              background: "linear-gradient(135deg, #CC6600 0%, #FF8800 100%)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: theme === "light" ? "#010114" : "#FFFFFF",
              transition: "color 0.8s ease",
            }}
          >
            JAXIS <span style={{ color: "#CC6600" }}>StatLab</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="nav-links-desktop"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: theme === "light" ? "rgba(1,1,20,0.65)" : "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  transition: "color 0.8s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = theme === "light" ? "#010114" : "#FFFFFF")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = theme === "light" ? "rgba(1,1,20,0.65)" : "rgba(255,255,255,0.65)")
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <a
          href="#get-started"
          id="navbar-cta"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme === "light" ? "#010114" : "#FFFFFF",
            textDecoration: "none",
            padding: "8px 20px",
            border: `1px solid ${theme === "light" ? "rgba(1,1,20,0.45)" : "rgba(255,255,255,0.45)"}`,
            borderRadius: "2px",
            transition: "border-color 0.2s ease, background 0.2s ease, color 0.8s ease",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "#CC6600";
            el.style.background = "rgba(204,102,0,0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = theme === "light" ? "rgba(1,1,20,0.45)" : "rgba(255,255,255,0.45)";
            el.style.background = "transparent";
          }}
          className="nav-cta-desktop"
        >
          Get Started
        </a>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          aria-label="Toggle mobile menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: theme === "light" ? "#010114" : "#fff",
            transition: "color 0.8s ease",
          }}
          className="nav-hamburger"
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect y="0" width="22" height="1.5" fill="currentColor" />
            <rect y="7" width="22" height="1.5" fill="currentColor" />
            <rect y="14" width="22" height="1.5" fill="currentColor" />
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown — always rendered; transitions via max-height + opacity */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: menuOpen ? "320px" : "0px",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, background 0.8s ease",
          background: theme === "light" ? "#F8F9FA" : "#010114",
          borderTop: menuOpen 
            ? (theme === "light" ? "1px solid rgba(1,1,20,0.06)" : "1px solid rgba(255,255,255,0.06)") 
            : "1px solid transparent",
        }}
      >
        <div style={{ padding: "1.5rem 2rem" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: theme === "light" ? "rgba(1,1,20,0.7)" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "color 0.8s ease",
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: theme === "light" ? "#010114" : "#FFFFFF",
                  textDecoration: "none",
                  padding: "10px 20px",
                  border: `1px solid ${theme === "light" ? "rgba(1,1,20,0.4)" : "rgba(255,255,255,0.4)"}`,
                  borderRadius: "2px",
                  display: "inline-block",
                  transition: "color 0.8s ease, border-color 0.8s ease",
                }}
              >
                Get Started
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

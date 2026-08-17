"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Our Approach", href: "#approach" },
  { label: "Solutions", href: "#solutions" },
  { label: "Packages", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
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

      const whiteZone = document.getElementById("white-zone");
      if (whiteZone) {
        const rect = whiteZone.getBoundingClientRect();
        const isOver = rect.top <= 64 && rect.bottom >= 64;
        setIsLightMode(isOver);
      } else {
        setIsLightMode(false);
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
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
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
        background: !scrolled
          ? "transparent"
          : isLightMode
          ? "rgba(255, 255, 255, 0.75)"
          : "rgba(1, 1, 20, 0.65)",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: !scrolled
          ? "1px solid transparent"
          : isLightMode
          ? "1px solid rgba(0, 0, 0, 0.08)"
          : "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: scrolled
          ? isLightMode
            ? "0 4px 24px rgba(0, 0, 0, 0.06)"
            : "0 8px 32px rgba(0, 0, 0, 0.3)"
          : "none",
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
            color: isLightMode ? "#010114" : "#FFFFFF",
            transition: "color 0.3s ease",
          }}
          aria-label="JAXIS StatLab Home"
        >
          <Image 
            src="/jaxislogo.png" 
            alt="JAXIS Logo" 
            width={26}
            height={26}
            style={{ height: "26px", width: "auto" }} 
          />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isLightMode ? "#010114" : "#FFFFFF",
              transition: "color 0.3s ease",
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
                  color: isLightMode ? "rgba(1, 1, 20, 0.72)" : "rgba(255,255,255,0.68)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = isLightMode ? "#010114" : "#FFFFFF")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = isLightMode ? "rgba(1, 1, 20, 0.72)" : "rgba(255,255,255,0.68)")
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
            color: isLightMode ? "#010114" : "#FFFFFF",
            textDecoration: "none",
            padding: "8px 20px",
            border: isLightMode ? "1px solid rgba(1, 1, 20, 0.4)" : "1px solid rgba(255,255,255,0.45)",
            borderRadius: "2px",
            transition: "all 0.2s ease",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "#CC6600";
            el.style.background = isLightMode ? "rgba(204,102,0,0.12)" : "rgba(204,102,0,0.08)";
            el.style.color = "#CC6600";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = isLightMode ? "rgba(1, 1, 20, 0.4)" : "rgba(255,255,255,0.45)";
            el.style.background = "transparent";
            el.style.color = isLightMode ? "#010114" : "#FFFFFF";
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
            color: isLightMode ? "#010114" : "#fff",
            transition: "color 0.3s ease",
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
          transition: "max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease",
          background: "rgba(1, 1, 20, 0.95)",
          borderTop: menuOpen 
            ? "1px solid rgba(255,255,255,0.06)" 
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
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
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
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "10px 20px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "2px",
                  display: "inline-block",
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

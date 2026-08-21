"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { REGISTER_URL, LOGIN_URL } from "@/lib/config";

const NAV_LINKS = [
  { label: "Our Approach", href: "#approach" },
  { label: "Solutions", href: "#solutions" },
  { label: "Packages", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="main-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        backgroundColor: scrolled
          ? "rgba(1, 1, 20, 0.88)"
          : "rgba(1, 1, 20, 0.40)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(255, 255, 255, 0.10)"
          : "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <nav
        id="navbar"
        aria-label="Main navigation"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0.85rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          id="navbar-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#FFFFFF",
          }}
          aria-label="JAXIS StatLab Home"
        >
          <Image
            src="/jaxislogo.png"
            alt="JAXIS Logo"
            width={26}
            height={26}
            style={{ height: "26px", width: "auto" }}
            priority
          />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            JAXIS <span style={{ color: "#CC6600" }}>StatLab</span>
          </span>
        </Link>

        <ul
          id="navbar-nav-links"
          className="nav-links-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.70)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "#38bdf8")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color =
                    "rgba(255, 255, 255, 0.70)")
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          className="nav-cta-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <a
            href={LOGIN_URL}
            id="navbar-signin"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.70)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)";
            }}
          >
            Sign In
          </a>

          <a
            href={REGISTER_URL}
            id="navbar-cta"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "8px 20px",
              border: "1px solid rgba(255, 255, 255, 0.40)",
              borderRadius: "0px",
              transition: "all 0.2s ease",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "#CC6600";
              el.style.background = "rgba(204, 102, 0, 0.12)";
              el.style.color = "#CC6600";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(255, 255, 255, 0.40)";
              el.style.background = "transparent";
              el.style.color = "#FFFFFF";
            }}
          >
            Get Started
          </a>
        </div>

        <button
          id="mobile-menu-toggle"
          aria-label="Toggle mobile menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "#FFFFFF",
          }}
          className="nav-hamburger"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-drawer"
          style={{
            backgroundColor: "rgba(1, 1, 20, 0.98)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <a
              href={LOGIN_URL}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                padding: "10px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center",
              }}
            >
              Sign In
            </a>
            <a
              href={REGISTER_URL}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#CC6600",
                textDecoration: "none",
                padding: "12px",
                border: "1px solid #CC6600",
                textAlign: "center",
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

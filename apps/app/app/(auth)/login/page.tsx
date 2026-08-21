"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, Button, Skeleton } from "@repo/ui";

const DEV_PRESETS = [
  { label: "Admin", email: "admin@jaxis.dev", pass: "JaxisAdmin2026!", role: "ADMIN" },
  { label: "Client", email: "client@jaxis.dev", pass: "JaxisClient2026!", role: "CLIENT" },
  { label: "Stat", email: "stat@jaxis.dev", pass: "JaxisStat2026!", role: "STATISTICIAN" },
  { label: "QA Lead", email: "qa@jaxis.dev", pass: "JaxisQA2026!", role: "SENIOR_QA_LEAD" },
  { label: "Finance", email: "finance@jaxis.dev", pass: "JaxisFin2026!", role: "FINANCE_OFFICER" },
  { label: "CEO", email: "ceo@jaxis.dev", pass: "JaxisCeo2026!", role: "CEO" },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("admin@jaxis.dev");
  const [password, setPassword] = useState("JaxisAdmin2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeRole, setActiveRole] = useState("ADMIN");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectPreset = (preset: (typeof DEV_PRESETS)[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setActiveRole(preset.role);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (res?.error) {
          if (res.error.includes("ACCOUNT_SUSPENDED")) {
            setErrorMessage(
              "Your account has been suspended. Please contact JAXIS administration."
            );
          } else if (res.error.includes("ACCOUNT_TERMINATED")) {
            setErrorMessage(
              "This account has been permanently deactivated."
            );
          } else {
            setErrorMessage("Invalid email or password. Please verify credentials.");
          }
          return;
        }

        // Redirect to callbackUrl / authorized desk
        window.location.href = callbackUrl;
      } catch (err) {
        console.error("Login submission error:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full flex flex-col" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Title & Subtitle with Generous Vertical Margin */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="text-2xl sm:text-[1.875rem] font-bold text-white tracking-tight font-sans"
          style={{ fontSize: "1.875rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.625rem", lineHeight: 1.2 }}
        >
          Sign In
        </h1>
        <p
          className="text-sm text-slate-400 leading-relaxed font-sans"
          style={{ fontSize: "0.875rem", color: "#94A3B8", lineHeight: 1.5 }}
        >
          Enter your authorized credentials to access your stakeholder workbench.
        </p>
      </div>

      {/* Segmented Quick Role Selector */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div
          className="flex items-center justify-between font-mono uppercase tracking-wider"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.688rem",
            color: "#94A3B8",
            marginBottom: "0.625rem",
          }}
        >
          <span>Stakeholder Preset:</span>
          <span style={{ color: "#CC6600", fontWeight: 600 }}>1-Click Autoload</span>
        </div>
        <div
          className="grid grid-cols-3 gap-2 p-1.5 bg-[#01142B] border border-white/10 rounded-[2px]"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
            padding: "0.375rem",
            backgroundColor: "#01142B",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "2px",
          }}
        >
          {DEV_PRESETS.map((preset) => {
            const isSelected = activeRole === preset.role && email === preset.email;
            return (
              <Button
                key={preset.role}
                type="button"
                variant={isSelected ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleSelectPreset(preset)}
                className="w-full text-center"
                style={{
                  padding: "0.45rem 0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Clean Divider with generous vertical margins */}
      <div
        className="relative flex items-center justify-center"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1.75rem",
          marginBottom: "1.75rem",
        }}
      >
        <div
          className="absolute inset-0 flex items-center"
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}
        >
          <div
            className="w-full border-t border-white/[0.12]"
            style={{ width: "100%", borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}
          />
        </div>
        <span
          className="relative px-3.5 bg-[#010B18] text-[0.688rem] text-slate-400 font-mono uppercase tracking-wider"
          style={{
            position: "relative",
            paddingLeft: "0.875rem",
            paddingRight: "0.875rem",
            backgroundColor: "#010B18",
            color: "#94A3B8",
            fontSize: "0.688rem",
            letterSpacing: "0.1em",
          }}
        >
          or authenticate via email
        </span>
      </div>

      {/* Status Alerts */}
      {isRegistered && (
        <div style={{ marginBottom: "1.25rem" }}>
          <Alert variant="success" title="Account Created">
            Your account is ready. Sign in with your credentials.
          </Alert>
        </div>
      )}

      {errorMessage && (
        <div style={{ marginBottom: "1.25rem" }}>
          <Alert variant="danger" title="Authentication Error">
            {errorMessage}
          </Alert>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Email Field with explicit bottom spacer */}
        <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200"
            style={{ fontSize: "0.75rem", fontWeight: 600, color: "#E2E8F0" }}
          >
            Email Address <span style={{ color: "#CC6600" }}>*</span>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setActiveRole("");
            }}
            disabled={isPending}
            placeholder="admin@jaxis.dev"
            className="w-full rounded-[2px] bg-[#01142B] border border-white/15 focus:border-[#CC6600] focus:ring-1 focus:ring-[#CC6600]/40 text-sm text-white placeholder:text-slate-500 transition-all outline-none font-sans"
            style={{
              width: "100%",
              height: "3rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              backgroundColor: "#01142B",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "2px",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password Field with explicit bottom spacer */}
        <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            className="flex items-center justify-between"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <label
              className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200"
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "#E2E8F0" }}
            >
              Password <span style={{ color: "#CC6600" }}>*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[0.688rem] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              style={{ fontSize: "0.688rem", color: "#94A3B8", cursor: "pointer", background: "none", border: "none" }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setActiveRole("");
            }}
            disabled={isPending}
            placeholder="••••••••••••"
            className="w-full rounded-[2px] bg-[#01142B] border border-white/15 focus:border-[#CC6600] focus:ring-1 focus:ring-[#CC6600]/40 text-sm text-white placeholder:text-slate-500 transition-all outline-none font-sans"
            style={{
              width: "100%",
              height: "3rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              backgroundColor: "#01142B",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "2px",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Remember Session & Forgot Password with explicit bottom spacer */}
        <div
          className="flex items-center justify-between text-xs font-sans"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.25rem",
            marginBottom: "1.75rem",
          }}
        >
          <label
            className="flex items-center gap-2.5 cursor-pointer select-none text-slate-300 hover:text-white transition-colors"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-[2px] bg-[#011227] border border-white/20 text-[#CC6600] focus:ring-0 focus:ring-offset-0 accent-[#CC6600] cursor-pointer"
              style={{ height: "1rem", width: "1rem", accentColor: "#CC6600", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.813rem", color: "#CBD5E1" }}>Remember session</span>
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset is managed by JAXIS System Admin in development.");
            }}
            className="text-[#CC6600] hover:text-[#E67300] font-medium transition-colors cursor-pointer text-xs"
            style={{ color: "#CC6600", fontSize: "0.813rem", textDecoration: "none", fontWeight: 500 }}
          >
            Forgot password?
          </a>
        </div>

        {/* Reusable @repo/ui Button Component */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          disabled={isPending}
          className="w-full"
          style={{
            width: "100%",
            height: "3.25rem",
            minHeight: "3.25rem",
            marginBottom: "1.75rem",
          }}
        >
          SIGN IN TO WORKSPACE →
        </Button>
      </form>

      {/* Footer Registration Link */}
      <div
        className="text-center font-sans"
        style={{ textAlign: "center", fontSize: "0.813rem", color: "#94A3B8" }}
      >
        <span>New institutional researcher?</span>{" "}
        <Link
          href="/register"
          className="text-[#CC6600] hover:text-[#E67300] font-semibold transition-colors"
          style={{ color: "#CC6600", fontWeight: 600, marginLeft: "0.25rem", textDecoration: "none" }}
        >
          Create an account →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col gap-4">
          <Skeleton height="36px" width="160px" />
          <Skeleton height="18px" width="280px" />
          <Skeleton height="80px" width="100%" />
          <Skeleton height="44px" width="100%" />
          <Skeleton height="44px" width="100%" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

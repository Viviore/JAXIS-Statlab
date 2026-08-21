"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, Button, Skeleton, FormInput } from "@repo/ui";

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

  const handleSelectPreset = (roleValue: string) => {
    const preset = DEV_PRESETS.find((p) => p.role === roleValue);
    if (!preset) return;
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
    <div className="w-full flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
          Enter your authorized credentials to access your stakeholder workbench.
        </p>
      </div>

      {/* Status Alerts */}
      {isRegistered && (
        <Alert variant="success" title="Account Created">
          Your account is ready. Sign in with your credentials.
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" title="Authentication Error">
          {errorMessage}
        </Alert>
      )}

      {/* Stakeholder Preset Dropdown */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono uppercase tracking-wider text-xs">
          <span className="font-semibold text-slate-200">Stakeholder Preset:</span>
          <span className="text-[#CC6600] font-semibold">1-Click Autoload</span>
        </div>
        <div className="relative flex items-center w-full">
          <select
            value={activeRole}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="w-full h-12 px-4 pr-10 rounded-[2px] bg-[#01142B] border border-white/15 focus:border-[#CC6600] focus:ring-1 focus:ring-[#CC6600]/40 text-sm text-white transition-all outline-none font-sans appearance-none cursor-pointer"
            style={{
              height: "3rem",
              paddingLeft: "1rem",
              paddingRight: "2.5rem",
              boxSizing: "border-box",
            }}
          >
            {DEV_PRESETS.map((preset) => (
              <option
                key={preset.role}
                value={preset.role}
                className="bg-[#01142B] text-white py-2"
              >
                {preset.label} — {preset.email} ({preset.role})
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Clean Divider */}
      <div className="relative flex items-center justify-center -my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.12]" />
        </div>
        <span className="relative px-3.5 bg-[#010B18] text-[0.688rem] text-slate-400 font-mono uppercase tracking-wider">
          or authenticate via email
        </span>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          required
          monoLabel
          variant="auth"
          placeholder="admin@jaxis.dev"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setActiveRole("");
          }}
          disabled={isPending}
          autoComplete="email"
        />

        <FormInput
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          monoLabel
          variant="auth"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setActiveRole("");
          }}
          disabled={isPending}
          autoComplete="current-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[0.688rem] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          }
        />

        {/* Remember Session & Forgot Password */}
        <div className="flex items-center justify-between text-xs font-sans -mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-[2px] bg-[#011227] border border-white/20 text-[#CC6600] focus:ring-0 focus:ring-offset-0 accent-[#CC6600] cursor-pointer"
            />
            <span>Remember session</span>
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset is managed by JAXIS System Admin in development.");
            }}
            className="text-[#CC6600] hover:text-[#E67300] font-medium transition-colors cursor-pointer"
          >
            Forgot password?
          </a>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-3.5 font-bold tracking-[0.10em]"
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? "AUTHENTICATING..." : "SIGN IN TO WORKSPACE →"}
          </Button>
        </div>
      </form>

      {/* Footer Registration Link */}
      <div className="pt-2 text-center text-xs text-white/60 font-sans">
        <span>New institutional researcher?</span>{" "}
        <Link
          href="/register"
          className="text-[#CC6600] hover:text-[#E67300] font-semibold transition-colors ml-1"
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

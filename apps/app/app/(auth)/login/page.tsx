"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, FormInput, Button, Alert, Skeleton } from "@repo/ui";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
            setErrorMessage("Invalid email or password. Please try again.");
          }
          return;
        }

        // On successful authentication, redirect to callbackUrl / role desk
        window.location.href = callbackUrl;
      } catch (err) {
        console.error("Login submission error:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Card className="w-full">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-base font-semibold text-white tracking-wide">
          Sign In to Your Workspace
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Enter your authorized credentials to access your stakeholder desk.
        </p>
      </div>

      <div className="py-4 space-y-4">
        {isRegistered && (
          <Alert variant="success" title="Account Created Successfully">
            Your account is ready. Sign in with your registered email and password.
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="danger" title="Authentication Error">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Corporate or Client Email"
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            autoComplete="email"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={isPending}
              disabled={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
        <span>New client researcher?</span>
        <Link
          href="/register"
          className="text-[#CC6600] hover:text-[#E67300] font-medium transition-colors"
        >
          Create Account →
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#010114] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-[#CC6600] rounded-[2px] flex items-center justify-center font-mono font-bold text-white text-sm tracking-wider shadow-md group-hover:bg-[#E67300] transition-colors">
            JX
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-lg tracking-widest text-white">
              JAXIS
            </span>
            <span className="font-mono text-[0.625rem] text-white/40 tracking-widest uppercase">
              STATLAB DESK AUTH
            </span>
          </div>
        </Link>

        {/* Suspense-wrapped login form */}
        <Suspense fallback={<Skeleton height="320px" className="w-full" />}>
          <LoginForm />
        </Suspense>

        {/* Seed Info Hint for Development */}
        <div className="w-full p-3 rounded-[2px] bg-white/[0.03] border border-white/5 text-[0.688rem] text-white/40 font-mono space-y-1">
          <div className="text-white/60 font-semibold uppercase tracking-wider">
            Dev Quick Credentials:
          </div>
          <div className="flex justify-between">
            <span>Admin: admin@jaxis.dev</span>
            <span className="text-white/60">JaxisAdmin2026!</span>
          </div>
          <div className="flex justify-between">
            <span>Client: client@jaxis.dev</span>
            <span className="text-white/60">JaxisClient2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

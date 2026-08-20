"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, FormInput, Button, Alert } from "@repo/ui";
import { registerClient } from "@/features/auth/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick password match check
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ["Passwords do not match."] });
      return;
    }

    startTransition(async () => {
      const res = await registerClient({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (!res.success) {
        if (res.error?.code === "EMAIL_TAKEN") {
          setErrorMessage(res.error.message);
        } else if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        } else {
          setErrorMessage(res.error?.message || "Registration failed.");
        }
        return;
      }

      // Success -> Redirect to /login with success toast param
      router.push("/login?registered=true");
    });
  };

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
              CLIENT REGISTRATION
            </span>
          </div>
        </Link>

        {/* Register Card */}
        <Card className="w-full">
          <div className="pb-4 border-b border-white/10">
            <h1 className="text-base font-semibold text-white tracking-wide">
              Create Client Account
            </h1>
            <p className="text-xs text-white/60 mt-1">
              Register as a researcher or institutional client for statistical analysis services.
            </p>
          </div>

          <div className="py-4 space-y-4">
            {errorMessage && (
              <Alert variant="danger" title="Registration Error">
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name / Primary Investigator"
                name="fullName"
                type="text"
                required
                placeholder="Dr. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName?.[0]}
                disabled={isPending}
                autoComplete="name"
              />

              <FormInput
                label="Institutional or Personal Email"
                name="email"
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email?.[0]}
                disabled={isPending}
                autoComplete="email"
              />

              <FormInput
                label="Password (min. 8 characters)"
                name="password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password?.[0]}
                disabled={isPending}
                autoComplete="new-password"
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword?.[0]}
                disabled={isPending}
                autoComplete="new-password"
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
                  {isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <span>Already registered?</span>
            <Link
              href="/login"
              className="text-[#CC6600] hover:text-[#E67300] font-medium transition-colors"
            >
              Sign In Instead →
            </Link>
          </div>
        </Card>

        <span className="text-[0.625rem] font-mono text-white/30 tracking-wider uppercase">
          JAXIS STATLAB · CONFIDENTIAL & ENCRYPTED
        </span>
      </div>
    </div>
  );
}

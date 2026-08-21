"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Alert, FormInput } from "@repo/ui";
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

      router.push("/login?registered=true");
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
          Register as an institutional researcher or university client for statistical services.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="danger" title="Registration Error">
          {errorMessage}
        </Alert>
      )}

      {/* Registration Form with Reusable FormInput Components */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="Full Name / Primary Investigator"
          name="fullName"
          type="text"
          required
          monoLabel
          variant="auth"
          placeholder="Dr. Eleanor Vance"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName?.[0]}
          disabled={isPending}
          autoComplete="name"
        />

        <FormInput
          label="Institutional Email"
          name="email"
          type="email"
          required
          monoLabel
          variant="auth"
          placeholder="e.vance@university.edu"
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
          monoLabel
          variant="auth"
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
          monoLabel
          variant="auth"
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
            size="lg"
            className="w-full py-3.5 font-bold tracking-[0.10em]"
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? "REGISTERING ACCOUNT..." : "CREATE RESEARCHER ACCOUNT →"}
          </Button>
        </div>
      </form>

      {/* Footer Login Link */}
      <div className="pt-2 text-center text-xs text-white/60 font-sans">
        <span>Already have an account?</span>{" "}
        <Link
          href="/login"
          className="text-[#CC6600] hover:text-[#E67300] font-semibold transition-colors ml-1"
        >
          Sign In Instead →
        </Link>
      </div>
    </div>
  );
}

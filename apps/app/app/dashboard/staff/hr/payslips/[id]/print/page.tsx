"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LoadingState, Button, Alert } from "@repo/ui";
import { IconArrowLeft, IconPrinter } from "@tabler/icons-react";
import { getPayslipById } from "@/features/payroll/actions";
import type { StaffPayslipDTO } from "@/features/payroll/schemas";
import { OfficialPayslipDocument } from "@/features/payroll/components/OfficialPayslipDocument";
import Link from "next/link";

export default function StaffPayslipPrintPage() {
  const params = useParams();
  const payslipId = params.id as string;

  const [payslip, setPayslip] = useState<StaffPayslipDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getPayslipById(payslipId);
        if (!data) {
          setError("The requested official payslip voucher could not be located in internal records.");
        } else {
          setPayslip(data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load payslip voucher.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [payslipId]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full min-h-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState variant="page" label="Loading Official Payslip Document..." />
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center py-24 max-w-lg mx-auto">
        <Alert variant="danger">{error || "Document not found"}</Alert>
        <Link href="/dashboard/staff/hr" className="mt-4">
          <Button variant="secondary" size="md">
            ← Return to Staff HR Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 flex flex-col gap-6 animate-content-fade print:max-w-none print:w-full print:m-0 print:p-0 print:pb-0">
      {/* ── Top Floating Navigation Toolbar (Hidden in Print) ── */}
      <div className="w-full flex items-center justify-between print:hidden">
        <Link href="/dashboard/staff/hr">
          <Button variant="secondary" size="sm" className="gap-2 font-sans text-xs">
            <IconArrowLeft size={14} stroke={2} />
            <span>Return to Staff HR Portal</span>
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/50 hidden sm:inline-block">
            Document ID: {payslip.payslipNumber}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 font-sans font-semibold text-xs"
          >
            <IconPrinter size={15} stroke={2} />
            <span>Print Official Document / PDF</span>
          </Button>
        </div>
      </div>

      {/* ── Official Document Render ── */}
      <OfficialPayslipDocument payslip={payslip} showPrintToolbar={false} />
    </div>
  );
}

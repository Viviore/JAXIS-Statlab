"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@repo/ui";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import { saveStaffCompensationOverride, deleteStaffCompensationOverride } from "../actions";
import type { InternalStaffMember } from "../actions";
import type { CompensationType } from "../schemas";

interface SpecialistOverrideModalProps {
  staff: InternalStaffMember | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SpecialistOverrideModal({
  staff,
  open,
  onClose,
  onSuccess,
}: SpecialistOverrideModalProps) {
  const [compensationType, setCompensationType] = useState<CompensationType>("PERCENTAGE_PER_STUDY");
  const [baseSalary, setBaseSalary] = useState(0);
  const [commissionPct, setCommissionPct] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(450);
  const [fixedBonus, setFixedBonus] = useState(1000);
  const [allowances, setAllowances] = useState(2500);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (staff) {
      const cfg = staff.effectiveConfig;
      setCompensationType(cfg.compensationType);
      setBaseSalary(cfg.baseSalaryMonthly || 0);
      setCommissionPct(cfg.commissionPercentagePerStudy || 0);
      setHourlyRate(cfg.hourlyDutyRate || 0);
      setFixedBonus(cfg.fixedPerStudyBonus || 0);
      setAllowances(cfg.allowancesMonthly || 0);
      setNotes(cfg.notes || "");
    }
  }, [staff]);

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await saveStaffCompensationOverride({
        userId: staff.id,
        staffName: staff.fullName,
        staffEmail: staff.email,
        roleName: staff.role as "STATISTICIAN" | "SENIOR_QA_LEAD" | "FINANCE_OFFICER" | "ADMIN",
        compensationType,
        baseSalaryMonthly: Number(baseSalary),
        commissionPercentagePerStudy: Number(commissionPct),
        hourlyDutyRate: Number(hourlyRate),
        fixedPerStudyBonus: Number(fixedBonus),
        allowancesMonthly: Number(allowances),
        notes: notes.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error?.message || "Failed to save override.");
      }
    } catch {
      setErrorMsg("Network error occurred while updating compensation override.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm(`Revert ${staff.fullName} back to default ${staff.role} compensation policy?`)) return;
    setIsSubmitting(true);
    try {
      await deleteStaffCompensationOverride(staff.id);
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Individual Specialist Compensation Override"
      description={`Bespoke compensation agreement for ${staff.fullName} (${staff.role})`}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {staff.overrideConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                disabled={isSubmitting}
                className="text-red-400 border-red-500/30 hover:bg-red-950/40 text-xs"
              >
                Revert to Role Default
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px]"
            >
              {isSubmitting ? (
                <IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />
              ) : (
                <IconCheck size={16} stroke={2} />
              )}
              <span>Save Specialist Override</span>
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs text-white font-sans">
        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-[2px] text-red-300 font-mono text-xs">
            {errorMsg}
          </div>
        )}

        {/* Model Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase text-white/60 font-semibold">
            Compensation Model Structure
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "PERCENTAGE_PER_STUDY", label: "Study % Commission" },
              { id: "FIXED_SALARY", label: "Fixed Monthly Salary" },
              { id: "HOURLY_DUTY", label: "Hourly Attendance Wage" },
              { id: "HYBRID", label: "Hybrid (Base + Study %)" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCompensationType(item.id as CompensationType)}
                className={`p-2.5 rounded-[2px] border text-left font-sans text-xs cursor-pointer transition-colors ${
                  compensationType === item.id
                    ? "bg-[#CC6600]/15 border-[#CC6600] text-white font-bold"
                    : "bg-[#010D1F] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(compensationType === "FIXED_SALARY" || compensationType === "HYBRID") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-white/60 font-semibold">
                Base Monthly Salary (PHP)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
              />
            </div>
          )}

          {(compensationType === "PERCENTAGE_PER_STUDY" || compensationType === "HYBRID") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-white/60 font-semibold">
                Commission % Per Study
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Number(e.target.value))}
                  className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/50 font-mono">%</span>
              </div>
            </div>
          )}

          {(compensationType === "HOURLY_DUTY" || compensationType === "HYBRID" || compensationType === "PERCENTAGE_PER_STUDY") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-white/60 font-semibold">
                Hourly Duty Rate (PHP / hr)
              </label>
              <input
                type="number"
                step="25"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-white/60 font-semibold">
              Per-Study Fixed Bonus (PHP)
            </label>
            <input
              type="number"
              step="250"
              min="0"
              value={fixedBonus}
              onChange={(e) => setFixedBonus(Number(e.target.value))}
              className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-mono uppercase text-white/60 font-semibold">
              Monthly Connectivity &amp; Compute Allowances (PHP)
            </label>
            <input
              type="number"
              step="500"
              min="0"
              value={allowances}
              onChange={(e) => setAllowances(Number(e.target.value))}
              className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase text-white/60 font-semibold">
            Specialist Contract Justification / Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Senior PhD retention tier; elevated commission due to high-stakes biostatistical trial design."
            className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#CC6600]"
          />
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, FormInput, Button, FormSelect, Alert } from "@repo/ui";
import { upsertClientProfile } from "@/features/client-profile/actions";
import { ClientProfileFormData } from "@/features/client-profile/schemas";

const REGION_OPTIONS = [
  { value: "NORTH_AMERICA", label: "North America" },
  { value: "EUROPE", label: "Europe" },
  { value: "ASIA", label: "Asia" },
  { value: "OCEANIA", label: "Oceania" },
  { value: "OTHER", label: "Other" },
];

export default function ClientProfilePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClientProfileFormData>({
    institutionSchool: "",
    academicProgram: "",
    contactNumber: "",
    region: "NORTH_AMERICA",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await upsertClientProfile(formData);
      if (!res.success) {
        setFormError(res.error.message);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        return;
      }

      setSuccessMsg("Profile saved successfully.");
      // Redirect to main client dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 1500);
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title="Institutional & Academic Profile"
        description="Complete your institutional affiliation and contact details to unlock project intake capabilities and secure communications."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Profile" },
        ]}
      />

      {formError && <Alert variant="danger">{formError}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-white">Institutional Details</h2>
            <p className="text-xs text-white/50 mt-1">
              Used for formal statistical reports and secure deliverables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="University / Institution Name"
              required
              placeholder="e.g. Stanford University"
              value={formData.institutionSchool}
              onChange={(e) => setFormData({ ...formData, institutionSchool: e.target.value })}
              error={fieldErrors.institutionSchool?.[0]}
              disabled={isPending}
              monoLabel
            />

            <FormInput
              label="Academic Program / Department"
              required
              placeholder="e.g. Ph.D. in Organizational Psychology"
              value={formData.academicProgram}
              onChange={(e) => setFormData({ ...formData, academicProgram: e.target.value })}
              error={fieldErrors.academicProgram?.[0]}
              disabled={isPending}
              monoLabel
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            <FormInput
              label="Primary Contact Number"
              required
              placeholder="+1 (555) 000-0000"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              error={fieldErrors.contactNumber?.[0]}
              disabled={isPending}
              monoLabel
            />

            <FormSelect
              label="Geographic Region"
              required
              options={REGION_OPTIONS}
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              disabled={isPending}
              monoLabel
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-white/[0.08]">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="px-8 font-bold tracking-wider"
            >
              SAVE PROFILE →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

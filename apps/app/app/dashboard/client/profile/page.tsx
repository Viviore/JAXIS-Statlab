"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, FormInput, Button, FormSelect, FormFooter, Toast } from "@repo/ui";
import { upsertClientProfile, getClientProfile } from "@/features/client-profile/actions";
import { ClientProfileFormData } from "@/features/client-profile/schemas";

const REGION_OPTIONS = [
  { value: "NCR", label: "National Capital Region (NCR / Metro Manila)" },
  { value: "CAR", label: "Cordillera Administrative Region (CAR)" },
  { value: "REGION_1", label: "Region I – Ilocos Region" },
  { value: "REGION_2", label: "Region II – Cagayan Valley" },
  { value: "REGION_3", label: "Region III – Central Luzon" },
  { value: "REGION_4A", label: "Region IV-A – CALABARZON" },
  { value: "MIMAROPA", label: "MIMAROPA Region (Region IV-B)" },
  { value: "REGION_5", label: "Region V – Bicol Region" },
  { value: "REGION_6", label: "Region VI – Western Visayas" },
  { value: "REGION_7", label: "Region VII – Central Visayas" },
  { value: "REGION_8", label: "Region VIII – Eastern Visayas" },
  { value: "REGION_9", label: "Region IX – Zamboanga Peninsula" },
  { value: "REGION_10", label: "Region X – Northern Mindanao" },
  { value: "REGION_11", label: "Region XI – Davao Region" },
  { value: "REGION_12", label: "Region XII – SOCCSKSARGEN" },
  { value: "REGION_13", label: "Region XIII – Caraga" },
  { value: "BARMM", label: "BARMM – Bangsamoro Autonomous Region in Muslim Mindanao" },
];

function formatPhilippinePhoneNumber(value: string): string {
  // Strip non-digit characters except leading plus
  const raw = value.replace(/[^\d+]/g, "");

  // Handle +63 format
  if (raw.startsWith("+63")) {
    const digits = raw.slice(3).replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return `+63 ${digits}`;
    if (digits.length <= 6) return `+63 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Handle 63 format without plus
  if (raw.startsWith("63") && raw.length > 2) {
    const digits = raw.slice(2).replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return `+63 ${digits}`;
    if (digits.length <= 6) return `+63 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Handle standard 09XX format (11 digits: 09XX XXX XXXX)
  const digitsOnly = raw.replace(/\D/g, "").slice(0, 11);
  if (digitsOnly.startsWith("0")) {
    if (digitsOnly.length <= 4) return digitsOnly;
    if (digitsOnly.length <= 7) return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
    return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
  }

  // Handle raw 9XX format (auto-format as 09XX XXX XXXX)
  if (digitsOnly.startsWith("9")) {
    if (digitsOnly.length <= 3) return `0${digitsOnly}`;
    if (digitsOnly.length <= 6) return `0${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    return `0${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
  }

  return digitsOnly;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const [formData, setFormData] = useState<ClientProfileFormData>({
    institutionSchool: "",
    academicProgram: "",
    contactNumber: "",
    region: "NCR",
  });

  useEffect(() => {
    async function loadExisting() {
      const existing = await getClientProfile();
      if (existing) {
        setFormData({
          institutionSchool: existing.institutionSchool || "",
          academicProgram: existing.academicProgram || "",
          contactNumber: formatPhilippinePhoneNumber(existing.contactNumber || ""),
          region: existing.region || "NCR",
        });
      }
    }
    loadExisting();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const res = await upsertClientProfile(formData);
      if (!res.success) {
        const errorText = res.error.message || "Failed to update profile.";
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        setToastMessage({
          message: "Profile Update Failed",
          description: errorText,
          variant: "danger",
        });
        return;
      }

      setToastMessage({
        message: "Profile Saved Successfully",
        description: "Your institutional affiliation and contact details have been updated.",
        variant: "success",
      });

      // Redirect to main client dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 1200);
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title="Institutional & Academic Profile"
        description="Complete your institutional affiliation and contact details in the Philippines to unlock project intake capabilities and secure communications."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Profile" },
        ]}
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-white">Institutional Details (Philippines)</h2>
            <p className="text-xs text-white/50 mt-1">
              Used for formal statistical certifications, commission endorsements, and thesis data security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Institution / University"
              required
              placeholder="e.g. University of the Philippines"
              value={formData.institutionSchool}
              onChange={(e) => setFormData({ ...formData, institutionSchool: e.target.value })}
              error={fieldErrors.institutionSchool?.[0]}
              disabled={isPending}
              monoLabel
            />

            <FormInput
              label="Academic Program"
              required
              placeholder="e.g. MS in Data Science / Ph.D. in Education"
              value={formData.academicProgram}
              onChange={(e) => setFormData({ ...formData, academicProgram: e.target.value })}
              error={fieldErrors.academicProgram?.[0]}
              disabled={isPending}
              monoLabel
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            <FormInput
              label="Contact Number"
              required
              placeholder="0917 123 4567"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: formatPhilippinePhoneNumber(e.target.value) })}
              error={fieldErrors.contactNumber?.[0]}
              disabled={isPending}
              monoLabel
            />

            <FormSelect
              label="Region"
              required
              options={REGION_OPTIONS}
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              disabled={isPending}
              monoLabel
            />
          </div>

          <FormFooter className="mt-8 pt-6">
            <Link href="/dashboard/client">
              <Button type="button" variant="ghost" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              className="w-full sm:w-auto font-bold tracking-wider"
            >
              SAVE PROFILE →
            </Button>
          </FormFooter>
        </form>
      </Card>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

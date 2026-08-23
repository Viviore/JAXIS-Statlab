"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalFooter, Button, Toast } from "@repo/ui";
import {
  IconSend,
  IconAlertTriangle,
  IconShieldCheck,
  IconSchool,
  IconBolt,
  IconFlame,
  IconSparkles,
} from "@tabler/icons-react";
import {
  PACKAGES_CATALOG,
  ADDONS_CATALOG,
  UPFRONT_PACKAGES,
  calculateQuotationTotals,
  validatePackageBasePrice,
  type PackageDefinition,
  type AddOnDefinition,
  type CommercialCatalogData,
} from "@/lib/pricing-rules";
import {
  createQuotation,
  updateQuotation,
  issueQuotation,
} from "@/features/quotations/actions";
import type { QuotationDetailItem } from "@/features/quotations/schemas";
import type { PackageName, AddOnName } from "@prisma/client";

interface QuotationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectIntakeId?: string;
  projectTitle?: string;
  clientName?: string;
  existingQuotation?: QuotationDetailItem | null;
  customCatalog?: CommercialCatalogData;
  onSuccess?: () => void;
}

export function QuotationBuilderModal({
  isOpen,
  onClose,
  projectId,
  projectIntakeId,
  projectTitle,
  clientName,
  existingQuotation,
  customCatalog,
  onSuccess,
}: QuotationBuilderModalProps) {
  const packagesCatalog: Record<string, PackageDefinition> =
    customCatalog?.packages || PACKAGES_CATALOG;
  const addOnsCatalog: Record<string, AddOnDefinition> =
    customCatalog?.addOns || ADDONS_CATALOG;

  const [selectedPackage, setSelectedPackage] = useState<PackageName>("JX_03_CORE");
  const [basePrice, setBasePrice] = useState<number>(2500);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, { selected: boolean; amount: number }>>({
    DEFENSELAB: { selected: false, amount: 250 },
    RUSH: { selected: false, amount: 300 },
    EXPRESS: { selected: false, amount: 600 },
    EMERGENCY: { selected: false, amount: 1000 },
  });
  const [customDownpayment, setCustomDownpayment] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [expiresInDays, setExpiresInDays] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIssuingDirect, setIsIssuingDirect] = useState(false);
  const [confirmIssueModalOpen, setConfirmIssueModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  // Initialize or reset form based on existing quotation and catalog
  useEffect(() => {
    const initialAddOns: Record<string, { selected: boolean; amount: number }> = {};
    Object.keys(addOnsCatalog).forEach((k) => {
      const item = addOnsCatalog[k];
      if (item) {
        initialAddOns[k] = { selected: false, amount: item.defaultPrice };
      }
    });

    if (existingQuotation) {
      setSelectedPackage(existingQuotation.packageName);
      setBasePrice(existingQuotation.basePrice);
      setNotes(existingQuotation.notes || "");

      existingQuotation.lineItems.forEach((li) => {
        if (li.itemType === "ADDON" && li.itemName in initialAddOns) {
          initialAddOns[li.itemName] = {
            selected: true,
            amount: li.amount,
          };
        }
      });

      setSelectedAddOns(initialAddOns);
      if (!existingQuotation.isUpfrontEnforced && existingQuotation.downpaymentRequired) {
        setCustomDownpayment(String(existingQuotation.downpaymentRequired));
      } else {
        setCustomDownpayment("");
      }
    } else {
      const defaultPkg = packagesCatalog.JX_03_CORE || Object.values(packagesCatalog)[0];
      setSelectedPackage((defaultPkg?.code as PackageName) || "JX_03_CORE");
      setBasePrice(defaultPkg?.defaultPrice || 2500);
      setSelectedAddOns(initialAddOns);
      setNotes("");
      setCustomDownpayment("");
      setExpiresInDays(3);
    }
  }, [existingQuotation, isOpen, customCatalog, addOnsCatalog, packagesCatalog]);

  // Handle package change
  const handleSelectPackage = (pkg: PackageName) => {
    setSelectedPackage(pkg);
    const def = packagesCatalog[pkg];
    if (def) {
      setBasePrice(def.defaultPrice);
    }
    if (UPFRONT_PACKAGES.includes(pkg)) {
      setCustomDownpayment("");
    }
  };

  // Toggle add-on
  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) => {
      const current = prev[name];
      if (!current) return prev;
      return {
        ...prev,
        [name]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  };

  // Active add-ons list for computation
  const activeAddOnsList = useMemo(() => {
    return Object.keys(selectedAddOns)
      .filter((k) => selectedAddOns[k]?.selected)
      .map((k) => ({
        name: k as AddOnName,
        amount: selectedAddOns[k]?.amount || 0,
      }));
  }, [selectedAddOns]);

  // Live calculation breakdown
  const breakdown = useMemo(() => {
    const customDp = customDownpayment ? Number(customDownpayment) : undefined;
    try {
      return calculateQuotationTotals({
        packageName: selectedPackage,
        basePrice,
        addOns: activeAddOnsList,
        customDownpayment: customDp,
      });
    } catch {
      return null;
    }
  }, [selectedPackage, basePrice, activeAddOnsList, customDownpayment]);

  // Validation
  const priceValidation = useMemo(() => {
    return validatePackageBasePrice(selectedPackage, basePrice);
  }, [selectedPackage, basePrice]);

  const currentPkgDef: PackageDefinition =
    packagesCatalog[selectedPackage] || PACKAGES_CATALOG.JX_03_CORE;

  // Save Draft action
  const handleSaveDraft = async () => {
    if (!priceValidation.valid) {
      setToastMessage({
        message: "Invalid Price",
        description: priceValidation.error || "Please adjust base price.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (existingQuotation && existingQuotation.status === "DRAFT") {
        res = await updateQuotation({
          quotationId: existingQuotation.id,
          packageName: selectedPackage,
          basePrice,
          addOns: activeAddOnsList,
          customDownpayment: customDownpayment ? Number(customDownpayment) : undefined,
          notes,
          expiresInDays,
        });
      } else {
        res = await createQuotation({
          projectId,
          packageName: selectedPackage,
          basePrice,
          addOns: activeAddOnsList,
          customDownpayment: customDownpayment ? Number(customDownpayment) : undefined,
          notes,
          expiresInDays,
        });
      }

      if (res.success) {
        setToastMessage({
          message: "Quote Draft Saved",
          description: `Quote draft for ${projectIntakeId || "Study"} saved successfully.`,
          variant: "success",
        });
        onSuccess?.();
        setTimeout(() => onClose(), 500);
      } else {
        setToastMessage({
          message: "Save Failed",
          description: res.error?.message || "Failed to save quotation.",
          variant: "danger",
        });
      }
    } catch {
      setToastMessage({
        message: "System Error",
        description: "An unexpected error occurred.",
        variant: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Issue directly to client
  const handleConfirmIssue = async () => {
    if (!priceValidation.valid) {
      setToastMessage({
        message: "Invalid Price",
        description: priceValidation.error || "Please adjust base price.",
        variant: "warning",
      });
      return;
    }

    setIsIssuingDirect(true);
    try {
      let targetQuoteId = existingQuotation?.id;

      if (!targetQuoteId || existingQuotation?.status !== "DRAFT") {
        const createRes = await createQuotation({
          projectId,
          packageName: selectedPackage,
          basePrice,
          addOns: activeAddOnsList,
          customDownpayment: customDownpayment ? Number(customDownpayment) : undefined,
          notes,
          expiresInDays,
        });

        if (!createRes.success || !createRes.data) {
          throw new Error(createRes.error?.message || "Failed to initialize quote draft.");
        }
        targetQuoteId = createRes.data.id;
      } else {
        const updateRes = await updateQuotation({
          quotationId: targetQuoteId,
          packageName: selectedPackage,
          basePrice,
          addOns: activeAddOnsList,
          customDownpayment: customDownpayment ? Number(customDownpayment) : undefined,
          notes,
          expiresInDays,
        });

        if (!updateRes.success) {
          throw new Error(updateRes.error?.message || "Failed to update quotation.");
        }
      }

      const issueRes = await issueQuotation({
        quotationId: targetQuoteId,
        expiresInDays,
        notes,
      });

      if (issueRes.success) {
        setToastMessage({
          message: "Proposal Issued to Client",
          description: `Quote issued to ${clientName || "Lead Researcher"}.`,
          variant: "success",
        });
        setConfirmIssueModalOpen(false);
        onSuccess?.();
        setTimeout(() => onClose(), 600);
      } else {
        setToastMessage({
          message: "Issuance Failed",
          description: issueRes.error?.message || "Failed to issue quote.",
          variant: "danger",
        });
      }
    } catch (err: unknown) {
      setToastMessage({
        message: "Issuance Error",
        description: (err as Error).message || "Failed to issue quotation.",
        variant: "danger",
      });
    } finally {
      setIsIssuingDirect(false);
    }
  };

  const getAddOnIcon = (name: string) => {
    switch (name) {
      case "DEFENSELAB":
        return <IconSchool size={18} stroke={1.5} className="text-sky-400 flex-shrink-0" />;
      case "RUSH":
        return <IconBolt size={18} stroke={1.5} className="text-amber-400 flex-shrink-0" />;
      case "EXPRESS":
        return <IconFlame size={18} stroke={1.5} className="text-orange-400 flex-shrink-0" />;
      case "EMERGENCY":
        return <IconAlertTriangle size={18} stroke={1.5} className="text-rose-400 flex-shrink-0" />;
      default:
        return <IconSparkles size={18} stroke={1.5} className="text-amber-400 flex-shrink-0" />;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Commercial Proposal Builder · ${projectIntakeId || "Research Study"}`}
        size="4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch py-4 px-6">
          {/* ── Left Column: Configuration Controls (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-7 justify-between">
            {/* 1. Analytical Package Tier Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  1. Select Analytical Tier
                </label>
                <span className="text-xs font-mono text-[#FFA040] font-bold">
                  Active: {currentPkgDef.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {(Object.keys(packagesCatalog) as PackageName[])
                  .filter((pkgKey) => packagesCatalog[pkgKey]?.isActive !== false)
                  .map((pkgKey) => {
                    const pkg = packagesCatalog[pkgKey];
                    if (!pkg) return null;
                    const isSelected = selectedPackage === pkgKey;

                    return (
                      <button
                        key={pkgKey}
                        type="button"
                        onClick={() => handleSelectPackage(pkgKey)}
                        className={`w-full p-4 rounded-[4px] text-left transition-all border flex flex-col justify-between cursor-pointer min-h-[105px] ${
                          isSelected
                            ? "bg-[#CC6600]/15 border-[#CC6600] ring-1 ring-[#CC6600] shadow-lg shadow-[#CC6600]/5"
                            : "bg-[#010D1F] border-white/[0.08] hover:border-white/20 hover:bg-[#01142B]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-xs font-mono font-bold text-[#FFA040]">
                              {pkg.id}
                            </span>
                            <span className="text-[0.625rem] font-sans font-medium text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-[2px] border border-white/[0.06]">
                              {pkg.badge}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-white line-clamp-1 leading-snug">
                            {pkg.name}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">
                            {pkg.maxPrice === null
                              ? `₱${pkg.minPrice.toLocaleString()}+`
                              : pkg.minPrice === pkg.maxPrice
                              ? `₱${pkg.minPrice.toLocaleString()}`
                              : `₱${pkg.minPrice.toLocaleString()} – ₱${pkg.maxPrice.toLocaleString()}`}
                          </span>
                          <span className="text-[0.625rem] font-sans text-white/40">
                            {pkg.isUpfront ? "100% Upfront" : "50% Milestone"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 2. Base Package Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  2. Base Package Price
                </label>
                <span className="text-xs font-mono text-white/50 bg-white/[0.04] px-2.5 py-1 rounded-[2px] border border-white/[0.06]">
                  Allowed: ₱{currentPkgDef.minPrice.toLocaleString()}
                  {currentPkgDef.maxPrice !== null ? ` – ₱${currentPkgDef.maxPrice.toLocaleString()}` : "+"}
                </span>
              </div>

              {/* Clean structured input group with dedicated currency prefix */}
              <div className="flex items-center rounded-[4px] border border-white/[0.14] bg-[#010114] focus-within:border-[#CC6600] focus-within:ring-1 focus-within:ring-[#CC6600]/50 transition-all overflow-hidden h-12">
                <div
                  className="h-full flex items-center bg-white/[0.05] border-r border-white/[0.10] text-[#FF9433] font-mono text-xs font-bold select-none whitespace-nowrap"
                  style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
                >
                  PHP ₱
                </div>
                <input
                  type="number"
                  min={currentPkgDef.minPrice}
                  max={currentPkgDef.maxPrice || undefined}
                  step="50"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  style={{
                    paddingLeft: "1.25rem",
                    paddingRight: "1.25rem",
                    MozAppearance: "textfield",
                    appearance: "textfield",
                  }}
                  className="flex-1 h-full bg-transparent text-lg font-mono font-bold text-white focus:outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {!priceValidation.valid && (
                <div className="text-xs font-sans text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <IconAlertTriangle size={14} stroke={1.5} />
                  <span>{priceValidation.error}</span>
                </div>
              )}
            </div>

            {/* 3. Priority Add-Ons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  3. Optional Priority Add-Ons
                </label>
                <span className="text-xs font-mono text-[#FFA040] font-bold">
                  {activeAddOnsList.length > 0 ? `${activeAddOnsList.length} Active` : "None Selected"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {Object.keys(addOnsCatalog)
                  .filter((addonKey) => addOnsCatalog[addonKey]?.isActive !== false)
                  .map((addonKey) => {
                    const addon = addOnsCatalog[addonKey];
                    if (!addon) return null;
                    const isChecked = selectedAddOns[addonKey]?.selected;

                    return (
                      <button
                        key={addonKey}
                        type="button"
                        onClick={() => toggleAddOn(addonKey)}
                        className={`w-full p-3 px-3.5 rounded-[4px] text-left transition-all border flex flex-col justify-between cursor-pointer min-h-[64px] group ${
                          isChecked
                            ? "bg-[#CC6600]/15 border-[#CC6600] ring-1 ring-[#CC6600] shadow-lg shadow-[#CC6600]/5"
                            : "bg-[#010D1F] border-white/[0.08] hover:border-white/20 hover:bg-[#01142B]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getAddOnIcon(addonKey)}
                            <span className="text-xs font-semibold text-white truncate leading-tight">
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#FFA040] flex-shrink-0">
                            +₱{addon.defaultPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 w-full">
                          <span className="text-[0.625rem] font-mono font-medium text-white/50 bg-white/[0.04] px-1.5 py-0.5 rounded-[2px] border border-white/[0.06] uppercase tracking-wider truncate">
                            {addon.badge}
                          </span>
                          <span
                            className={`font-mono text-[0.625rem] uppercase px-2 py-0.5 rounded-[2px] font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                              isChecked
                                ? "bg-[#CC6600] text-white border border-[#CC6600]"
                                : "bg-white/[0.04] text-white/40 group-hover:text-white/70 border border-white/[0.06]"
                            }`}
                          >
                            {isChecked ? "✓ Added" : "+ Add"}
                          </span>
                        </div>
                      </button>
                    );
                })}
              </div>
            </div>

            {/* 4. Notes & Validity */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    4. Scope Clarifications
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Include full Chapter 4 write-up and SPSS scripts..."
                    style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
                    className="w-full h-11 bg-[#010D1F] border border-white/[0.12] focus:border-[#CC6600] rounded-[4px] text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    Validity Window
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    style={{ paddingLeft: "1.25rem", paddingRight: "2rem" }}
                    className="w-full h-11 bg-[#010D1F] border border-white/[0.12] focus:border-[#CC6600] rounded-[4px] text-xs font-mono text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value={3}>3 Days (Standard Policy)</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Modern Live Summary Card (5 cols) ── */}
          <div className="lg:col-span-5 p-7 rounded-[4px] bg-[#01142B] border border-white/[0.12] flex flex-col justify-between shadow-2xl space-y-6 h-full min-h-[580px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                  <IconShieldCheck size={18} stroke={1.5} className="text-emerald-400" />
                  <span>Quotation Overview</span>
                </span>
                <span className="text-xs font-sans px-2.5 py-1 rounded-[2px] bg-white/[0.06] text-white/70 border border-white/[0.08]">
                  {breakdown?.isUpfrontEnforced ? "100% Upfront" : "50% Milestone"}
                </span>
              </div>

              {/* Study Info */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-[#FFA040] font-bold tracking-wide">
                  {projectIntakeId || "JAXIS-STUDY"}
                </div>
                <div className="text-sm font-semibold text-white leading-snug" title={projectTitle}>
                  {projectTitle || "Research Study"}
                </div>
                {clientName && (
                  <div className="text-xs text-white/50">
                    Lead Researcher: {clientName}
                  </div>
                )}
              </div>

              {/* Itemized Line Items */}
              <div className="p-4 rounded-[4px] bg-[#010D1F] border border-white/[0.06] space-y-3 text-xs">
                <div className="flex justify-between items-center text-white/80">
                  <span className="truncate pr-2 font-medium">{currentPkgDef.name}</span>
                  <span className="font-mono font-semibold text-white">₱{breakdown?.basePrice.toLocaleString()}</span>
                </div>

                {activeAddOnsList.map((addon) => (
                  <div key={addon.name} className="flex justify-between items-center text-amber-300 text-xs">
                    <span className="truncate pr-2">+ {ADDONS_CATALOG[addon.name].name}</span>
                    <span className="font-mono font-semibold">₱{addon.amount}</span>
                  </div>
                ))}
              </div>

              {/* Totals Telemetry */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/60">Total Contract Sum</span>
                  <span className="text-2xl font-mono font-bold text-[#38BDF8]">
                    ₱{breakdown?.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/60">Downpayment Due</span>
                  <span className="text-base font-mono font-bold text-emerald-400">
                    ₱{breakdown?.downpaymentRequired.toLocaleString()}
                    <span className="text-xs text-emerald-300/70 font-normal ml-1.5 font-sans">
                      ({breakdown?.downpaymentPercentage}%)
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-white/40 pt-3 border-t border-white/[0.06]">
                  <span>Quote Validity</span>
                  <span className="text-white/80 font-medium">{expiresInDays} Days</span>
                </div>
              </div>
            </div>

            {/* Actions Block */}
            <div className="space-y-3 pt-6 border-t border-white/[0.10]">
              <button
                type="button"
                onClick={() => setConfirmIssueModalOpen(true)}
                disabled={isSubmitting || isIssuingDirect || !priceValidation.valid}
                className="w-full h-12 rounded-[4px] bg-[#CC6600] hover:bg-[#E67300] active:bg-[#B35900] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#CC6600]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <IconSend size={16} stroke={2} />
                <span>Issue Quote to Client →</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isIssuingDirect || !priceValidation.valid}
                  className="w-full h-10 rounded-[4px] bg-[#012E57] hover:bg-[#013D73] border border-[#38BDF8]/30 hover:border-[#38BDF8]/60 text-white font-mono font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <span>{isSubmitting ? "Saving..." : "Save Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting || isIssuingDirect}
                  className="w-full h-10 rounded-[4px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] hover:border-white/25 text-white/70 hover:text-white font-mono font-semibold text-xs uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmIssueModalOpen}
        onClose={() => setConfirmIssueModalOpen(false)}
        title="Confirm Quotation Issuance"
        size="md"
      >
        <div className="space-y-4 text-xs font-sans text-white/80">
          <p className="leading-relaxed">
            You are about to issue a formal commercial quote of{" "}
            <strong className="text-[#38BDF8] font-mono font-bold">
              ₱{breakdown?.totalAmount.toLocaleString()}
            </strong>{" "}
            for study <span className="font-mono text-white">{projectIntakeId}</span>.
          </p>

          <div className="p-4 rounded-[4px] bg-[#010D1F] border border-white/[0.08] space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50 font-sans">Package:</span>
              <span className="text-white font-bold">{currentPkgDef.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 font-sans">Total Sum:</span>
              <span className="text-[#38BDF8] font-bold">₱{breakdown?.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 font-sans">Required Downpayment:</span>
              <span className="text-emerald-400 font-bold">
                ₱{breakdown?.downpaymentRequired.toLocaleString()} ({breakdown?.downpaymentPercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 font-sans">Validity Window:</span>
              <span className="text-amber-300 font-bold">{expiresInDays} Days</span>
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmIssueModalOpen(false)}
              disabled={isIssuingDirect}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmIssue}
              disabled={isIssuingDirect}
              className="gap-1.5 bg-[#CC6600] text-white hover:bg-[#E67300]"
            >
              <IconSend size={14} stroke={1.5} />
              <span>{isIssuingDirect ? "Issuing..." : "Confirm & Send Quote"}</span>
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}

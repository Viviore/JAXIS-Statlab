"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@repo/ui";
import {
  IconPackage,
  IconBolt,
  IconPlus,
  IconRotateClockwise,
  IconDeviceFloppy,
  IconX,
  IconInfoCircle,
  IconSchool,
  IconFlame,
  IconAlertTriangle,
  IconSparkles,
} from "@tabler/icons-react";
import {
  type CommercialCatalogData,
  type PackageDefinition,
  type AddOnDefinition,
} from "@/lib/pricing-rules";
import { saveCommercialCatalog, resetCommercialCatalog } from "../actions";

interface ServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCatalog: CommercialCatalogData;
  onSaveSuccess: (updated: CommercialCatalogData) => void;
}

export function ServiceCatalogModal({
  isOpen,
  onClose,
  initialCatalog,
  onSaveSuccess,
}: ServiceCatalogModalProps) {
  const [activeTab, setActiveTab] = useState<"packages" | "addons">("packages");
  const [catalog, setCatalog] = useState<CommercialCatalogData>(initialCatalog);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New package draft state
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPkgCode, setNewPkgCode] = useState("");
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgBadge, setNewPkgBadge] = useState("");
  const [newPkgMinPrice, setNewPkgMinPrice] = useState<number>(2000);
  const [newPkgMaxPrice, setNewPkgMaxPrice] = useState<number | null>(3500);
  const [newPkgDefaultPrice, setNewPkgDefaultPrice] = useState<number>(2500);
  const [newPkgIsUpfront, setNewPkgIsUpfront] = useState(false);
  const [newPkgTagline, setNewPkgTagline] = useState("");
  const [newPkgDeliverables, setNewPkgDeliverables] = useState<string>("");

  // New add-on draft state
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [newAddonCode, setNewAddonCode] = useState("");
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonBadge, setNewAddonBadge] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState<number>(350);
  const [newAddonTagline, setNewAddonTagline] = useState("");

  useEffect(() => {
    setCatalog(initialCatalog);
  }, [initialCatalog, isOpen]);

  // Package field updates
  const handleUpdatePackagePrice = (
    key: string,
    field: "minPrice" | "maxPrice" | "defaultPrice",
    val: number | null
  ) => {
    setCatalog((prev) => {
      const currentPkg = prev.packages[key];
      if (!currentPkg) return prev;
      return {
        ...prev,
        packages: {
          ...prev.packages,
          [key]: {
            ...currentPkg,
            [field]: val,
          },
        },
      };
    });
  };

  const handleTogglePackageActive = (key: string) => {
    setCatalog((prev) => {
      const current = prev.packages[key];
      if (!current) return prev;
      const nextActive = current.isActive === undefined ? false : !current.isActive;
      return {
        ...prev,
        packages: {
          ...prev.packages,
          [key]: {
            ...current,
            isActive: nextActive,
          },
        },
      };
    });
  };

  const handleUpdateAddonPrice = (key: string, price: number) => {
    setCatalog((prev) => {
      const currentAddon = prev.addOns[key];
      if (!currentAddon) return prev;
      return {
        ...prev,
        addOns: {
          ...prev.addOns,
          [key]: {
            ...currentAddon,
            defaultPrice: price,
          },
        },
      };
    });
  };

  const handleToggleAddonActive = (key: string) => {
    setCatalog((prev) => {
      const current = prev.addOns[key];
      if (!current) return prev;
      const nextActive = current.isActive === undefined ? false : !current.isActive;
      return {
        ...prev,
        addOns: {
          ...prev.addOns,
          [key]: {
            ...current,
            isActive: nextActive,
          },
        },
      };
    });
  };

  // Add new package
  const handleCreatePackage = () => {
    if (!newPkgCode.trim() || !newPkgName.trim()) {
      setErrorMsg("Package code and name are required.");
      return;
    }
    const formattedCode = newPkgCode.trim().toUpperCase().replace(/\s+/g, "_");
    const deliverablesArr = newPkgDeliverables
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newPkg: PackageDefinition = {
      code: formattedCode,
      id: formattedCode.replace(/_/g, "-"),
      name: newPkgName.trim(),
      badge: (newPkgBadge.trim() || "SPECIALIZED").toUpperCase(),
      minPrice: Number(newPkgMinPrice) || 1000,
      maxPrice: newPkgMaxPrice ? Number(newPkgMaxPrice) : null,
      defaultPrice: Number(newPkgDefaultPrice) || 2000,
      isUpfront: newPkgIsUpfront,
      tagline: newPkgTagline.trim() || "Specialized statistical analysis tier.",
      deliverables: deliverablesArr.length > 0 ? deliverablesArr : ["Standard statistical findings report"],
      recommendedFor: "Custom research requirements",
      isActive: true,
    };

    setCatalog((prev) => ({
      ...prev,
      packages: {
        ...prev.packages,
        [formattedCode]: newPkg,
      },
    }));

    // Reset form
    setIsAddingPackage(false);
    setNewPkgCode("");
    setNewPkgName("");
    setNewPkgBadge("");
    setNewPkgTagline("");
    setNewPkgDeliverables("");
    setErrorMsg(null);
  };

  // Add new addon
  const handleCreateAddon = () => {
    if (!newAddonCode.trim() || !newAddonName.trim()) {
      setErrorMsg("Add-on code and name are required.");
      return;
    }
    const formattedCode = newAddonCode.trim().toUpperCase().replace(/\s+/g, "_");

    const newAddon: AddOnDefinition = {
      code: formattedCode,
      name: newAddonName.trim(),
      defaultPrice: Number(newAddonPrice) || 250,
      tagline: newAddonTagline.trim() || "Priority statistical rider.",
      badge: (newAddonBadge.trim() || "PRIORITY").toUpperCase(),
      isActive: true,
    };

    setCatalog((prev) => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [formattedCode]: newAddon,
      },
    }));

    // Reset form
    setIsAddingAddon(false);
    setNewAddonCode("");
    setNewAddonName("");
    setNewAddonBadge("");
    setNewAddonTagline("");
    setErrorMsg(null);
  };

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveCommercialCatalog(catalog);
      if (res.success && res.data) {
        onSaveSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.error?.message || "Failed to save commercial catalog.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving catalog.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all packages and add-ons to factory defaults?")) {
      return;
    }
    setIsResetting(true);
    setErrorMsg(null);
    try {
      const res = await resetCommercialCatalog();
      if (res.success && res.data) {
        setCatalog(res.data);
        onSaveSuccess(res.data);
      } else {
        setErrorMsg(res.error?.message || "Failed to reset catalog.");
      }
    } catch {
      setErrorMsg("Failed to reset catalog.");
    } finally {
      setIsResetting(false);
    }
  };

  const getAddonIcon = (key: string) => {
    switch (key) {
      case "DEFENSELAB":
        return <IconSchool size={16} stroke={1.5} className="text-sky-400 flex-shrink-0" />;
      case "RUSH":
        return <IconBolt size={16} stroke={1.5} className="text-amber-400 flex-shrink-0" />;
      case "EXPRESS":
        return <IconFlame size={16} stroke={1.5} className="text-orange-400 flex-shrink-0" />;
      case "EMERGENCY":
        return <IconAlertTriangle size={16} stroke={1.5} className="text-rose-400 flex-shrink-0" />;
      default:
        return <IconSparkles size={16} stroke={1.5} className="text-amber-400 flex-shrink-0" />;
    }
  };

  const packageKeys = Object.keys(catalog.packages);
  const addonKeys = Object.keys(catalog.addOns);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commercial Service Catalog & Pricing Governance"
      size="xl"
    >
      <div className="flex flex-col gap-5 text-white font-sans">
        {/* Sleek Segmented Tab Switcher + Action Header */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
          {/* Segmented Tabs */}
          <div className="flex items-center p-1 rounded-[4px] bg-[#010D1F] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("packages");
                setErrorMsg(null);
              }}
              className={`px-3.5 py-1.5 rounded-[3px] font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "packages"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <IconPackage size={14} stroke={1.5} />
              <span>Service Packages ({packageKeys.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("addons");
                setErrorMsg(null);
              }}
              className={`px-3.5 py-1.5 rounded-[3px] font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "addons"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <IconBolt size={14} stroke={1.5} />
              <span>Priority Add-Ons ({addonKeys.length})</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "packages") {
                setIsAddingPackage((prev) => !prev);
              } else {
                setIsAddingAddon((prev) => !prev);
              }
            }}
            className="px-3 py-1.5 rounded-[3px] bg-[#011B38] hover:bg-[#012E57] border border-[#38BDF8]/40 text-xs font-mono font-semibold text-[#38BDF8] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <IconPlus size={14} stroke={2} />
            <span>
              {activeTab === "packages"
                ? (isAddingPackage ? "Close Form" : "+ Add Service Package")
                : (isAddingAddon ? "Close Form" : "+ Add Priority Rider")}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-[4px] bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
            <IconInfoCircle size={16} stroke={1.5} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Tab 1: Service Packages ── */}
        {activeTab === "packages" && (
          <div className="flex flex-col gap-4">
            {/* Add New Package Drawer */}
            {isAddingPackage && (
              <div className="p-4 rounded-[4px] bg-[#01142B] border border-[#38BDF8]/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    New Commercial Service Package
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPackage(false)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    <IconX size={16} stroke={1.5} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Code (e.g. JX_05)</label>
                    <input
                      type="text"
                      placeholder="JX_05_META"
                      value={newPkgCode}
                      onChange={(e) => setNewPkgCode(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white uppercase focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Package Name</label>
                    <input
                      type="text"
                      placeholder="JX-05 Meta-Analysis Suite"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs text-white focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Category Badge</label>
                    <input
                      type="text"
                      placeholder="SYNTHESIS"
                      value={newPkgBadge}
                      onChange={(e) => setNewPkgBadge(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white uppercase focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Min Price (₱)</label>
                    <input
                      type="number"
                      value={newPkgMinPrice}
                      onChange={(e) => setNewPkgMinPrice(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white [appearance:textfield] focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Max Price (₱ or null)</label>
                    <input
                      type="number"
                      placeholder="None"
                      value={newPkgMaxPrice || ""}
                      onChange={(e) => setNewPkgMaxPrice(e.target.value ? Number(e.target.value) : null)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white [appearance:textfield] focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Default Price (₱)</label>
                    <input
                      type="number"
                      value={newPkgDefaultPrice}
                      onChange={(e) => setNewPkgDefaultPrice(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white [appearance:textfield] focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Payment Rule</label>
                    <select
                      value={newPkgIsUpfront ? "upfront" : "milestone"}
                      onChange={(e) => setNewPkgIsUpfront(e.target.value === "upfront")}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white focus:border-[#CC6600] focus:outline-none"
                    >
                      <option value="milestone">50% Milestone</option>
                      <option value="upfront">100% Upfront</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Scope Tagline</label>
                  <input
                    type="text"
                    placeholder="Brief methodology summary..."
                    value={newPkgTagline}
                    onChange={(e) => setNewPkgTagline(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs text-white focus:border-[#CC6600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Deliverables (1 per line)</label>
                  <textarea
                    rows={2}
                    placeholder="Effect size forest plots&#10;Publication-grade APA 7th write-up"
                    value={newPkgDeliverables}
                    onChange={(e) => setNewPkgDeliverables(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs text-white focus:border-[#CC6600] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPackage(false)}
                    className="px-3 py-1.5 rounded-[3px] bg-white/[0.06] hover:bg-white/[0.10] text-xs font-mono text-white/70 uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePackage}
                    className="px-4 py-1.5 rounded-[3px] bg-[#CC6600] hover:bg-[#E67300] text-xs font-mono font-bold text-white uppercase tracking-wider cursor-pointer"
                  >
                    Save New Package
                  </button>
                </div>
              </div>
            )}

            {/* 2-Column Responsive Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {packageKeys.map((key) => {
                const pkg = catalog.packages[key];
                if (!pkg) return null;
                const isActive = pkg.isActive !== false;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-[4px] border transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-[#010D1F] border-white/[0.08] hover:border-white/20"
                        : "bg-[#010D1F]/40 border-white/[0.04] opacity-50"
                    }`}
                  >
                    <div>
                      {/* Header Row: ID + Badge + Payment Rule + Active Toggle */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#FFA040]">
                            {pkg.id || pkg.code}
                          </span>
                          <span className="text-[0.625rem] font-sans font-medium text-white/50 bg-white/[0.04] px-1.5 py-0.5 rounded-[2px] border border-white/[0.06] uppercase tracking-wider">
                            {pkg.badge}
                          </span>
                          <span
                            className={`text-[0.625rem] font-mono px-1.5 py-0.5 rounded-[2px] border uppercase font-medium ${
                              pkg.isUpfront
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                                : "bg-sky-500/10 text-sky-300 border-sky-500/25"
                            }`}
                          >
                            {pkg.isUpfront ? "100% Upfront" : "50% Milestone"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTogglePackageActive(key)}
                          className={`px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border flex-shrink-0 ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/70"
                          }`}
                        >
                          {isActive ? "✓ Active" : "Disabled"}
                        </button>
                      </div>

                      {/* Package Name */}
                      <div className="text-xs font-semibold text-white line-clamp-1 leading-snug">
                        {pkg.name}
                      </div>

                      {/* Tagline */}
                      <p className="text-[0.6875rem] text-white/50 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {pkg.tagline}
                      </p>
                    </div>

                    {/* Pricing Guardrails Controller */}
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-[0.625rem] font-mono text-white/40 uppercase tracking-wider">
                        <span>Allowed Range (Min – Max)</span>
                        <span className="text-[#FFA040]/80">Default Starting</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                        <div className="flex items-center rounded-[3px] bg-[#01142B] border border-white/[0.10] px-2 py-1 focus-within:border-[#CC6600]">
                          <span className="text-white/40 text-[0.6875rem] mr-1 select-none">₱</span>
                          <input
                            type="number"
                            value={pkg.minPrice}
                            onChange={(e) =>
                              handleUpdatePackagePrice(key, "minPrice", Number(e.target.value))
                            }
                            className="w-full bg-transparent text-white focus:outline-none [appearance:textfield] font-bold text-xs"
                            title="Minimum Allowed Price"
                          />
                        </div>

                        <div className="flex items-center rounded-[3px] bg-[#01142B] border border-white/[0.10] px-2 py-1 focus-within:border-[#CC6600]">
                          <span className="text-white/40 text-[0.6875rem] mr-1 select-none">₱</span>
                          <input
                            type="number"
                            placeholder="Uncapped"
                            value={pkg.maxPrice === null ? "" : pkg.maxPrice}
                            onChange={(e) =>
                              handleUpdatePackagePrice(
                                key,
                                "maxPrice",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none [appearance:textfield] text-xs"
                            title="Maximum Allowed Price (leave empty for Uncapped)"
                          />
                        </div>

                        <div className="flex items-center rounded-[3px] bg-[#01142B] border border-[#CC6600]/40 px-2 py-1 focus-within:border-[#CC6600]">
                          <span className="text-[#FFA040] text-[0.6875rem] mr-1 select-none">₱</span>
                          <input
                            type="number"
                            value={pkg.defaultPrice}
                            onChange={(e) =>
                              handleUpdatePackagePrice(key, "defaultPrice", Number(e.target.value))
                            }
                            className="w-full bg-transparent text-[#FFA040] font-bold focus:outline-none [appearance:textfield] text-xs"
                            title="Default Starting Price"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab 2: Priority Add-Ons ── */}
        {activeTab === "addons" && (
          <div className="flex flex-col gap-4">
            {/* Add New Add-on Drawer */}
            {isAddingAddon && (
              <div className="p-4 rounded-[4px] bg-[#01142B] border border-[#38BDF8]/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    New Priority Add-On Rider
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddon(false)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    <IconX size={16} stroke={1.5} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Key / Code</label>
                    <input
                      type="text"
                      placeholder="PLAGIARISM"
                      value={newAddonCode}
                      onChange={(e) => setNewAddonCode(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white uppercase focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Add-On Name</label>
                    <input
                      type="text"
                      placeholder="Plagiarism & AI Similarity Scrub"
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs text-white focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">SLA Badge</label>
                    <input
                      type="text"
                      placeholder="AI AUDIT"
                      value={newAddonBadge}
                      onChange={(e) => setNewAddonBadge(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white uppercase focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Default Fee (₱)</label>
                    <input
                      type="number"
                      value={newAddonPrice}
                      onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs font-mono text-white [appearance:textfield] focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6875rem] font-mono text-white/60 uppercase">Tagline / SLA Description</label>
                    <input
                      type="text"
                      placeholder="Comprehensive similarity report..."
                      value={newAddonTagline}
                      onChange={(e) => setNewAddonTagline(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[3px] bg-[#010D1F] border border-white/[0.12] text-xs text-white focus:border-[#CC6600] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddon(false)}
                    className="px-3 py-1.5 rounded-[3px] bg-white/[0.06] hover:bg-white/[0.10] text-xs font-mono text-white/70 uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAddon}
                    className="px-4 py-1.5 rounded-[3px] bg-[#CC6600] hover:bg-[#E67300] text-xs font-mono font-bold text-white uppercase tracking-wider cursor-pointer"
                  >
                    Save New Add-On
                  </button>
                </div>
              </div>
            )}

            {/* 2-Column Responsive Add-Ons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {addonKeys.map((key) => {
                const addon = catalog.addOns[key];
                if (!addon) return null;
                const isActive = addon.isActive !== false;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-[4px] border transition-all flex flex-col justify-between min-h-[110px] ${
                      isActive
                        ? "bg-[#010D1F] border-white/[0.08] hover:border-white/20"
                        : "bg-[#010D1F]/40 border-white/[0.04] opacity-50"
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[0.625rem] font-mono font-bold text-white/60 bg-white/[0.04] px-2 py-0.5 rounded-[2px] border border-white/[0.06] uppercase tracking-wider">
                          {addon.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleAddonActive(key)}
                          className={`px-2 py-0.5 rounded-[2px] text-[0.625rem] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border flex-shrink-0 ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/70"
                          }`}
                        >
                          {isActive ? "✓ Active" : "Disabled"}
                        </button>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-center gap-2">
                        {getAddonIcon(key)}
                        <span className="text-xs font-semibold text-white leading-snug">
                          {addon.name}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-[0.6875rem] text-white/50 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {addon.tagline}
                      </p>
                    </div>

                    {/* Fee Input */}
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[0.625rem] font-mono text-white/40 uppercase tracking-wider">
                        Default Fee Rate
                      </span>
                      <div className="flex items-center rounded-[3px] bg-[#01142B] border border-[#CC6600]/40 px-2.5 py-1 focus-within:border-[#CC6600]">
                        <span className="text-[#FFA040] text-xs font-mono font-bold mr-1 select-none">₱</span>
                        <input
                          type="number"
                          value={addon.defaultPrice}
                          onChange={(e) => handleUpdateAddonPrice(key, Number(e.target.value))}
                          className="w-20 bg-transparent text-[#FFA040] font-mono font-bold focus:outline-none [appearance:textfield] text-xs text-right"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Modal Actions Footer ── */}
        <ModalFooter align="between">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="px-3.5 py-2 rounded-[4px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-xs font-mono text-white/60 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <IconRotateClockwise size={14} stroke={1.5} />
            <span>{isResetting ? "Resetting..." : "Reset Factory Defaults"}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isResetting}
              className="px-4 py-2 rounded-[4px] bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-xs font-mono text-white/70 hover:text-white uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isResetting}
              className="px-5 py-2 rounded-[4px] bg-[#CC6600] hover:bg-[#E67300] active:bg-[#B35900] text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#CC6600]/25 cursor-pointer disabled:opacity-40"
            >
              <IconDeviceFloppy size={15} stroke={2} />
              <span>{isSaving ? "Saving..." : "Save & Apply Changes"}</span>
            </button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
}

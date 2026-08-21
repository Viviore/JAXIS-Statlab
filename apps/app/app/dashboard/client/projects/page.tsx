"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  FormInput,
} from "@repo/ui";
import { getProjects } from "@/features/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import type { ProjectDetailItem } from "@/features/projects/schemas";

export default function ClientProjectsListPage() {
  const [projects, setProjects] = useState<ProjectDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getProjects({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success) {
        setProjects(res.data);
      }
      setIsLoading(false);
    }
    loadData();
  }, [statusFilter, searchQuery]);

  const STATUS_TABS = [
    { label: "All Active", value: "ALL" },
    { label: "New Requests", value: "NEW_REQUEST" },
    { label: "Awaiting Info", value: "AWAITING_INFORMATION" },
    { label: "Under Evaluation", value: "UNDER_EVALUATION" },
    { label: "Active Studies", value: "ACTIVE" },
    { label: "Delivered", value: "DELIVERED" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title="My Research Projects & Active Studies"
        description="Monitor statistical consultation workflows, track peer review gates, and review proposal milestones."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal", href: "/dashboard/client" },
          { label: "Projects" },
        ]}
        actions={
          <Link href="/dashboard/client/projects/new">
            <Button variant="primary" size="sm" className="font-bold tracking-wider">
              + NEW PROJECT INTAKE
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-[2px] transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#CC6600] text-white font-bold"
                  : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72">
          <FormInput
            placeholder="Search study title or JAXIS ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects List View */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-white/10 w-1/4 rounded-[2px]" />
              <div className="h-6 bg-white/10 w-3/4 rounded-[2px]" />
              <div className="h-4 bg-white/10 w-1/2 rounded-[2px]" />
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 text-xl font-mono">
            ∅
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-white font-sans">
              No Research Studies Found
            </h3>
            <p className="text-xs text-white/50 max-w-sm">
              {searchQuery || statusFilter !== "ALL"
                ? "No projects match your current filters. Try changing search terms or selected status."
                : "You have not submitted any research project intake requests yet."}
            </p>
          </div>
          <Link href="/dashboard/client/projects/new">
            <Button variant="primary" size="md" className="mt-2">
              SUBMIT YOUR FIRST INTAKE →
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className={`p-6 transition-all border-l-4 hover:border-l-[#CC6600] group ${
                proj.masterStatus === "AWAITING_INFORMATION"
                  ? "border-l-amber-500 bg-amber-500/[0.02]"
                  : "border-l-transparent"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#CC6600] bg-[#CC6600]/10 px-2 py-0.5 rounded-[2px]">
                      {proj.intakeId}
                    </span>
                    <StatusBadge
                      status={proj.masterStatus}
                      label={PROJECT_STATUS_LABELS[proj.masterStatus] || proj.masterStatus}
                    />
                    <span className="text-xs font-mono text-white/40">
                      Target:{" "}
                      <strong className="text-white/80 font-medium">
                        {new Date(proj.deadlineRequested).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </span>
                    <span className="text-xs font-mono text-white/40">
                      {proj.files.length} {proj.files.length === 1 ? "file" : "files"} attached
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/client/projects/${proj.id}`}
                    className="text-base font-bold text-white group-hover:text-[#CC6600] transition-colors leading-snug"
                  >
                    {proj.researchTitle}
                  </Link>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed font-sans">
                    {proj.researchObjectives}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Link href={`/dashboard/client/projects/${proj.id}`}>
                    <Button variant="secondary" size="sm" className="whitespace-nowrap font-mono text-xs">
                      VIEW STUDY DETAILS →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Missing Information Alert Banner if applicable */}
              {proj.masterStatus === "AWAITING_INFORMATION" && proj.missingInfoReason && (
                <div className="mt-4 p-3.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono text-xs font-bold uppercase">
                      Action Required: Admin Requested Information
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 font-sans">
                    &ldquo;{proj.missingInfoReason}&rdquo;
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  FormInput,
  FormTextarea,
  Modal,
  Alert,
} from "@repo/ui";
import {
  getProjects,
  markIntakeComplete,
  requestMissingInfo,
} from "@/features/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/project-rules";
import type { ProjectDetailItem } from "@/features/projects/schemas";

export default function AdminIntakeTriagePage() {
  const [projects, setProjects] = useState<ProjectDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>("TRIAGE");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedForMissingInfo, setSelectedForMissingInfo] =
    useState<ProjectDetailItem | null>(null);
  const [missingInfoReasonText, setMissingInfoReasonText] = useState("");
  const [missingInfoError, setMissingInfoError] = useState<string | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    const res = await getProjects();
    if (res.success) {
      setProjects(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter projects based on tab & search
  const filteredProjects = projects.filter((p) => {
    // Tab filter
    if (filterTab === "TRIAGE") {
      if (
        p.masterStatus !== "NEW_REQUEST" &&
        p.masterStatus !== "AWAITING_INFORMATION"
      ) {
        return false;
      }
    } else if (filterTab === "NEW_REQUEST") {
      if (p.masterStatus !== "NEW_REQUEST") return false;
    } else if (filterTab === "AWAITING_INFORMATION") {
      if (p.masterStatus !== "AWAITING_INFORMATION") return false;
    } else if (filterTab === "UNDER_EVALUATION") {
      if (p.masterStatus !== "UNDER_EVALUATION") return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        p.intakeId.toLowerCase().includes(q) ||
        p.researchTitle.toLowerCase().includes(q) ||
        p.client.fullName.toLowerCase().includes(q) ||
        (p.client.clientProfile?.institutionSchool || "")
          .toLowerCase()
          .includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // KPI counters
  const newRequestsCount = projects.filter(
    (p) => p.masterStatus === "NEW_REQUEST"
  ).length;
  const awaitingInfoCount = projects.filter(
    (p) => p.masterStatus === "AWAITING_INFORMATION"
  ).length;
  const underEvaluationCount = projects.filter(
    (p) => p.masterStatus === "UNDER_EVALUATION"
  ).length;

  const handleMarkComplete = (projectId: string, intakeId: string) => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const res = await markIntakeComplete(projectId);
      if (res.success) {
        setFeedbackMessage(
          `Project ${intakeId} marked complete and transitioned to UNDER_EVALUATION.`
        );
        loadData();
      } else {
        setFeedbackMessage(`Error: ${res.error.message}`);
      }
    });
  };

  const handleRequestMissingInfoSubmit = () => {
    if (!selectedForMissingInfo) return;
    if (
      !missingInfoReasonText.trim() ||
      missingInfoReasonText.trim().length < 5
    ) {
      setMissingInfoError(
        "Please provide a clear description of the missing information (min 5 characters)."
      );
      return;
    }

    setMissingInfoError(null);
    startTransition(async () => {
      const res = await requestMissingInfo({
        projectId: selectedForMissingInfo.id,
        reason: missingInfoReasonText.trim(),
      });

      if (res.success) {
        setFeedbackMessage(
          `Information request sent to ${selectedForMissingInfo.client.fullName} for study ${selectedForMissingInfo.intakeId}.`
        );
        setSelectedForMissingInfo(null);
        setMissingInfoReasonText("");
        loadData();
      } else {
        setMissingInfoError(res.error.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title="Project Intake Triage & Evaluation Queue"
        description="Evaluate incoming research submissions, verify methodology feasibility, request missing dataset artifacts, and approve complete studies for pricing quotation."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Command", href: "/dashboard/admin" },
          { label: "Intake Triage" },
        ]}
      />

      {feedbackMessage && <Alert variant="success">{feedbackMessage}</Alert>}

      {/* ── KPI Header Counters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-l-2 border-l-amber-500 flex flex-col gap-1">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Active Triage Queue
          </span>
          <span className="text-2xl font-mono font-bold text-amber-400">
            {newRequestsCount + awaitingInfoCount}
          </span>
          <span className="text-[0.688rem] font-mono text-white/40">
            Requires administrative action
          </span>
        </Card>

        <Card className="p-5 border-l-2 border-l-sky-500 flex flex-col gap-1">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            New Submissions
          </span>
          <span className="text-2xl font-mono font-bold text-sky-400">
            {newRequestsCount}
          </span>
          <span className="text-[0.688rem] font-mono text-white/40">
            Pending initial review
          </span>
        </Card>

        <Card className="p-5 border-l-2 border-l-amber-400 flex flex-col gap-1">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Awaiting Info
          </span>
          <span className="text-2xl font-mono font-bold text-amber-300">
            {awaitingInfoCount}
          </span>
          <span className="text-[0.688rem] font-mono text-white/40">
            Client response pending
          </span>
        </Card>

        <Card className="p-5 border-l-2 border-l-emerald-500 flex flex-col gap-1">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Under Evaluation
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-400">
            {underEvaluationCount}
          </span>
          <span className="text-[0.688rem] font-mono text-white/40">
            Ready for quotation modeling
          </span>
        </Card>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { label: "Triage Queue", value: "TRIAGE" },
            { label: "New Requests", value: "NEW_REQUEST" },
            { label: "Awaiting Info", value: "AWAITING_INFORMATION" },
            { label: "Under Evaluation", value: "UNDER_EVALUATION" },
            { label: "All Submissions", value: "ALL" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterTab(tab.value)}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-[2px] transition-colors whitespace-nowrap ${
                filterTab === tab.value
                  ? "bg-[#CC6600] text-white font-bold"
                  : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <FormInput
            placeholder="Search study title, client, or JAXIS ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Triage Table ── */}
      <Card className="overflow-hidden p-0 border border-white/[0.08]">
        {isLoading ? (
          <div className="p-8 animate-pulse flex flex-col gap-3">
            <div className="h-6 bg-white/10 w-1/4 rounded-[2px]" />
            <div className="h-12 bg-white/10 w-full rounded-[2px]" />
            <div className="h-12 bg-white/10 w-full rounded-[2px]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <span className="text-2xl font-mono text-white/30">∅</span>
            <h3 className="text-sm font-bold text-white">
              No Submissions Found
            </h3>
            <p className="text-xs text-white/50">
              No project records match the active filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Intake ID
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Principal Investigator
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Research Study Title
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Target Deadline
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Files
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-[0.688rem] font-mono uppercase text-white/50 font-bold text-right">
                    Triage Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono font-bold text-[#CC6600] bg-[#CC6600]/10 px-2 py-0.5 rounded-[2px]">
                        {p.intakeId}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          {p.client.fullName}
                        </span>
                        <span className="text-[0.688rem] text-white/50 truncate max-w-[180px]">
                          {p.client.clientProfile?.institutionSchool ||
                            p.client.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[260px] max-w-[340px]">
                      <Link
                        href={`/dashboard/admin/projects/${p.id}`}
                        className="text-xs font-semibold text-white group-hover:text-[#CC6600] transition-colors line-clamp-2"
                      >
                        {p.researchTitle}
                      </Link>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {new Date(p.deadlineRequested).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-white/70 bg-white/[0.05] px-2 py-0.5 rounded-[2px]">
                        {p.files.length} doc(s)
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge
                        status={p.masterStatus}
                        label={
                          PROJECT_STATUS_LABELS[p.masterStatus] || p.masterStatus
                        }
                      />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.masterStatus === "NEW_REQUEST" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleMarkComplete(p.id, p.intakeId)
                            }
                            disabled={isPending}
                            className="text-xs font-mono"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {(p.masterStatus === "NEW_REQUEST" ||
                          p.masterStatus === "UNDER_EVALUATION") && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedForMissingInfo(p);
                              setMissingInfoReasonText(
                                p.missingInfoReason || ""
                              );
                            }}
                            className="text-xs font-mono"
                          >
                            Request Info
                          </Button>
                        )}
                        <Link href={`/dashboard/admin/projects/${p.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-mono"
                          >
                            Inspect Desk →
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Request Missing Info Modal ── */}
      {selectedForMissingInfo && (
        <Modal
          isOpen={Boolean(selectedForMissingInfo)}
          onClose={() => setSelectedForMissingInfo(null)}
          title={`Request Missing Information: ${selectedForMissingInfo.intakeId}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Specify the missing dataset files, questionnaire instruments, or research clarification required from{" "}
              <strong className="text-white">
                {selectedForMissingInfo.client.fullName}
              </strong>
              . This will transition the project to{" "}
              <code className="text-amber-400 font-mono">
                AWAITING_INFORMATION
              </code>
              .
            </p>

            <FormTextarea
              label="Feedback & Required Information Note"
              required
              rows={4}
              placeholder="e.g. Please attach the validated Likert-scale survey instrument and confirm whether demographic covariates (age, sex) are included in the CSV dataset."
              value={missingInfoReasonText}
              onChange={(e) => setMissingInfoReasonText(e.target.value)}
              error={missingInfoError || undefined}
              monoLabel
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedForMissingInfo(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestMissingInfoSubmit}
                loading={isPending}
              >
                Send Request & Set Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

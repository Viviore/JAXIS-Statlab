"use client";

import React, { useState, useEffect, useCallback, useTransition, use } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  FormSelect,
  FormTextarea,
  Modal,
  Alert,
} from "@repo/ui";
import { IconCheck, IconSettings } from "@tabler/icons-react";
import {
  getProjectById,
  updateProjectStatus,
  requestMissingInfo,
  markIntakeComplete,
} from "@/features/projects/actions";
import {
  VALID_TRANSITIONS,
  PROJECT_STATUS_LABELS,
} from "@/lib/project-rules";
import { ProjectFilesCard } from "@/features/projects/components/ProjectFilesCard";
import type { ProjectDetailItem } from "@/features/projects/schemas";
import type { ProjectStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProjectInspectionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal States
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);
  const [missingInfoReason, setMissingInfoReason] = useState("");
  const [missingInfoError, setMissingInfoError] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<string>("");
  const [statusModalError, setStatusModalError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await getProjectById(projectId);
    if (res.success) {
      setProject(res.data);
      const validTargets = VALID_TRANSITIONS[res.data.masterStatus] || [];
      if (validTargets.length > 0) {
        setSelectedTargetStatus(validTargets[0]!);
      }
    } else {
      setError(res.error.message);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleMarkComplete = () => {
    if (!project) return;
    setFeedbackMessage(null);
    startTransition(async () => {
      const res = await markIntakeComplete(project.id);
      if (res.success) {
        setFeedbackMessage("Intake verified and transitioned to UNDER_EVALUATION.");
        loadProject();
      } else {
        setError(res.error.message);
      }
    });
  };

  const handleRequestMissingInfo = () => {
    if (!project) return;
    if (!missingInfoReason.trim() || missingInfoReason.trim().length < 5) {
      setMissingInfoError("Please provide an explanatory reason (min 5 characters).");
      return;
    }

    setMissingInfoError(null);
    startTransition(async () => {
      const res = await requestMissingInfo({
        projectId: project.id,
        reason: missingInfoReason.trim(),
      });

      if (res.success) {
        setFeedbackMessage(`Information request dispatched to ${project.client.fullName}.`);
        setIsMissingInfoModalOpen(false);
        setMissingInfoReason("");
        loadProject();
      } else {
        setMissingInfoError(res.error.message);
      }
    });
  };

  const handleStatusTransition = () => {
    if (!project || !selectedTargetStatus) return;

    setStatusModalError(null);
    startTransition(async () => {
      const res = await updateProjectStatus({
        projectId: project.id,
        status: selectedTargetStatus as ProjectStatus,
      });

      if (res.success) {
        setFeedbackMessage(
          `Project transitioned to ${PROJECT_STATUS_LABELS[selectedTargetStatus as ProjectStatus] || selectedTargetStatus}.`
        );
        setIsStatusModalOpen(false);
        loadProject();
      } else {
        setStatusModalError(res.error.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <PageHeader
          title="Loading Project Inspection Desk..."
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Admin Command", href: "/dashboard/admin" },
            { label: "Intake Triage", href: "/dashboard/admin/intake" },
            { label: "Inspection Desk" },
          ]}
        />
        <Card className="p-8 animate-pulse flex flex-col gap-4">
          <div className="h-6 bg-white/10 w-1/3 rounded-[2px]" />
          <div className="h-8 bg-white/10 w-2/3 rounded-[2px]" />
          <div className="h-32 bg-white/10 w-full rounded-[2px]" />
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
        <PageHeader
          title="Study Record Not Found"
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "Admin Command", href: "/dashboard/admin" },
            { label: "Intake Triage", href: "/dashboard/admin/intake" },
            { label: "Detail" },
          ]}
        />
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-red-400 font-mono">
            {error || "The requested project record could not be loaded."}
          </p>
          <Link href="/dashboard/admin/intake">
            <Button variant="secondary" size="md">
              ← Return to Intake Triage Queue
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const allowedTransitions = VALID_TRANSITIONS[project.masterStatus] || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 w-full animate-content-fade">
      <PageHeader
        title={project.researchTitle}
        description={`Study ID: ${project.intakeId} · Primary Client: ${project.client.fullName} · Submitted ${new Date(
          project.createdAt
        ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Command", href: "/dashboard/admin" },
          { label: "Intake Triage", href: "/dashboard/admin/intake" },
          { label: project.intakeId },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/intake">
              <Button variant="secondary" size="sm">
                ← TRIAGE QUEUE
              </Button>
            </Link>
          </div>
        }
      />

      {feedbackMessage && <Alert variant="success">{feedbackMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Governance Status Action Bar ── */}
      <Card className="p-4 sm:p-5 border-l-4 border-l-[#CC6600]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-white/50 uppercase font-bold tracking-wider">
                Current Master Status:
              </span>
              <StatusBadge
                status={project.masterStatus}
                label={PROJECT_STATUS_LABELS[project.masterStatus] || project.masterStatus}
                pulse={project.masterStatus === "NEW_REQUEST" || project.masterStatus === "AWAITING_INFORMATION"}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
              <span>Target Deadline:</span>
              <strong className="text-amber-400 font-medium">
                {new Date(project.deadlineRequested).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {(project.masterStatus === "NEW_REQUEST" ||
              project.masterStatus === "AWAITING_INFORMATION") && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkComplete}
                disabled={isPending}
                className="text-xs font-mono font-bold tracking-wider whitespace-nowrap flex items-center gap-1"
              >
                <IconCheck size={14} stroke={2.5} />
                MARK INTAKE COMPLETE
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMissingInfoReason(project.missingInfoReason || "");
                setIsMissingInfoModalOpen(true);
              }}
              className="text-xs font-mono tracking-wider whitespace-nowrap"
            >
              REQUEST MISSING INFO
            </Button>

            {allowedTransitions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTargetStatus(allowedTransitions[0]!);
                  setIsStatusModalOpen(true);
                }}
                className="text-xs font-mono tracking-wider whitespace-nowrap flex items-center gap-1.5"
              >
                <IconSettings size={14} stroke={1.5} />
                TRANSITION STATUS
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Missing Information Reason (if active) ── */}
      {project.masterStatus === "AWAITING_INFORMATION" && project.missingInfoReason && (
        <Card className="p-5 bg-amber-500/[0.04] border-l-4 border-l-amber-500 flex flex-col gap-2">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase">
            Active Missing Information Request:
          </span>
          <p
            className="text-xs text-white/90 leading-relaxed font-sans bg-black/30 p-4 rounded-[2px] border border-white/[0.08]"
            style={{ padding: "1rem" }}
          >
            &ldquo;{project.missingInfoReason}&rdquo;
          </p>
        </Card>
      )}

      {/* ── Main Inspection Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Research Content & Datasets */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 md:p-8 flex flex-col gap-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white font-sans">
                Research Problem &amp; Analytical Scope
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40 font-bold">
                Statement of the Problem / Key Questions
              </span>
              <div
                className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                style={{ padding: "1rem" }}
              >
                {project.researchQuestions}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-white/40 font-bold">
                Core Research Objectives
              </span>
              <div
                className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                style={{ padding: "1rem" }}
              >
                {project.researchObjectives}
              </div>
            </div>

            {project.hypotheses && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase text-white/40 font-bold">
                  Theoretical Hypotheses
                </span>
                <div
                  className="p-4 rounded-[2px] bg-[#011C38] border border-white/[0.08] text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans"
                  style={{ padding: "1rem" }}
                >
                  {project.hypotheses}
                </div>
              </div>
            )}
          </Card>

          {/* Attached Files Card */}
          <ProjectFilesCard files={project.files} studyId={project.intakeId} />
        </div>

        {/* Right Col: Client Institutional Identity */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold border-b border-white/[0.08] pb-2">
              Client & Institutional Profile
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-white/40 block">Full Name</span>
                <span className="text-white font-semibold font-sans">{project.client.fullName}</span>
              </div>

              <div>
                <span className="text-white/40 block">Email Address</span>
                <span className="text-white font-mono">{project.client.email}</span>
              </div>

              {project.client.clientProfile ? (
                <>
                  <div>
                    <span className="text-white/40 block">University / Institution</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.institutionSchool}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Academic Degree / Program</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.academicProgram}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Contact Number</span>
                    <span className="text-white font-mono">
                      {project.client.clientProfile.contactNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Philippine Region</span>
                    <span className="text-white font-semibold font-sans">
                      {project.client.clientProfile.region}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-[2px] text-amber-300 text-xs">
                  Institutional profile not registered.
                </div>
              )}
            </div>
          </Card>

          {/* Audit Telemetry Summary */}
          <Card className="p-6 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold border-b border-white/[0.08] pb-2">
              Audit Telemetry
            </h3>
            <div className="flex flex-col gap-2 text-xs font-mono text-white/60">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-white">{new Date(project.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified:</span>
                <span className="text-white">{new Date(project.updatedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispute Flag:</span>
                <span className={project.hasActiveDispute ? "text-red-400" : "text-emerald-400"}>
                  {project.hasActiveDispute ? "Active Dispute" : "Clean"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Request Missing Info Modal ── */}
      {isMissingInfoModalOpen && (
        <Modal
          isOpen={isMissingInfoModalOpen}
          onClose={() => setIsMissingInfoModalOpen(false)}
          title={`Request Missing Information (${project.intakeId})`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Describe what research documents or dataset information the client must attach. This transitions status to <code className="text-amber-400 font-mono">AWAITING_INFORMATION</code>.
            </p>

            <FormTextarea
              label="Information Required Note"
              required
              rows={4}
              placeholder="e.g. Please upload the questionnaire tool and specify sample size N."
              value={missingInfoReason}
              onChange={(e) => setMissingInfoReason(e.target.value)}
              error={missingInfoError || undefined}
              monoLabel
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMissingInfoModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestMissingInfo}
                loading={isPending}
              >
                Send Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Status Transition Modal ── */}
      {isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`State Machine Status Transition: ${project.intakeId}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Select an approved state transition from the JAXIS project lifecycle state machine.
            </p>

            <FormSelect
              label="Permitted Target Status"
              options={allowedTransitions.map((t) => ({
                label: `${PROJECT_STATUS_LABELS[t] || t} (${t})`,
                value: t,
              }))}
              value={selectedTargetStatus}
              onChange={(e) => setSelectedTargetStatus(e.target.value)}
              monoLabel
            />

            {statusModalError && (
              <span className="text-xs text-red-400 font-mono">{statusModalError}</span>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStatusTransition}
                loading={isPending}
              >
                Apply Transition
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

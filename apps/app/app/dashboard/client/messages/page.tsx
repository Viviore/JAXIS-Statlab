"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, LoadingState, Badge, StatusBadge } from "@repo/ui";
import { getMyProjectThreads } from "@/features/messaging/actions";
import type { ProjectThreadSummaryDTO } from "@/features/messaging/schemas";
import { MessageThread } from "@/features/messaging/components/MessageThread";
import {
  IconMessages,
  IconFolder,
  IconShieldCheck,
  IconClock,
  IconArrowRight,
  IconLock,
} from "@tabler/icons-react";

export default function ClientMessagesPage() {
  const [threads, setThreads] = useState<ProjectThreadSummaryDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMyProjectThreads();
      if (res.success && res.data) {
        setThreads(res.data);
        if (res.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(res.data[0]!.projectId);
        }
      }
    } catch (err) {
      console.error("Failed to load message threads:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const selectedThread = threads.find((t) => t.projectId === selectedProjectId) || threads[0] || null;

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex flex-col min-h-0 gap-3 w-full animate-content-fade font-sans overflow-hidden">
        <div className="flex-shrink-0">
          <PageHeader
            breadcrumbs={[
              { label: "WORKSPACE", href: "/dashboard" },
              { label: "RESEARCH DESK", href: "/dashboard/client/projects" },
              { label: "MESSAGES" },
            ]}
            title="Study Messages & Consultation"
            description="Communicate directly with your assigned Lead Statistician and Senior QA Lead under JAXIS escrow protection."
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="emerald" className="text-[0.688rem] font-mono flex items-center gap-1">
                  <IconShieldCheck size={13} stroke={2} />
                  <span>Firewall Protected</span>
                </Badge>
              </div>
            }
          />
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <LoadingState
            variant="page"
            label="Loading Messages..."
            description="Please wait while we load your research consultation threads"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-3 w-full animate-content-fade font-sans overflow-hidden">
      {/* Standardized PageHeader (Compact & Responsive) */}
      <div className="flex-shrink-0">
        <PageHeader
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "RESEARCH DESK", href: "/dashboard/client/projects" },
            { label: "MESSAGES" },
          ]}
          title="Study Messages & Consultation"
          description="Communicate directly with your assigned Lead Statistician and Senior QA Lead under JAXIS escrow protection."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="emerald" className="text-[0.688rem] font-mono flex items-center gap-1">
                <IconShieldCheck size={13} stroke={2} />
                <span>Firewall Protected</span>
              </Badge>
            </div>
          }
        />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Studies Selector (4 cols on desktop, full screen on mobile when mobileView === "list") */}
        <div
          className={`lg:col-span-4 h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
            mobileView === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between px-1 flex-shrink-0">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50">
              Your Studies ({threads.length})
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
            {threads.length === 0 ? (
              <div className="p-6 rounded-[4px] bg-[#01142B] border border-white/10 text-center text-xs text-white/40">
                No active studies
              </div>
            ) : (
              threads.map((t) => {
                const isSelected = selectedThread?.projectId === t.projectId;
                const isAssigned = Boolean(t.statisticianName || t.qaLeadName);

                return (
                  <button
                    key={t.projectId}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(t.projectId);
                      setMobileView("chat");
                    }}
                    className={`p-3.5 rounded-[4px] text-left transition-all duration-150 border cursor-pointer flex flex-col gap-1.5 select-none ${
                      isSelected
                        ? isAssigned
                          ? "bg-[#011B38] border-[#CC6600] ring-1 ring-[#CC6600]/40 shadow-lg"
                          : "bg-[#011B38] border-sky-500/60 ring-1 ring-sky-500/30 shadow-lg"
                        : isAssigned
                        ? "bg-[#01142B] border-white/10 hover:bg-white/[0.03] hover:border-white/20"
                        : "bg-[#01142B]/75 border-white/[0.07] hover:bg-white/[0.02] opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-mono font-bold ${isAssigned ? "text-[#CC6600]" : "text-sky-400"}`}>
                        {t.intakeId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {t.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#CC6600] text-white text-[0.625rem] font-bold font-mono">
                            {t.unreadCount} NEW
                          </span>
                        )}
                        {!isAssigned || t.masterStatus === "ACTIVE" ? (
                          <StatusBadge status="PENDING_ASSIGNMENT" label="PENDING ASSIGNMENT" />
                        ) : (
                          <Badge variant="muted" className="text-[0.625rem] font-mono px-1.5 py-0">
                            {t.masterStatus.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                      {t.researchTitle}
                    </h4>

                    {t.lastMessage ? (
                      <p className="text-[0.688rem] text-white/60 line-clamp-1 italic">
                        <strong>{t.lastMessage.senderName}:</strong> &ldquo;{t.lastMessage.content}&rdquo;
                      </p>
                    ) : (
                      <span className="text-[0.688rem] text-white/40 italic">
                        {isAssigned ? "No messages yet" : "Channel locked · Awaiting specialist assignment"}
                      </span>
                    )}

                    <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[0.625rem] text-white/50 font-mono">
                      <span className="flex items-center gap-1">
                        <IconFolder size={11} stroke={1.5} />
                        <span className={`truncate max-w-[140px] ${!isAssigned ? "text-amber-400/90 font-medium" : ""}`}>
                          {t.statisticianName || "Awaiting Expert"}
                        </span>
                      </span>
                      {isSelected ? (
                        isAssigned ? (
                          <span className="text-[#CC6600] font-semibold flex items-center gap-0.5">
                            <span>ACTIVE CHAT</span>
                            <IconArrowRight size={10} stroke={2} />
                          </span>
                        ) : (
                          <span className="text-amber-400/80 font-semibold flex items-center gap-1">
                            <IconLock size={10} stroke={2} />
                            <span>LOCKED</span>
                          </span>
                        )
                      ) : (
                        !isAssigned ? (
                          <span className="text-white/35 flex items-center gap-1">
                            <IconLock size={10} stroke={1.5} />
                            <span>LOCKED</span>
                          </span>
                        ) : t.lastMessage ? (
                          <span className="flex items-center gap-1">
                            <IconClock size={11} stroke={1.5} />
                            <span>{new Date(t.lastMessage.sentAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                          </span>
                        ) : null
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Message Thread (8 cols on desktop, full screen on mobile when mobileView === "chat") */}
        <div
          className={`lg:col-span-8 h-full min-h-0 flex flex-col overflow-hidden ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {isLoading ? (
            <Card className="h-full min-h-0 p-12 bg-[#01142B] border-white/10 flex flex-col items-center justify-center text-center">
              <LoadingState variant="card" />
            </Card>
          ) : threads.length === 0 ? (
            <Card className="h-full min-h-0 p-12 bg-[#01142B] border-white/10 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-14 w-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                <IconMessages size={28} stroke={1.5} />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-bold text-white">No Active Study Threads</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  When you submit a research project and an expert is assigned, your dedicated project communication thread will appear here automatically.
                </p>
              </div>
            </Card>
          ) : selectedThread ? (
            <MessageThread 
              projectId={selectedThread.projectId} 
              className="h-full min-h-0" 
              onBack={() => setMobileView("list")}
            />
          ) : (
            <Card className="h-full min-h-0 p-12 bg-[#01142B] border-white/10 flex flex-col items-center justify-center text-center">
              <IconArrowRight size={24} stroke={1.5} className="text-white/40 mb-2" />
              <span className="text-xs text-white font-semibold">Select a study thread on the left to begin chatting</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

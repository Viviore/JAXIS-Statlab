"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, LoadingState, Badge } from "@repo/ui";
import { getMyProjectThreads } from "@/features/messaging/actions";
import type { ProjectThreadSummaryDTO } from "@/features/messaging/schemas";
import { MessageThread } from "@/features/messaging/components/MessageThread";
import {
  IconMessages,
  IconFolder,
  IconShieldCheck,
  IconClock,
  IconArrowRight,
} from "@tabler/icons-react";

export default function StatisticianMessagesPage() {
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
        if (res.data.length > 0 && !selectedProjectId && res.data[0]) {
          setSelectedProjectId(res.data[0].projectId);
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
              { label: "STATISTICIAN WORKBENCH", href: "/dashboard/statistician" },
              { label: "MESSAGES" },
            ]}
            title="Study Messages & Consultation"
            description="Direct communication with assigned lead researchers for active statistical computations and analysis requirements."
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
            { label: "STATISTICIAN WORKBENCH", href: "/dashboard/statistician" },
            { label: "MESSAGES" },
          ]}
          title="Study Messages & Consultation"
          description="Direct communication with assigned lead researchers for active statistical computations and analysis requirements."
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
        {/* Left Column: Assigned Studies Selector (4 cols on desktop, full screen on mobile when mobileView === "list") */}
        <div
          className={`lg:col-span-4 h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
            mobileView === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between px-1 flex-shrink-0">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50">
              Assigned Studies ({threads.length})
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
            {threads.length === 0 ? (
              <div className="p-6 rounded-[4px] bg-[#01142B] border border-white/10 text-center text-xs text-white/40">
                No assigned studies
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = thread.projectId === selectedThread?.projectId;
                return (
                  <button
                    key={thread.projectId}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(thread.projectId);
                      setMobileView("chat");
                    }}
                    className={`text-left p-3.5 rounded-[4px] border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                      isSelected
                        ? "bg-[#011B38] border-[#CC6600] ring-1 ring-[#CC6600]/40 shadow-lg"
                        : "bg-[#01142B] border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#38BDF8] font-mono">
                        <IconFolder size={13} stroke={2} />
                        <span className="truncate max-w-[130px] font-semibold">{thread.intakeId || thread.researchTitle}</span>
                      </div>
                      <Badge variant="outline" className="text-[0.625rem] font-mono py-0 px-1">
                        {thread.masterStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                      {thread.researchTitle}
                    </h4>

                    {thread.lastMessage ? (
                      <div className="text-[0.688rem] text-white/50 truncate flex items-center gap-1">
                        <span className="text-white/70 font-semibold">{thread.lastMessage.senderName}:</span>
                        <span className="truncate">{thread.lastMessage.content}</span>
                      </div>
                    ) : (
                      <div className="text-[0.688rem] text-white/30 italic">
                        No messages exchanged yet
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[0.625rem] text-white/40 pt-1.5 border-t border-white/5 mt-0.5 font-mono">
                      <div className="flex items-center gap-1">
                        <IconClock size={11} stroke={2} />
                        <span>{thread.masterStatus}</span>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-0.5 text-[#CC6600] font-semibold">
                          <span>ACTIVE CHAT</span>
                          <IconArrowRight size={10} stroke={2} />
                        </div>
                      ) : (
                        thread.lastMessage && (
                          <span>{new Date(thread.lastMessage.sentAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                        )
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Message Thread Console (8 cols on desktop, full screen on mobile when mobileView === "chat") */}
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
                <h3 className="text-sm font-bold text-white">No Assigned Studies Found</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  When administration assigns research studies to you, your active client consultation threads will appear here automatically.
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
            <Card className="h-full min-h-0 p-12 bg-[#01142B] border-white/10 flex flex-col items-center justify-center text-center text-white/50">
              <IconArrowRight size={24} stroke={1.5} className="text-white/40 mb-2" />
              <span className="text-xs text-white font-semibold">Select a research study on the left to start consulting</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

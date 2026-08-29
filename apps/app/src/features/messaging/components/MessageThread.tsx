"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { MessageDTO } from "../schemas";
import { getProjectMessages, syncNewMessages, sendMessage } from "../actions";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { LoadingState, Badge, StatusBadge } from "@repo/ui";
import {
  IconMessages,
  IconShieldCheck,
  IconUsers,
  IconLoader2,
  IconHistory,
  IconArrowLeft,
  IconLock,
} from "@tabler/icons-react";
import { subscribeToProjectMessages } from "@/lib/messaging/realtime";

interface MessageThreadProps {
  projectId: string;
  className?: string;
  onBack?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  projectId,
  className = "",
  onBack,
}) => {
  const CACHE_KEY = `jaxis_chat_cache_${projectId}`;

  // Read initial cache synchronously if available
  const [messages, setMessages] = useState<MessageDTO[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.messages)) return parsed.messages;
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<{
    id: string;
    intakeId: string;
    researchTitle: string;
    masterStatus: string;
    clientName: string;
    statisticianName: string | null;
    qaLeadName: string | null;
  } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`jaxis_chat_cache_${projectId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.project) return parsed.project;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Only show skeleton if we have zero cached messages & zero projectInfo
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`jaxis_chat_cache_${projectId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.project || (parsed.messages && parsed.messages.length > 0)) {
            return false; // Instant 0ms render from cache!
          }
        }
      } catch {
        // ignore
      }
    }
    return true;
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDone = useRef<boolean>(false);
  const messagesRef = useRef<MessageDTO[]>([]);
  messagesRef.current = messages;

  const scrollToBottom = useCallback((smooth = false) => {
    if (chatContainerRef.current) {
      if (smooth) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, []);

  const loadInitialMessages = useCallback(async () => {
    // If no cache, mark loading
    if (messages.length === 0 && !projectInfo) {
      setIsLoading(true);
    }
    isInitialScrollDone.current = false;

    try {
      const res = await getProjectMessages(projectId, { limit: 20 });
      if (res.success && res.data) {
        setProjectInfo(res.data.project);
        setMessages(res.data.messages);
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);

        // Cache snapshot to browser sessionStorage for instant 0ms reload
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              `jaxis_chat_cache_${projectId}`,
              JSON.stringify({
                project: res.data.project,
                messages: res.data.messages,
                hasMore: res.data.hasMore,
                nextCursor: res.data.nextCursor,
              })
            );
          } catch {
            // ignore quota errors
          }
        }
      }
    } catch (err) {
      console.error("Failed to load initial project messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, messages.length, projectInfo]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || isLoadingOlder || !nextCursor) return;

    setIsLoadingOlder(true);
    const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;

    try {
      const res = await getProjectMessages(projectId, { cursor: nextCursor, limit: 20 });
      if (res.success && res.data) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const olderUnique = res.data!.messages.filter((m) => !existingIds.has(m.id));
          const updated = [...olderUnique, ...prev];

          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                `jaxis_chat_cache_${projectId}`,
                JSON.stringify({
                  project: projectInfo,
                  messages: updated,
                  hasMore: res.data!.hasMore,
                  nextCursor: res.data!.nextCursor,
                })
              );
            } catch {
              // ignore
            }
          }

          return updated;
        });
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);

        // Preserve scroll position relative to previous top content
        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [hasMore, isLoadingOlder, nextCursor, projectId, projectInfo]);

  // Scroll listener for top reverse cursor pagination
  const handleScroll = () => {
    if (chatContainerRef.current) {
      if (chatContainerRef.current.scrollTop <= 40 && hasMore && !isLoadingOlder) {
        loadOlderMessages();
      }
    }
  };

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Scroll down on initial mount
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialScrollDone.current) {
      scrollToBottom(false);
      isInitialScrollDone.current = true;
    }
  }, [isLoading, messages.length, scrollToBottom]);

  // 3. Real-time Subscription via Supabase Realtime Channels
  useEffect(() => {
    if (!projectId) return;

    const cleanup = subscribeToProjectMessages(projectId, async () => {
      const lastMsg = messagesRef.current[messagesRef.current.length - 1];
      const sinceIso = lastMsg ? lastMsg.sentAt : new Date(Date.now() - 60000).toISOString();

      try {
        const syncRes = await syncNewMessages(projectId, sinceIso);
        if (syncRes.success && syncRes.data && syncRes.data.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = syncRes.data!.filter((m) => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;
            const updated = [...prev, ...fresh];

            if (typeof window !== "undefined") {
              try {
                sessionStorage.setItem(
                  `jaxis_chat_cache_${projectId}`,
                  JSON.stringify({
                    project: projectInfo,
                    messages: updated,
                    hasMore,
                    nextCursor,
                  })
                );
              } catch {
                // ignore
              }
            }

            return updated;
          });
          scrollToBottom(true);
        }
      } catch (err) {
        console.error("Failed to sync realtime delta messages:", err);
      }
    });

    return () => {
      cleanup();
    };
  }, [projectId, scrollToBottom, projectInfo, hasMore, nextCursor]);

  // Optimistic Message Sender (0ms instant bubble display)
  const handleSendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return { success: false };

    const tempId = `optimistic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimisticMessage: MessageDTO = {
      id: tempId,
      projectId,
      senderId: "current_user",
      senderName: "You",
      senderRole: "CLIENT",
      content: trimmed,
      isBlocked: false,
      blockedReason: null,
      sentAt: new Date().toISOString(),
      isMine: true,
      isRead: false,
      readByCount: 0,
    };

    // 1. Paint optimistic bubble immediately on screen (0ms delay)
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom(true);

    try {
      // 2. Transmit to server in background
      const res = await sendMessage({ projectId, content: trimmed });

      if (res.success && res.data) {
        // Swap temporary optimistic bubble with confirmed server record
        setMessages((prev) => {
          const updated = prev.map((m) => (m.id === tempId ? res.data! : m));
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                `jaxis_chat_cache_${projectId}`,
                JSON.stringify({
                  project: projectInfo,
                  messages: updated,
                  hasMore,
                  nextCursor,
                })
              );
            } catch {
              // ignore
            }
          }
          return updated;
        });
        scrollToBottom(true);
        return { success: true };
      }

      // If blocked or server returned error, rollback optimistic bubble
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      if (res.error?.code === "FIREWALL_BLOCKED") {
        return { success: false, blocked: true, warning: res.error.message };
      }
      return { success: false, warning: res.error?.message };
    } catch (err) {
      // Rollback on network failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return { success: false, warning: (err as Error).message || "Failed to deliver message." };
    }
  };

  if (isLoading) {
    return (
      <div className={`h-full min-h-0 p-8 sm:p-12 bg-[#01142B] border border-white/10 rounded-[4px] flex flex-col items-center justify-center shadow-2xl ${className}`}>
        <LoadingState
          variant="card"
          label="Loading Conversation..."
          description="Please wait while we load your research consultation thread"
        />
      </div>
    );
  }

  const isAssigned = Boolean(projectInfo?.statisticianName || projectInfo?.qaLeadName);

  return (
    <div className={`h-full min-h-0 flex flex-col bg-[#01142B] border border-white/10 rounded-[4px] overflow-hidden shadow-2xl ${className}`}>
      {/* Thread Header — STATIC FIXED HEIGHT (Zero layout shift) */}
      <div className="flex-shrink-0 p-3.5 sm:p-4 border-b border-white/10 bg-[#010114]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-start sm:items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-1.5 rounded-[2px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white/80 hover:text-white cursor-pointer transition-colors shrink-0"
              aria-label="Back to studies list"
            >
              <IconArrowLeft size={16} stroke={2} />
            </button>
          )}
          <div className="p-2 rounded-[2px] bg-[#CC6600]/15 border border-[#CC6600]/30 text-[#CC6600] shrink-0">
            <IconMessages size={18} stroke={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#CC6600] tracking-wider">
                {projectInfo?.intakeId || "STUDY THREAD"}
              </span>
              {!isAssigned || projectInfo?.masterStatus === "ACTIVE" ? (
                <StatusBadge status="PENDING_ASSIGNMENT" label="PENDING ASSIGNMENT" />
              ) : (
                <Badge variant="sky" className="text-[0.625rem] font-mono">
                  {projectInfo?.masterStatus.replace(/_/g, " ") || "ACTIVE"}
                </Badge>
              )}
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5 line-clamp-1">
              {projectInfo?.researchTitle || "Research Study Discussion"}
            </h2>
          </div>
        </div>

        {/* Participants Summary */}
        {!isAssigned ? (
          <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-[2px] border border-amber-500/25 shrink-0">
            <IconLock size={13} stroke={1.5} className="text-amber-400 shrink-0" />
            <span className="text-[0.688rem] font-mono">
              Team: Awaiting Assignment
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-xs text-white/60 bg-white/[0.03] px-2.5 py-1 rounded-[2px] border border-white/10 shrink-0">
            <IconUsers size={14} stroke={1.5} className="text-sky-400 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap text-[0.688rem]">
              <span><strong>Client:</strong> {projectInfo?.clientName}</span>
              <span>&bull;</span>
              <span><strong>Statistician:</strong> {projectInfo?.statisticianName || "Unassigned"}</span>
              {projectInfo?.qaLeadName && (
                <>
                  <span>&bull;</span>
                  <span><strong>QA:</strong> {projectInfo.qaLeadName}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Stream Container — ONLY THIS SCROLLS */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2 bg-[#010114]/30"
      >
        {/* Older Messages Pagination Trigger / Indicator */}
        {isLoadingOlder ? (
          <div className="py-2 flex items-center justify-center gap-2 text-xs text-sky-400 font-mono">
            <IconLoader2 size={14} className="animate-spin" />
            <span>Loading older messages...</span>
          </div>
        ) : hasMore ? (
          <div className="py-1.5 flex items-center justify-center">
            <button
              type="button"
              onClick={loadOlderMessages}
              className="px-3 py-1 rounded-[2px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[0.688rem] font-mono text-white/60 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <IconHistory size={13} stroke={1.5} className="text-[#38BDF8]" />
              <span>Load older messages</span>
            </button>
          </div>
        ) : messages.length > 0 ? (
          <div className="py-2 flex items-center justify-center gap-3 text-[0.625rem] font-mono text-white/30 uppercase tracking-wider">
            <span className="h-px bg-white/10 flex-1" />
            <span>Beginning of consultation history</span>
            <span className="h-px bg-white/10 flex-1" />
          </div>
        ) : null}

        {/* Security Assurance Banner */}
        <div className="mb-2 p-2.5 rounded-[2px] bg-sky-950/30 border border-sky-500/20 flex items-center justify-between text-xs text-sky-200/90 font-sans flex-shrink-0">
          <div className="flex items-center gap-2">
            <IconShieldCheck size={15} stroke={2} className="text-sky-400 shrink-0" />
            <span className="text-[0.688rem] sm:text-xs">
              All study communication is encrypted and monitored by the JAXIS Communication Firewall.
            </span>
          </div>
          <span className="text-[0.625rem] text-white/40 hidden md:inline">
            Direct off-platform contact is prohibited
          </span>
        </div>

        {/* Empty / Locked State */}
        {!isAssigned && messages.length === 0 ? (
          <div className="my-auto py-10 px-6 max-w-md mx-auto rounded-[4px] bg-[#01142B]/90 border border-white/10 flex flex-col items-center justify-center text-center gap-3.5 shadow-xl">
            <div className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-amber-400">
              <IconLock size={24} stroke={1.5} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Consultation Channel Locked</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Your downpayment has been confirmed. This consultation thread will automatically open as soon as an administrator assigns your Lead Statistician and QA Lead.
              </p>
            </div>
            <div className="px-3 py-1 rounded-[2px] bg-white/[0.03] border border-white/[0.08] text-[0.688rem] font-mono text-amber-300/90 uppercase tracking-wider">
              Status: Pending Specialist Assignment
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="my-auto py-8 flex flex-col items-center justify-center text-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
              <IconMessages size={20} stroke={1.5} />
            </div>
            <div className="max-w-md">
              <span className="text-xs font-semibold text-white block">No messages yet</span>
              <p className="text-[0.688rem] text-white/50 mt-0.5 leading-relaxed">
                Start the research consultation by typing a message below. Your assigned team will be notified immediately.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer — PINNED AT BOTTOM */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 bg-[#010114]/70">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isAssigned}
          disabledReason={!isAssigned ? "Channel locked • Waiting for administrator to assign research team" : undefined}
          placeholder={!isAssigned ? "Consultation channel will open once your research team is assigned..." : undefined}
        />
      </div>
    </div>
  );
};

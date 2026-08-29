"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { MessageDTO } from "../schemas";
import { getProjectMessages, syncNewMessages, sendMessage } from "../actions";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { LoadingState, Badge } from "@repo/ui";
import {
  IconMessages,
  IconShieldCheck,
  IconUsers,
  IconLoader2,
  IconHistory,
  IconArrowLeft,
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
  const [messages, setMessages] = useState<MessageDTO[]>([]);
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
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // 1. Initial Load: Fetch latest 15 messages (1 compact query)
  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    isInitialScrollDone.current = false;

    try {
      const res = await getProjectMessages(projectId, { limit: 15 });
      if (res.success && res.data) {
        setProjectInfo(res.data.project);
        setMessages(res.data.messages);
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load initial project messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 2. Load Older Messages (Chunk of 15 when scrolling up)
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || isLoadingOlder || !nextCursor) return;

    setIsLoadingOlder(true);
    const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;

    try {
      const res = await getProjectMessages(projectId, { cursor: nextCursor, limit: 15 });
      if (res.success && res.data) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const olderUnique = res.data!.messages.filter((m) => !existingIds.has(m.id));
          return [...olderUnique, ...prev];
        });
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);

        // Preserve scroll position so content doesn't jump
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
  }, [projectId, hasMore, isLoadingOlder, nextCursor]);

  // 3. Fast Micro-Delta Sync (Messenger/Telegram delta query)
  const syncLatestDelta = useCallback(async () => {
    if (document.hidden) return; // Zero server load when tab is inactive

    const currentList = messagesRef.current;
    const lastMsg = currentList[currentList.length - 1];
    const sinceIso = lastMsg ? lastMsg.sentAt : new Date(0).toISOString();

    try {
      const res = await syncNewMessages(projectId, sinceIso);
      if (res.success && res.data && res.data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newArrived = res.data!.filter((m) => !existingIds.has(m.id));
          if (newArrived.length === 0) return prev;

          // Auto-scroll if user is near bottom
          if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
            if (isNearBottom) {
              setTimeout(() => scrollToBottom(true), 40);
            }
          }

          return [...prev, ...newArrived];
        });
      }
    } catch (err) {
      console.error("Failed to sync delta messages:", err);
    }
  }, [projectId, scrollToBottom]);

  // Mount on project change
  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Auto-scroll to bottom on initial message load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialScrollDone.current) {
      scrollToBottom(false);
      isInitialScrollDone.current = true;
    }
  }, [messages, isLoading, scrollToBottom]);

  // 4. WebSocket Push-First + Tab Visibility Sync (Messenger/WhatsApp pattern)
  useEffect(() => {
    let wsConnected = false;

    // A. Real-time push listener (Instant delivery from Supabase WebSocket)
    const unsubscribe = subscribeToProjectMessages(
      projectId,
      (payload) => {
        const incoming = payload as unknown as MessageDTO;
        if (!incoming?.id) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;

          if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
            if (isNearBottom) {
              setTimeout(() => scrollToBottom(true), 40);
            }
          }

          return [...prev, incoming];
        });
      },
      (status) => {
        wsConnected = status === "SUBSCRIBED";
      }
    );

    // B. Adaptive heartbeat: 25s if WebSocket is active, 8s fallback if disconnected
    const interval = setInterval(() => {
      if (document.hidden) return; // Tab is asleep
      syncLatestDelta();
    }, wsConnected ? 25000 : 8000);

    // C. Instant wake-up sync when tab is focused / restored
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        syncLatestDelta();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [projectId, syncLatestDelta, scrollToBottom]);

  // Scroll listener for top reverse-infinite loading
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight > clientHeight + 60 && scrollTop < 20 && hasMore && !isLoadingOlder) {
      loadOlderMessages();
    }
  };

  // Send message handler
  const handleSendMessage = async (content: string) => {
    const res = await sendMessage({ projectId, content });
    if (res.success && res.data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data!.id)) return prev;
        return [...prev, res.data!];
      });
      setTimeout(() => scrollToBottom(true), 30);
      return { success: true };
    }
    if (res.blocked) {
      // Zero leak policy: Do NOT append or render blocked message in the chat stream
      return { success: false, blocked: true, warning: res.warning };
    }
    return { success: false, warning: res.error?.message };
  };

  if (isLoading) {
    return (
      <div className={`h-full min-h-0 p-12 bg-[#01142B] border border-white/10 rounded-[4px] flex flex-col items-center justify-center ${className}`}>
        <LoadingState variant="card" />
      </div>
    );
  }

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
              <Badge variant="sky" className="text-[0.625rem] font-mono">
                {projectInfo?.masterStatus.replace(/_/g, " ") || "ACTIVE"}
              </Badge>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5 line-clamp-1">
              {projectInfo?.researchTitle || "Research Study Discussion"}
            </h2>
          </div>
        </div>

        {/* Participants Summary */}
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

        {/* Empty State */}
        {messages.length === 0 ? (
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
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

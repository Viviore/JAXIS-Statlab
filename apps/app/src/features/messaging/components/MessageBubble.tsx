"use client";

import React from "react";
import type { MessageDTO } from "../schemas";
import { Badge } from "@repo/ui";
import {
  IconAlertTriangle,
  IconCheck,
  IconChecks,
  IconShieldCheck,
} from "@tabler/icons-react";

interface MessageBubbleProps {
  message: MessageDTO;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isMine, senderName, senderRole, content, sentAt, isBlocked, blockedReason, isRead } = message;

  const timeFormatted = new Date(sentAt).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateFormatted = new Date(sentAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  // Role Badge Variant Mapping
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "CLIENT":
        return <Badge variant="sky" className="text-[0.625rem] font-mono px-1.5 py-0">Client</Badge>;
      case "STATISTICIAN":
        return <Badge variant="emerald" className="text-[0.625rem] font-mono px-1.5 py-0">Statistician</Badge>;
      case "SENIOR_QA_LEAD":
        return <Badge variant="secondary" className="text-[0.625rem] font-mono px-1.5 py-0">QA Lead</Badge>;
      case "ADMIN":
        return <Badge variant="accent" className="text-[0.625rem] font-mono px-1.5 py-0">Manager</Badge>;
      case "CEO":
        return <Badge variant="amber" className="text-[0.625rem] font-mono px-1.5 py-0">CEO</Badge>;
      default:
        return <Badge variant="muted" className="text-[0.625rem] font-mono px-1.5 py-0">{role}</Badge>;
    }
  };

  if (isBlocked) {
    return (
      <div className={`flex flex-col gap-1.5 max-w-xl my-2 ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}>
        <div className="flex items-center gap-2 text-xs font-sans text-white/50">
          <span className="font-semibold text-white/80">{senderName}</span>
          {getRoleBadge(senderRole)}
          <span>&bull; {timeFormatted}</span>
        </div>

        <div className="p-4 rounded-[4px] bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-sans flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-red-300 font-bold uppercase tracking-wider text-[0.688rem]">
            <IconAlertTriangle size={15} stroke={2.5} className="text-red-400 shrink-0" />
            <span>Message Blocked by Communication Firewall</span>
          </div>
          <p className="text-white/70 italic line-clamp-3">
            &ldquo;{content}&rdquo;
          </p>
          <div className="pt-2 border-t border-red-500/20 text-[0.688rem] text-red-300">
            <strong>Reason:</strong> Prohibited {blockedReason?.replace(/_/g, " ").toLowerCase() || "external contact info"} detected. This message was NOT delivered to recipients.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-xl my-1.5 ${
        isMine ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      {/* Sender Header */}
      <div className="flex items-center gap-2 text-xs font-sans text-white/60 px-1">
        <span className="font-semibold text-white/90">{senderName}</span>
        {getRoleBadge(senderRole)}
        <span className="text-white/40 text-[0.688rem]">&bull; {dateFormatted} {timeFormatted}</span>
      </div>

      {/* Bubble Container */}
      <div
        className={`p-3.5 sm:p-4 rounded-[4px] border text-sm font-sans leading-relaxed whitespace-pre-wrap break-words ${
          isMine
            ? "bg-[#011B38] border-white/20 text-white"
            : "bg-[#01142B] border-white/10 text-white/90"
        }`}
      >
        {content}
      </div>

      {/* Footer Delivery & Read Receipts */}
      {isMine && (
        <div className="flex items-center gap-1.5 text-[0.688rem] font-sans text-white/40 px-1">
          {isRead ? (
            <>
              <IconChecks size={14} stroke={2} className="text-sky-400" />
              <span>Read</span>
            </>
          ) : (
            <>
              <IconCheck size={14} stroke={2} className="text-white/40" />
              <span>Delivered</span>
            </>
          )}
          <span className="mx-1">&bull;</span>
          <span className="flex items-center gap-0.5 text-emerald-400/80">
            <IconShieldCheck size={12} stroke={2} />
            <span>Encrypted</span>
          </span>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui";
import {
  IconSend,
  IconShieldLock,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<{ success: boolean; blocked?: boolean; warning?: string }>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [content, setContent] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [firewallError, setFirewallError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSending || disabled) return;

    setFirewallError(null);
    setIsSending(true);

    try {
      const res = await onSendMessage(content.trim());
      if (res.success) {
        setContent("");
      } else if (res.blocked) {
        setFirewallError(
          res.warning || "Your message was blocked. Sharing external contact info, direct payments, or outside chat links is prohibited."
        );
      }
    } catch {
      setFirewallError("An unexpected error occurred while sending your message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full font-sans">
      {/* Firewall Warning Alert Banner */}
      {firewallError && (
        <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-[2px] flex items-start justify-between gap-3 text-xs text-red-200 animate-content-fade">
          <div className="flex items-start gap-2.5">
            <IconAlertTriangle size={18} stroke={2} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300 block">Firewall Block Notice</span>
              <p className="text-white/80 mt-0.5 leading-relaxed">{firewallError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFirewallError(null)}
            className="text-white/50 hover:text-white cursor-pointer"
            aria-label="Dismiss warning"
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            disabled={disabled || isSending}
            maxLength={5000}
            rows={3}
            className="w-full p-3.5 sm:p-4 rounded-[2px] bg-[#01142B] border border-white/15 text-sm text-white placeholder:text-white/30 focus:border-[#CC6600] focus:outline-none transition-colors resize-none disabled:opacity-50 font-sans"
          />

          {/* Bottom Action Row inside/below textarea */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1.5 text-[0.688rem] text-white/40 font-sans">
              <IconShieldLock size={14} stroke={1.5} className="text-[#CC6600]" />
              <span>In-app communication firewall active &bull; Max 5,000 characters</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/40">
                {content.length} / 5000
              </span>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!content.trim() || disabled || isSending}
                loading={isSending}
                className="cursor-pointer text-xs font-semibold rounded-[2px] px-4 py-2"
              >
                <IconSend size={15} stroke={2} className="mr-1.5" />
                <span>Send</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

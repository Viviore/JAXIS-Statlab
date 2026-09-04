"use client";

import React, { useState, useEffect, useCallback, useOptimistic, startTransition } from "react";
import Link from "next/link";
import {
  LoadingState,
  Toast,
} from "@repo/ui";
import {
  getInAppAlertsAction,
  markAlertReadAction,
  markAllAlertsReadAction,
} from "@/features/notifications/actions";
import type { InAppAlertDTO } from "@/features/notifications/schemas";
import {
  IconBell,
  IconCheck,
  IconClock,
  IconFileText,
  IconGavel,
  IconShieldCheck,
  IconX,
  IconArrowRight,
  IconAlertTriangle,
  IconInbox,
} from "@tabler/icons-react";

type OptimisticAction =
  | { type: "MARK_READ"; alertId: string }
  | { type: "MARK_ALL_READ" };

interface NotificationState {
  alerts: InAppAlertDTO[];
  unreadCount: number;
}

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<InAppAlertDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNREAD">("ALL");
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const [optimisticState, setOptimisticState] = useOptimistic(
    { alerts, unreadCount },
    (state: NotificationState, action: OptimisticAction): NotificationState => {
      switch (action.type) {
        case "MARK_READ": {
          const isAlertUnread = state.alerts.some((a) => a.id === action.alertId && !a.isRead);
          return {
            alerts: state.alerts.map((a) =>
              a.id === action.alertId ? { ...a, isRead: true } : a
            ),
            unreadCount: isAlertUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }
        case "MARK_ALL_READ": {
          return {
            alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
            unreadCount: 0,
          };
        }
        default:
          return state;
      }
    }
  );

  const loadAlerts = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await getInAppAlertsAction();
      if (res.success && res.data) {
        setAlerts(res.data.alerts);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts(true);

    const poll = () => {
      // Sleep background poll if tab is hidden/minimized
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      loadAlerts(false);
    };

    // Refresh alerts periodically (every 45 seconds) when active
    const interval = setInterval(poll, 45000);

    // Refresh immediately when user returns to tab
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadAlerts(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadAlerts]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleMarkRead = (alertId: string) => {
    const prevAlerts = alerts;
    const prevUnreadCount = unreadCount;

    startTransition(async () => {
      // 1. Instantly update the UI optimistically (0ms)
      setOptimisticState({ type: "MARK_READ", alertId });

      try {
        const res = await markAlertReadAction({ alertId });
        if (res && !res.success) {
          throw new Error(res.error?.message || "Failed to mark alert as read");
        }
        // 2. Commit real state
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark alert as read:", err);
        // 3. Roll back state on failure and alert the user
        setAlerts(prevAlerts);
        setUnreadCount(prevUnreadCount);
        setToastMessage({
          message: "Sync Failed",
          description: "Could not update notification. Please try again.",
          variant: "danger",
        });
      }
    });
  };

  const handleMarkAllRead = () => {
    const prevAlerts = alerts;
    const prevUnreadCount = unreadCount;

    startTransition(async () => {
      // 1. Instantly update the UI optimistically (0ms)
      setOptimisticState({ type: "MARK_ALL_READ" });

      try {
        const res = await markAllAlertsReadAction();
        if (res && !res.success) {
          throw new Error(res.error?.message || "Failed to mark all alerts as read");
        }
        // 2. Commit real state
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        setUnreadCount(0);
        setToastMessage({
          message: "All Marked as Read",
          description: "All unread notifications have been marked as read.",
          variant: "success",
        });
      } catch (err) {
        console.error("Failed to mark all as read:", err);
        // 3. Roll back state on failure
        setAlerts(prevAlerts);
        setUnreadCount(prevUnreadCount);
        setToastMessage({
          message: "Sync Failed",
          description: "Could not update notifications. Please try again.",
          variant: "danger",
        });
      }
    });
  };

  const filteredAlerts = optimisticState.alerts.filter((a) => {
    if (filterTab === "UNREAD") return !a.isRead;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "NEW_INTAKE":
        return <IconInbox size={16} className="text-sky-400" />;
      case "QA_SUBMISSION":
        return <IconShieldCheck size={16} className="text-emerald-400" />;
      case "PRE_DEADLINE":
        return <IconClock size={16} className="text-amber-400" />;
      case "ETHICAL_BREACH":
        return <IconAlertTriangle size={16} className="text-red-400" />;
      case "CLAIM_FILED":
      case "DISPUTE":
        return <IconGavel size={16} className="text-[#CC6600]" />;
      default:
        return <IconFileText size={16} className="text-white/60" />;
    }
  };

  return (
    <>
      {/* Bell Trigger Button with Cursor Pointer & Smooth Hover */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadAlerts();
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-[4px] text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all duration-150 focus:outline-none cursor-pointer group"
      >
        <IconBell
          size={18}
          stroke={1.5}
          className="transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110"
        />
        {optimisticState.unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#CC6600] text-white font-mono text-[0.625rem] font-bold ring-2 ring-[#010114] animate-pulse">
            {optimisticState.unreadCount > 9 ? "9+" : optimisticState.unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Drawer Backdrop & Panel with Bi-directional Open & Close Animations */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden select-none transition-all duration-300 ease-in-out ${
          isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {/* Backdrop Fade In / Fade Out */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ease-in-out cursor-pointer ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Container Slide In / Slide Out */}
        <div
          className={`absolute inset-y-0 right-0 max-w-md w-full bg-[#01142B] border-l border-white/15 shadow-2xl flex flex-col justify-between font-sans transition-transform duration-300 ease-in-out will-change-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#000E1F]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-[4px] bg-[#CC6600]/15 text-[#CC6600]">
                <IconBell size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-none">Notifications</h2>
                <span className="text-[0.688rem] text-white/40">
                  {optimisticState.unreadCount} unread {optimisticState.unreadCount === 1 ? "alert" : "alerts"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {optimisticState.unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[0.688rem] text-sky-400 hover:text-sky-300 hover:underline px-2 py-1 cursor-pointer transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white p-1 rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <IconX size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-5 py-2.5 bg-black/20 border-b border-white/5 flex gap-2">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1 rounded-[2px] text-xs font-semibold cursor-pointer transition-all duration-150 ${
                filterTab === "ALL"
                  ? "bg-[#CC6600] text-white shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              All ({optimisticState.alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("UNREAD")}
              className={`px-3 py-1 rounded-[2px] text-xs font-semibold cursor-pointer transition-all duration-150 ${
                filterTab === "UNREAD"
                  ? "bg-[#CC6600] text-white shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Unread ({optimisticState.unreadCount})
            </button>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <LoadingState variant="inline" label="Checking notifications..." />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex-1 min-h-full my-auto flex flex-col items-center justify-center text-center text-xs text-white/40 gap-3 px-6 py-12">
                <div className="p-3 rounded-full bg-white/[0.04] border border-white/10 text-white/30">
                  <IconShieldCheck size={32} stroke={1.5} />
                </div>
                <div className="flex flex-col gap-1 max-w-[240px]">
                  <span className="font-semibold text-white/70 text-xs">
                    {filterTab === "UNREAD" ? "All Caught Up" : "No Notifications"}
                  </span>
                  <span className="text-[0.688rem] leading-relaxed text-white/40">
                    {filterTab === "UNREAD"
                      ? "You have zero unread alerts right now."
                      : "No notification history found for your account."}
                  </span>
                </div>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-[4px] border transition-all duration-150 flex flex-col gap-2 ${
                    alert.isRead
                      ? "bg-black/20 border-white/5 text-white/70 hover:border-white/10"
                      : "bg-[#011B38] border-white/15 text-white shadow-sm hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.alertType)}
                      <span className="font-mono text-[0.688rem] uppercase text-white/50 font-bold">
                        {alert.alertType.replace(/_/g, " ")}
                      </span>
                      {alert.projectIntakeId && (
                        <span className="font-mono text-[0.688rem] text-sky-400 font-semibold">
                          {alert.projectIntakeId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.625rem] text-white/40 font-mono">
                        {new Date(alert.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!alert.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(alert.id)}
                          title="Mark as read"
                          className="text-white/40 hover:text-emerald-400 p-0.5 transition-colors cursor-pointer"
                        >
                          <IconCheck size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-white/90">
                    {alert.message}
                  </p>

                  {alert.linkUrl && (
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={alert.linkUrl}
                        onClick={() => {
                          if (!alert.isRead) handleMarkRead(alert.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[0.688rem] text-[#CC6600] hover:text-[#e67300] font-semibold transition-colors cursor-pointer group/link"
                      >
                        <span>Open Workspace</span>
                        <IconArrowRight
                          size={12}
                          className="transition-transform group-hover/link:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-[#000E1F] flex justify-between items-center text-[0.688rem] text-white/40">
            <span>JAXIS Operational Notification Center</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}

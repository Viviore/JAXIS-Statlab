import { supabaseClient } from "@/lib/supabase";

/**
 * Subscribes to Supabase Realtime broadcast channel for a specific project.
 * Returns an unsubscribe teardown function for useEffect cleanup.
 */
export function subscribeToProjectMessages(
  projectId: string,
  onMessage: (payload: Record<string, unknown>) => void,
  onStatus?: (status: string) => void
): () => void {
  if (!projectId || typeof window === "undefined" || !supabaseClient) {
    return () => {};
  }

  try {
    const channel = supabaseClient
      .channel(`project-messages:${projectId}`)
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        if (payload) {
          onMessage(payload);
        }
      })
      .subscribe((status) => {
        if (onStatus) onStatus(status);
        if (status === "CHANNEL_ERROR") {
          console.warn(`[Realtime] Channel error for project ${projectId}. Adaptive polling active.`);
        }
      });

    return () => {
      try {
        supabaseClient.removeChannel(channel);
      } catch {
        // ignore teardown errors
      }
    };
  } catch (err) {
    console.warn("[Realtime] Subscription error. Polling fallback active.", err);
    return () => {};
  }
}

import { schedules } from "@trigger.dev/sdk/v3";

/**
 * QA SLA Revision Countdown
 * Runs every 15 minutes — monitors active QA revision deadlines
 * and flags overdue items or sends reminder alerts.
 */
export const qaSlaMonitor = schedules.task({
  id: "qa-sla-revision-countdown",
  cron: "*/15 * * * *", // Every 15 minutes
  maxDuration: 60,
  run: async () => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/v1/crons/qa-sla-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`QA SLA check failed: ${err}`);
    }

    const data = await res.json();
    console.log(
      `[QA SLA] Checked ${data.checkedCount || 0} active revisions, ${data.overdueCount || 0} overdue`
    );

    return {
      checkedCount: data.checkedCount || 0,
      overdueCount: data.overdueCount || 0,
      timestamp: new Date().toISOString(),
    };
  },
});

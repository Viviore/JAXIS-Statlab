import { schedules } from "@trigger.dev/sdk/v3";

/**
 * 14-Hour Shift Safety Monitor
 * Runs every 30 minutes — checks for staff members who have been
 * clocked in for 14+ hours and creates safety alerts.
 */
export const shiftSafetyMonitor = schedules.task({
  id: "shift-safety-14h-monitor",
  cron: "*/30 * * * *", // Every 30 minutes
  maxDuration: 60,
  run: async () => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/v1/crons/shift-safety`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Shift safety check failed: ${err}`);
    }

    const data = await res.json();
    console.log(
      `[Shift Safety] Checked ${data.activeShifts || 0} active shifts, ${data.flaggedCount || 0} exceeded 14h`
    );

    return {
      activeShifts: data.activeShifts || 0,
      flaggedCount: data.flaggedCount || 0,
      timestamp: new Date().toISOString(),
    };
  },
});

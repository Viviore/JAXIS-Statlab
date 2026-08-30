import { schedules } from "@trigger.dev/sdk/v3";

/**
 * Storage Purge Engine
 * Runs daily at midnight UTC — deletes expired study file attachments
 * from Cloudflare R2 based on the CEO's configured retention policy.
 */
export const storagePurgeEngine = schedules.task({
  id: "storage-purge-engine",
  cron: "0 0 * * *", // Every day at 00:00 UTC
  maxDuration: 300,
  run: async () => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/v1/crons/storage-purge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Storage purge failed: ${err}`);
    }

    const data = await res.json();
    console.log(
      `[Storage Purge] Cleaned ${data.purgedCount || 0} expired files, freed ${data.freedMB || 0} MB`
    );

    return {
      purgedCount: data.purgedCount || 0,
      freedMB: data.freedMB || 0,
      timestamp: new Date().toISOString(),
    };
  },
});

import { schedules } from "@trigger.dev/sdk/v3";

/**
 * Deposit Expiry Checker
 * Runs every hour — auto-expires client deposits that haven't been
 * paid within 3 days of SOW signing.
 */
export const depositExpiryChecker = schedules.task({
  id: "deposit-expiry-checker",
  cron: "0 * * * *", // Every hour at :00
  maxDuration: 120,
  run: async () => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/v1/crons/deposit-expiry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Deposit expiry check failed: ${err}`);
    }

    const data = await res.json();
    console.log(
      `[Deposit Expiry] Expired ${data.expiredCount || 0} unpaid deposits`
    );

    return {
      expiredCount: data.expiredCount || 0,
      timestamp: new Date().toISOString(),
    };
  },
});

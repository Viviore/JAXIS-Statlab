import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Wraps a Prisma query with a fast timeout in development.
 * Prevents Windows TCP socket hangs and speeds up fallback when PostgreSQL is slow/offline.
 */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = env.NODE_ENV === "development" ? 15000 : 10000
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("DB_TIMEOUT")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

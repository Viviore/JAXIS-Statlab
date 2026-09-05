import { revalidateTag, updateTag } from "next/cache";

/**
 * Canonical Cache Tags for In-Memory Server Caching
 */
export const CACHE_TAGS = {
  PROJECTS: "projects",
  STAFF_CAPACITY: "staff-capacity",
  STAFF_DIRECTORY: "staff-directory",
  ATTENDANCE_REVIEW: "attendance-review",
  PAYROLL: "payroll-data",
} as const;

/**
 * Safely invalidates one or more cache tags.
 */
export function invalidateCacheTags(...tags: string[]): void {
  for (const tag of tags) {
    try {
      if (typeof updateTag === "function") {
        updateTag(tag);
      }
      if (typeof revalidateTag === "function") {
        revalidateTag(tag, "default");
      }
    } catch {
      // Revalidation may fail if called outside of request context (e.g. scripts/seed)
    }
  }
}

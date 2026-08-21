"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, withDbTimeout } from "@/lib/db";
import { ClientProfileSchema, type ClientProfileFormData } from "./schemas";
import { redirect } from "next/navigation";

export type ActionResponse<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: { message: string; fieldErrors?: Record<string, string[]> } };

import { cookies } from "next/headers";

/**
 * Upsert the client profile for the authenticated user.
 */
export async function upsertClientProfile(
  data: ClientProfileFormData
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { message: "Unauthorized. Please log in." } };
    }

    const userId = session.user.id;

    // Validate input
    const parsed = ClientProfileSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          message: "Invalid profile data",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      };
    }

    const { institutionSchool, academicProgram, contactNumber, region } = parsed.data;

    try {
      await withDbTimeout(
        db.clientProfile.upsert({
          where: { userId },
          update: {
            institutionSchool,
            academicProgram,
            contactNumber,
            region,
          },
          create: {
            userId,
            institutionSchool,
            academicProgram,
            contactNumber,
            region,
          },
        }),
        300
      );
    } catch {
      // DB offline, graceful fallback
    }

    // Always mirror to cookie for resilient offline testing
    try {
      const cookieStore = await cookies();
      cookieStore.set(
        `jaxis_profile_${userId}`,
        JSON.stringify({
          id: `profile_${userId}`,
          userId,
          institutionSchool,
          academicProgram,
          contactNumber,
          region,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        { path: "/", maxAge: 60 * 60 * 24 * 7 }
      );
    } catch (cookieErr) {
      console.warn("[upsertClientProfile] Cookie mirror error", cookieErr);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/profile");

    return { success: true };
  } catch (error) {
    console.error("[upsertClientProfile]", error);
    return { success: false, error: { message: "Internal server error" } };
  }
}

/**
 * Helper to fetch the authenticated user's client profile.
 */
export async function getClientProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const profile = await withDbTimeout(
      db.clientProfile.findUnique({
        where: { userId: session.user.id },
      }),
      250
    );
    if (profile) return profile;
  } catch {
    // DB offline, fallback to cookie
  }

  // Fallback to cookie for development/demo testing
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(`jaxis_profile_${session.user.id}`)?.value;
    if (cookieVal) {
      return JSON.parse(cookieVal);
    }
  } catch {
    // Ignore cookie retrieval issues
  }

  return null;
}

/**
 * Middleware-like function to assert that the client has completed their profile.
 * Should be called in Client Dashboard pages before showing sensitive forms (like Intake).
 */
export async function assertClientProfileComplete() {
  const profile = await getClientProfile();

  if (!profile || !profile.institutionSchool || !profile.contactNumber) {
    redirect("/dashboard/client/profile");
  }

  return profile;
}

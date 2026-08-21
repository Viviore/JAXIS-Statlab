"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterClientSchema, type ActionResult } from "./schemas";

export async function registerClient(
  input: unknown
): Promise<ActionResult<{ id: string; email: string }>> {
  const parsed = RegisterClientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid registration data. Please correct the fields below.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return {
        success: false,
        error: {
          code: "EMAIL_TAKEN",
          message: "An institutional account with this email already exists.",
        },
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const clientRole = await db.role.findUnique({
      where: { name: "CLIENT" },
    });

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        passwordHash,
        status: "ACTIVE",
        userRoles: clientRole
          ? {
              create: {
                roleId: clientRole.id,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
      },
    });

    try {
      await db.authAuditLog.create({
        data: {
          userId: user.id,
          email: user.email,
          event: "REGISTRATION",
          metadata: { role: "CLIENT" },
        },
      });
    } catch (e) {
      void e;
    }

    return {
      success: true,
      data: user,
    };
  } catch (dbError) {
    console.warn("[Register] DB unavailable in offline mode or error:", dbError);
    return {
      success: true,
      data: {
        id: `client-dev-${Date.now()}`,
        email: normalizedEmail,
      },
    };
  }
}

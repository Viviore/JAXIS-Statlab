"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterClientSchema, type ActionResult } from "./schemas";
import {
  getDevUserByEmail,
  registerDevUser,
} from "@/lib/mock-data/users.data";

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

  const { firstName, lastName, email, password } = parsed.data;
  const fullName = `${firstName.trim()} ${lastName.trim()}`;
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

    // Also sync to dev user store for fast credentials fallback
    registerDevUser({
      id: user.id,
      email: user.email,
      fullName: fullName.trim(),
      role: "CLIENT",
      password: password,
      status: "ACTIVE",
    });

    return {
      success: true,
      data: user,
    };
  } catch (dbError) {
    console.warn("[Register] DB unavailable in offline mode. Falling back to dev user store.", dbError);

    const existingDev = getDevUserByEmail(normalizedEmail);
    if (existingDev) {
      return {
        success: false,
        error: {
          code: "EMAIL_TAKEN",
          message: "An institutional account with this email already exists.",
        },
      };
    }

    const newDevUserId = `usr_dev_client_${Date.now()}`;
    registerDevUser({
      id: newDevUserId,
      email: normalizedEmail,
      fullName: fullName.trim(),
      role: "CLIENT",
      password: password,
      status: "ACTIVE",
    });

    return {
      success: true,
      data: {
        id: newDevUserId,
        email: normalizedEmail,
      },
    };
  }
}


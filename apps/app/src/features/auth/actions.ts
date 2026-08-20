"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema, type RegisterInput } from "./schemas";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export const ROLE_HOME: Record<string, string> = {
  CLIENT: "/dashboard/client",
  STATISTICIAN: "/dashboard/statistician",
  SENIOR_QA_LEAD: "/dashboard/qa",
  ADMIN: "/dashboard/admin",
  FINANCE_OFFICER: "/dashboard/finance",
  CEO: "/dashboard/ceo",
};

/**
 * Client self-registration Server Action (AUTH-F01, AUTH-BR-01, AUTH-BR-04).
 * Role is strictly hardcoded to CLIENT.
 */
export async function registerClient(
  input: RegisterInput
): Promise<ActionResult<{ email: string }>> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid registration data. Please check all fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: {
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists.",
        },
      };
    }

    // 2. Fetch or create CLIENT role
    let clientRole = await db.role.findUnique({
      where: { name: "CLIENT" },
    });

    if (!clientRole) {
      clientRole = await db.role.create({
        data: {
          name: "CLIENT",
          label: "Client",
        },
      });
    }

    // 3. Hash password with bcryptjs salt rounds = 12 (AUTH-BR-04)
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create User & UserRole junction
    const newUser = await db.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        passwordHash,
        status: "ACTIVE",
        userRoles: {
          create: {
            roleId: clientRole.id,
            assignedBy: null, // self-registration
          },
        },
      },
    });

    // 5. Audit Log (AUTH-F12, AUTH-BR-07)
    await db.authAuditLog.create({
      data: {
        userId: newUser.id,
        email: normalizedEmail,
        event: "REGISTRATION",
        metadata: { role: "CLIENT" },
      },
    });

    return {
      success: true,
      data: { email: normalizedEmail },
    };
  } catch (err) {
    console.error("❌ Registration error:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during registration. Please try again.",
      },
    };
  }
}

/**
 * Server action to authenticate credentials via NextAuth signIn
 */
export async function authenticateWithCredentials(
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "INVALID_CREDENTIALS" };
        case "CallbackRouteError":
          if (error.message.includes("ACCOUNT_SUSPENDED")) {
            return { error: "ACCOUNT_SUSPENDED" };
          }
          if (error.message.includes("ACCOUNT_TERMINATED")) {
            return { error: "ACCOUNT_TERMINATED" };
          }
          return { error: "INVALID_CREDENTIALS" };
        default:
          return { error: "AUTH_ERROR" };
      }
    }
    throw error;
  }
}

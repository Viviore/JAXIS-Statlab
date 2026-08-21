"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, withDbTimeout } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  ProvisionStaffSchema,
  SuspendStaffSchema,
  TerminateStaffSchema,
  UpdateStaffProfileSchema,
  StaffFilterSchema,
  type StaffListItem,
  type StaffDetailItem,
  type StaffActionResult,
} from "./schemas";
import {
  getDevUsers,
  getDevUserByEmail,
  registerDevUser,
  type MockUser,
} from "@/lib/mock-data/users.data";
import type { RoleName, UserStatus, ViolationType } from "@prisma/client";

/**
 * 1. Provision a new internal staff member (Statistician, QA Lead, Finance Officer).
 * Accessible only to ADMIN and CEO.
 */
export async function provisionStaff(
  input: unknown
): Promise<StaffActionResult<{ id: string; email: string; fullName: string; role: RoleName; temporaryPassword: string }>> {
  const session = await requireRole("ADMIN", "CEO");

  const parsed = ProvisionStaffSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid staff provisioning parameters.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { fullName, email, role, specializations, bio } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Generate secure temporary password: e.g. JAXIS-A1B2C3D4
  const temporaryPassword = `JAXIS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return {
        success: false,
        error: {
          code: "EMAIL_TAKEN",
          message: "An institutional or staff account with this email already exists.",
        },
      };
    }

    const targetRole = await db.role.findUnique({
      where: { name: role },
    });

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        passwordHash,
        status: "ACTIVE",
        userRoles: targetRole
          ? {
              create: {
                roleId: targetRole.id,
                assignedBy: session.user.id,
              },
            }
          : undefined,
        staffProfile: {
          create: {
            bio: bio?.trim() || null,
            specializations,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    // Mirror to dev store for fast development login fallback
    registerDevUser({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role,
      password: temporaryPassword,
      status: "ACTIVE",
      staffProfile: {
        bio: bio?.trim(),
        specializations,
        joinedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        temporaryPassword,
      },
    };
  } catch (dbError) {
    console.warn("[ProvisionStaff] DB unavailable in offline mode. Syncing with dev user store.", dbError);

    const existingDev = getDevUserByEmail(normalizedEmail);
    if (existingDev) {
      return {
        success: false,
        error: {
          code: "EMAIL_TAKEN",
          message: "A dev staff account with this email already exists.",
        },
      };
    }

    const devId = `usr_dev_staff_${Date.now()}`;
    const devUser: MockUser = {
      id: devId,
      email: normalizedEmail,
      fullName: fullName.trim(),
      role,
      password: temporaryPassword,
      status: "ACTIVE",
      staffProfile: {
        bio: bio?.trim(),
        specializations,
        joinedAt: new Date().toISOString(),
      },
    };

    registerDevUser(devUser);

    return {
      success: true,
      data: {
        id: devId,
        email: normalizedEmail,
        fullName: fullName.trim(),
        role,
        temporaryPassword,
      },
    };
  }
}

/**
 * 2. Query internal staff roster directory with role, status, and search filters.
 * Accessible to ADMIN and CEO.
 */
export async function getStaffRoster(
  filters?: unknown
): Promise<StaffActionResult<StaffListItem[]>> {
  await requireRole("ADMIN", "CEO");

  const parsed = StaffFilterSchema.safeParse(filters || {});
  const { role = "ALL", status = "ALL", search = "" } = parsed.success ? parsed.data : { role: "ALL", status: "ALL", search: "" };

  const targetRoles: RoleName[] =
    role === "ALL"
      ? ["STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER"]
      : [role as RoleName];

  try {
    const users = await withDbTimeout(
      db.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                name: { in: targetRoles },
              },
            },
          },
          ...(status !== "ALL" ? { status: status as UserStatus } : {}),
          ...(search.trim()
            ? {
                OR: [
                  { fullName: { contains: search.trim(), mode: "insensitive" } },
                  { email: { contains: search.trim(), mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          userRoles: {
            include: { role: true },
          },
          staffProfile: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );

    const roster: StaffListItem[] = users.map((u) => {
      const primaryRole = (u.userRoles[0]?.role.name as RoleName) || "STATISTICIAN";
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: primaryRole,
        status: u.status,
        specializations: u.staffProfile?.specializations || [],
        bio: u.staffProfile?.bio || null,
        activeProjectsCount: 0, // Computed in Module 08
        joinedAt: u.staffProfile?.joinedAt || u.createdAt,
      };
    });

    return { success: true, data: roster };
  } catch (dbError) {
    console.warn("[GetStaffRoster] DB unavailable in offline mode. Reading from dev user store.", dbError);

    const devUsers = Object.values(getDevUsers());
    const roster: StaffListItem[] = devUsers
      .filter((u) => targetRoles.includes(u.role))
      .filter((u) => (status === "ALL" ? true : u.status === status))
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase().trim();
        return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        specializations: u.staffProfile?.specializations || [],
        bio: u.staffProfile?.bio || null,
        activeProjectsCount: 0,
        joinedAt: u.staffProfile?.joinedAt || new Date().toISOString(),
      }));

    return { success: true, data: roster };
  }
}

/**
 * 3. Retrieve detailed staff profile with full suspension audit history.
 * Accessible to ADMIN and CEO.
 */
export async function getStaffDetail(
  id: string
): Promise<StaffActionResult<StaffDetailItem>> {
  await requireRole("ADMIN", "CEO");

  try {
    const user = await withDbTimeout(
      db.user.findUnique({
        where: { id },
        include: {
          userRoles: { include: { role: true } },
          staffProfile: true,
          suspensionLogs: {
            orderBy: { performedAt: "desc" },
          },
        },
      })
    );

    if (!user) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Staff member not found." },
      };
    }

    const primaryRole = (user.userRoles[0]?.role.name as RoleName) || "STATISTICIAN";

    const detail: StaffDetailItem = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: primaryRole,
      status: user.status,
      specializations: user.staffProfile?.specializations || [],
      bio: user.staffProfile?.bio || null,
      activeProjectsCount: 0,
      joinedAt: user.staffProfile?.joinedAt || user.createdAt,
      updatedAt: user.staffProfile?.updatedAt || user.updatedAt,
      suspensionLogs: user.suspensionLogs.map((log) => ({
        id: log.id,
        action: log.action,
        reason: log.reason,
        violationType: log.violationType,
        performedBy: log.performedBy,
        performedAt: log.performedAt,
        liftedAt: log.liftedAt,
        liftedBy: log.liftedBy,
      })),
    };

    return { success: true, data: detail };
  } catch (dbError) {
    console.warn("[GetStaffDetail] DB unavailable in offline mode. Reading from dev user store.", dbError);

    const devUsers = Object.values(getDevUsers());
    const devUser = devUsers.find((u) => u.id === id || u.email === id);

    if (!devUser) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Dev staff member not found." },
      };
    }

    const detail: StaffDetailItem = {
      id: devUser.id,
      fullName: devUser.fullName,
      email: devUser.email,
      phone: null,
      role: devUser.role,
      status: devUser.status,
      specializations: devUser.staffProfile?.specializations || [],
      bio: devUser.staffProfile?.bio || null,
      activeProjectsCount: 0,
      joinedAt: devUser.staffProfile?.joinedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suspensionLogs: [],
    };

    return { success: true, data: detail };
  }
}

/**
 * 4. Temporarily suspend a staff member with mandatory reason logging.
 * Accessible to ADMIN and CEO.
 */
export async function suspendStaff(
  id: string,
  input: unknown
): Promise<StaffActionResult<{ id: string; status: UserStatus }>> {
  const session = await requireRole("ADMIN", "CEO");

  const parsed = SuspendStaffSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid suspension parameters.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { reason, violationType } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Staff member not found." },
      };
    }

    // Protection rule: Cannot suspend fellow Admins or CEO via standard staff desk
    const roleName = user.userRoles[0]?.role.name;
    if (roleName === "ADMIN" || roleName === "CEO") {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Administrative and Executive accounts cannot be suspended through staff management.",
        },
      };
    }

    await db.$transaction([
      db.user.update({
        where: { id },
        data: { status: "SUSPENDED" },
      }),
      db.suspensionLog.create({
        data: {
          userId: id,
          action: "SUSPENDED",
          reason: reason.trim(),
          violationType: violationType || null,
          performedBy: session.user.id,
        },
      }),
      db.authAuditLog.create({
        data: {
          userId: id,
          email: user.email,
          event: "ACCOUNT_SUSPENDED_BLOCK",
          metadata: { reason, violationType, suspendedBy: session.user.id },
        },
      }),
    ]);

    // Mirror to dev store
    const devUser = getDevUserByEmail(user.email);
    if (devUser) {
      devUser.status = "SUSPENDED";
      registerDevUser(devUser);
    }

    return { success: true, data: { id, status: "SUSPENDED" } };
  } catch (dbError) {
    console.warn("[SuspendStaff] DB offline fallback.", dbError);

    const devUsers = Object.values(getDevUsers());
    const devUser = devUsers.find((u) => u.id === id);
    if (devUser) {
      devUser.status = "SUSPENDED";
      registerDevUser(devUser);
      return { success: true, data: { id, status: "SUSPENDED" } };
    }

    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Staff member not found in dev store." },
    };
  }
}

/**
 * 5. Lift an active suspension and restore staff account to ACTIVE.
 * Accessible to ADMIN and CEO.
 */
export async function liftSuspension(
  id: string
): Promise<StaffActionResult<{ id: string; status: UserStatus }>> {
  const session = await requireRole("ADMIN", "CEO");

  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Staff member not found." },
      };
    }

    const latestSuspension = await db.suspensionLog.findFirst({
      where: { userId: id, action: "SUSPENDED", liftedAt: null },
      orderBy: { performedAt: "desc" },
    });

    await db.$transaction([
      db.user.update({
        where: { id },
        data: { status: "ACTIVE" },
      }),
      latestSuspension
        ? db.suspensionLog.update({
            where: { id: latestSuspension.id },
            data: {
              liftedAt: new Date(),
              liftedBy: session.user.id,
            },
          })
        : db.suspensionLog.create({
            data: {
              userId: id,
              action: "SUSPENSION_LIFTED",
              reason: "Suspension lifted by Administrator / Executive.",
              performedBy: session.user.id,
              liftedAt: new Date(),
              liftedBy: session.user.id,
            },
          }),
    ]);

    // Mirror to dev store
    const devUser = getDevUserByEmail(user.email);
    if (devUser) {
      devUser.status = "ACTIVE";
      registerDevUser(devUser);
    }

    return { success: true, data: { id, status: "ACTIVE" } };
  } catch (dbError) {
    console.warn("[LiftSuspension] DB offline fallback.", dbError);

    const devUsers = Object.values(getDevUsers());
    const devUser = devUsers.find((u) => u.id === id);
    if (devUser) {
      devUser.status = "ACTIVE";
      registerDevUser(devUser);
      return { success: true, data: { id, status: "ACTIVE" } };
    }

    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Staff member not found in dev store." },
    };
  }
}

/**
 * 6. Permanently terminate a staff member.
 * STRICT ENFORCEMENT: Accessible ONLY to CEO role (RULE_ROL_01 / STF-F08).
 */
export async function terminateStaff(
  id: string,
  input: unknown
): Promise<StaffActionResult<{ id: string; status: UserStatus; forfeitPayouts: boolean }>> {
  // Hard RBAC gate: Only CEO can terminate accounts permanently
  const session = await requireRole("CEO");

  const parsed = TerminateStaffSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid termination parameters.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { reason, violationType, forfeitPayouts } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Staff member not found." },
      };
    }

    await db.$transaction([
      db.user.update({
        where: { id },
        data: { status: "TERMINATED" },
      }),
      db.suspensionLog.create({
        data: {
          userId: id,
          action: "TERMINATED",
          reason: `${reason.trim()}${forfeitPayouts ? " [PAYOUT_FORFEITURE_ENFORCED]" : ""}`,
          violationType: violationType as ViolationType,
          performedBy: session.user.id,
        },
      }),
      db.authAuditLog.create({
        data: {
          userId: id,
          email: user.email,
          event: "ACCOUNT_TERMINATED_BLOCK",
          metadata: { reason, violationType, forfeitPayouts, terminatedBy: session.user.id },
        },
      }),
    ]);

    // Mirror to dev store
    const devUser = getDevUserByEmail(user.email);
    if (devUser) {
      devUser.status = "TERMINATED";
      registerDevUser(devUser);
    }

    return {
      success: true,
      data: { id, status: "TERMINATED", forfeitPayouts },
    };
  } catch (dbError) {
    console.warn("[TerminateStaff] DB offline fallback.", dbError);

    const devUsers = Object.values(getDevUsers());
    const devUser = devUsers.find((u) => u.id === id);
    if (devUser) {
      devUser.status = "TERMINATED";
      registerDevUser(devUser);
      return { success: true, data: { id, status: "TERMINATED", forfeitPayouts } };
    }

    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Staff member not found in dev store." },
    };
  }
}

/**
 * 7. Self-edit own professional profile bio and specialization tags.
 * Accessible to any authenticated staff role.
 */
export async function updateOwnProfile(
  input: unknown
): Promise<StaffActionResult<{ bio: string | null; specializations: string[] }>> {
  const session = await requireRole("STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER", "ADMIN", "CEO");

  const parsed = UpdateStaffProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid profile data.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { bio, specializations } = parsed.data;
  const userId = session.user.id;

  try {
    const profile = await db.staffProfile.upsert({
      where: { userId },
      update: {
        bio: bio?.trim() || null,
        specializations,
      },
      create: {
        userId,
        bio: bio?.trim() || null,
        specializations,
      },
    });

    // Mirror to dev store
    const devUser = getDevUserByEmail(session.user.email || "");
    if (devUser) {
      devUser.staffProfile = {
        bio: profile.bio || undefined,
        specializations: profile.specializations,
        updatedAt: new Date().toISOString(),
      };
      registerDevUser(devUser);
    }

    return {
      success: true,
      data: {
        bio: profile.bio,
        specializations: profile.specializations,
      },
    };
  } catch (dbError) {
    console.warn("[UpdateOwnProfile] DB offline fallback.", dbError);

    const devUser = getDevUserByEmail(session.user.email || "");
    if (devUser) {
      devUser.staffProfile = {
        bio: bio?.trim(),
        specializations,
        updatedAt: new Date().toISOString(),
      };
      registerDevUser(devUser);
      return {
        success: true,
        data: {
          bio: bio?.trim() || null,
          specializations,
        },
      };
    }

    return {
      success: false,
      error: { code: "NOT_FOUND", message: "User profile not found in dev store." },
    };
  }
}

/**
 * 8. Retrieve own professional profile data for self-profile editor views.
 * Accessible to any authenticated staff role.
 */
export async function getOwnProfile(): Promise<
  StaffActionResult<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: RoleName;
    status: UserStatus;
    bio: string | null;
    specializations: string[];
    joinedAt: Date | string;
    updatedAt: Date | string;
  }>
> {
  const session = await requireRole("STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER", "ADMIN", "CEO");

  try {
    const user = await withDbTimeout(
      db.user.findUnique({
        where: { id: session.user.id },
        include: {
          userRoles: { include: { role: true } },
          staffProfile: true,
        },
      })
    );

    if (user) {
      const primaryRole = (user.userRoles[0]?.role.name as RoleName) || (session.user.role as RoleName);
      return {
        success: true,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: primaryRole,
          status: user.status,
          bio: user.staffProfile?.bio || null,
          specializations: user.staffProfile?.specializations || [],
          joinedAt: user.staffProfile?.joinedAt || user.createdAt,
          updatedAt: user.staffProfile?.updatedAt || user.updatedAt,
        },
      };
    }
  } catch (dbError) {
    console.warn("[GetOwnProfile] DB offline fallback.", dbError);
  }

  const devUser = getDevUserByEmail(session.user.email || "");
  if (devUser) {
    return {
      success: true,
      data: {
        id: devUser.id,
        fullName: devUser.fullName,
        email: devUser.email,
        phone: null,
        role: devUser.role,
        status: devUser.status,
        bio: devUser.staffProfile?.bio || null,
        specializations: devUser.staffProfile?.specializations || [],
        joinedAt: devUser.staffProfile?.joinedAt || new Date().toISOString(),
        updatedAt: devUser.staffProfile?.updatedAt || new Date().toISOString(),
      },
    };
  }

  return {
    success: false,
    error: { code: "NOT_FOUND", message: "User profile not found." },
  };
}

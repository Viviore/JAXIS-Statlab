import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateOwnProfile } from "@/features/staff/actions";
import { getDevUserByEmail } from "@/lib/mock-data/users.data";
import type { RoleName } from "@prisma/client";

export async function GET() {
  try {
    const session = await requireRole("STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER", "ADMIN", "CEO");

    try {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          userRoles: { include: { role: true } },
          staffProfile: true,
        },
      });

      if (user) {
        const primaryRole = (user.userRoles[0]?.role.name as RoleName) || session.user.role;
        return NextResponse.json({
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
        });
      }
    } catch (dbError) {
      console.warn("[API Staff Profile GET] DB offline fallback.", dbError);
    }

    const devUser = getDevUserByEmail(session.user.email || "");
    if (devUser) {
      return NextResponse.json({
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
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "User profile not found." } },
      { status: 404 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
        { status: 401 }
      );
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access forbidden to staff profile." } },
        { status: 403 }
      );
    }

    console.error("[API Staff Profile GET Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const result = await updateOwnProfile(body);

    if (!result.success) {
      const statusCode =
        result.error.code === "VALIDATION_ERROR"
          ? 422
          : result.error.code === "FORBIDDEN"
            ? 403
            : result.error.code === "UNAUTHENTICATED"
              ? 401
              : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Professional profile updated successfully.",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
        { status: 401 }
      );
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access forbidden." } },
        { status: 403 }
      );
    }

    console.error("[API Staff Profile PATCH Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

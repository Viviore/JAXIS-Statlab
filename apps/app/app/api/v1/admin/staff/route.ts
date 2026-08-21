import { NextResponse } from "next/server";
import { provisionStaff, getStaffRoster } from "@/features/staff/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await provisionStaff(body);

    if (!result.success) {
      const statusCode =
        result.error.code === "EMAIL_TAKEN"
          ? 409
          : result.error.code === "VALIDATION_ERROR"
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
        message: "Staff member provisioned successfully.",
        data: result.data,
      },
      { status: 201 }
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
        { success: false, error: { code: "FORBIDDEN", message: "Access forbidden. Requires ADMIN or CEO role." } },
        { status: 403 }
      );
    }

    console.error("[API Staff Provision Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getStaffRoster({ role, status, search });

    if (!result.success) {
      const statusCode =
        result.error.code === "FORBIDDEN"
          ? 403
          : result.error.code === "UNAUTHENTICATED"
            ? 401
            : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(
      {
        success: true,
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
        { success: false, error: { code: "FORBIDDEN", message: "Access forbidden. Requires ADMIN or CEO role." } },
        { status: 403 }
      );
    }

    console.error("[API Staff List Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

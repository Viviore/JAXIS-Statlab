import { NextResponse } from "next/server";
import { terminateStaff } from "@/features/staff/actions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await terminateStaff(id, body);

    if (!result.success) {
      const statusCode =
        result.error.code === "NOT_FOUND"
          ? 404
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
        message: "Staff account permanently terminated.",
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
        { success: false, error: { code: "FORBIDDEN", message: "Access forbidden. Account termination requires executive CEO authority." } },
        { status: 403 }
      );
    }

    console.error("[API Staff Terminate Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

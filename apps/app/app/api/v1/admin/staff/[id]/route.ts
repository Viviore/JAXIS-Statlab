import { NextResponse } from "next/server";
import { getStaffDetail } from "@/features/staff/actions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getStaffDetail(id);

    if (!result.success) {
      const statusCode =
        result.error.code === "NOT_FOUND"
          ? 404
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

    console.error("[API Staff Detail Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
      },
      { status: 500 }
    );
  }
}

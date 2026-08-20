import { NextResponse } from "next/server";
import { projectService } from "@/features/projects/services/project.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const statistician = searchParams.get("statistician") || undefined;

    const [projects, kpis, auditStream] = await Promise.all([
      projectService.getProjects({ status, search, statistician }),
      projectService.getKPIs(),
      projectService.getAuditStream(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        kpis,
        auditStream,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch projects data",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await projectService.createProject(body);

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "CREATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to create project",
          status: 400,
        },
      },
      { status: 400 }
    );
  }
}

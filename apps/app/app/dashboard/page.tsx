import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ROLE_ROUTES: Record<string, string> = {
  CLIENT: "/dashboard/client",
  STATISTICIAN: "/dashboard/statistician",
  SENIOR_QA_LEAD: "/dashboard/qa",
  FINANCE_OFFICER: "/dashboard/finance",
  CEO: "/dashboard/ceo",
  ADMIN: "/dashboard/admin",
};

export default async function DashboardRootDispatcherPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const targetRoute = (role && ROLE_ROUTES[role]) || "/dashboard/admin";

  redirect(targetRoute);
}

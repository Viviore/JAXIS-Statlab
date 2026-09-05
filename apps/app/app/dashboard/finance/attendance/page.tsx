import { getAttendanceReviewDeskData } from "@/features/attendance/actions";
import { AttendanceReviewClient } from "./AttendanceReviewClient";

export const metadata = {
  title: "Attendance & Missed-Punch Review | JAXIS StatLab",
  description: "Audit staff timesheets and missed punch requests.",
};

export default async function FinanceAttendanceReviewPage() {
  const initialData = await getAttendanceReviewDeskData();

  return <AttendanceReviewClient initialData={initialData} />;
}

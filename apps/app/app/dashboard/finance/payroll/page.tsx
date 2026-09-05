import {
  getCompanyPayslips,
  getPayrollConfigurations,
} from "@/features/payroll/actions";
import { FinancePayrollClient } from "./FinancePayrollClient";

export const metadata = {
  title: "Staff Payroll & Payslips | JAXIS StatLab",
  description: "Generate staff payroll, review compensation, and record disbursements.",
};

export default async function FinancePayrollOperationsPage() {
  const [payslipData, configData] = await Promise.all([
    getCompanyPayslips({
      period: "ALL",
      status: "ALL",
    }),
    getPayrollConfigurations(),
  ]);

  return (
    <FinancePayrollClient
      initialPayslipData={payslipData}
      initialConfigData={configData}
    />
  );
}

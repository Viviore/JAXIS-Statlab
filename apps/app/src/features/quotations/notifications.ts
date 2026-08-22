/**
 * JAXIS StatLab — Commercial Quotations Notification Service
 * Dispatches simulated / SMTP email notifications for quotation lifecycle events.
 * Adheres to strict zero-emoji, audit telemetry, and SLA standard.
 */

export interface QuotationIssuedPayload {
  quotationId: string;
  intakeId: string;
  projectTitle: string;
  clientEmail: string;
  clientName: string;
  packageName: string;
  totalAmount: number;
  downpaymentRequired: number;
  expiresAt: string;
}

export interface QuotationAcceptedPayload {
  quotationId: string;
  intakeId: string;
  projectTitle: string;
  clientEmail: string;
  clientName: string;
  totalAmount: number;
}

export interface QuotationDeclinedPayload {
  quotationId: string;
  intakeId: string;
  projectTitle: string;
  clientEmail: string;
  clientName: string;
  reason?: string | null;
}

/**
 * Dispatches notification when Admin issues a commercial quotation to the Lead Researcher.
 */
export async function sendQuotationIssuedNotification(
  payload: QuotationIssuedPayload
): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(
    `[EMAIL_DISPATCH] [${timestamp}] Event: QUOTATION_ISSUED | Study: ${payload.intakeId} | To: ${payload.clientEmail} (${payload.clientName}) | Package: ${payload.packageName} | Total: ₱${payload.totalAmount.toLocaleString()} | Downpayment Due: ₱${payload.downpaymentRequired.toLocaleString()} | Valid Until: ${payload.expiresAt}`
  );
}

/**
 * Dispatches notification when Lead Researcher accepts the commercial proposal.
 */
export async function sendQuotationAcceptedNotification(
  payload: QuotationAcceptedPayload
): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(
    `[EMAIL_DISPATCH] [${timestamp}] Event: QUOTATION_ACCEPTED | Study: ${payload.intakeId} | Client: ${payload.clientName} (${payload.clientEmail}) | Contract Sum: ₱${payload.totalAmount.toLocaleString()} | Status: SOW_PENDING`
  );
}

/**
 * Dispatches notification when Lead Researcher declines the proposal or requests adjustments.
 */
export async function sendQuotationDeclinedNotification(
  payload: QuotationDeclinedPayload
): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(
    `[EMAIL_DISPATCH] [${timestamp}] Event: QUOTATION_DECLINED | Study: ${payload.intakeId} | Client: ${payload.clientName} (${payload.clientEmail}) | Feedback: "${payload.reason || "No specific reason provided"}" | Status: REVISION_PENDING`
  );
}

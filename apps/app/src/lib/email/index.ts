import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = new Resend(env.RESEND_API_KEY);

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  from?: string;
} & (
  | { react: React.ReactElement; html?: never; text?: never }
  | { html: string; react?: never; text?: never }
  | { text: string; react?: never; html?: never }
);

export async function sendEmail({
  to,
  subject,
  from = "JAXIS StatLab <notifications@jaxis.dev>",
  ...content
}: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to : [to];

  if ("react" in content && content.react) {
    return await resend.emails.send({
      from,
      to: recipients,
      subject,
      react: content.react,
    });
  }

  if ("html" in content && content.html) {
    return await resend.emails.send({
      from,
      to: recipients,
      subject,
      html: content.html,
    });
  }

  if ("text" in content && content.text) {
    return await resend.emails.send({
      from,
      to: recipients,
      subject,
      text: content.text,
    });
  }

  throw new Error("Email content (react, html, or text) must be provided");
}

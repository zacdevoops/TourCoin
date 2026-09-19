import "server-only";

import { Resend } from "resend";

import {
  buildAdminBookingEmail,
  type AdminBookingEmailData,
} from "@/emails/admin-booking";

export async function sendAdminBookingEmail(
  data: AdminBookingEmailData,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.BOOKING_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    return false;
  }

  try {
    const content = buildAdminBookingEmail(data);
    const result = await new Resend(apiKey).emails.send({
      from,
      to: [to],
      subject: content.subject,
      html: content.html,
      text: content.text,
      replyTo: data.customerEmail,
    });
    return !result.error;
  } catch {
    return false;
  }
}

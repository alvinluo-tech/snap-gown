import { Resend } from "resend";
import {
  paymentNotificationEmail,
  overdueAlertEmail,
  suspensionNoticeEmail,
} from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "SnapGown <noreply@mail.alvin-luo.me>";

export async function sendPaymentNotification(params: {
  photographerEmail: string;
  orderNo: string;
  studentName: string;
  amountGBP: string;
  amountRMB: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return resend.emails.send({
    from: FROM,
    to: params.photographerEmail,
    subject: `[SnapGown] New Payment Proof - Order ${params.orderNo}`,
    html: paymentNotificationEmail({
      ...params,
      dashboardUrl: `${siteUrl}/dashboard/photographer/orders`,
    }),
  });
}

export async function sendOverdueAlert(params: {
  orderNo: string;
  photographerId: string;
  amountGBP: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@snapgown.com";
  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[ALERT] Verification Overdue - Order ${params.orderNo}`,
    html: overdueAlertEmail(params),
  });
}

export async function sendSuspensionNotice(params: {
  photographerEmail: string;
  debtAmountGBP: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.photographerEmail,
    subject: `[SnapGown] Account Suspended - Outstanding Commission`,
    html: suspensionNoticeEmail({
      debtAmountGBP: params.debtAmountGBP,
    }),
  });
}

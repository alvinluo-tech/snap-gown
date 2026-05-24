import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentNotification(params: {
  photographerEmail: string;
  orderNo: string;
  studentName: string;
  amountGBP: string;
  amountRMB: string;
}) {
  return resend.emails.send({
    from: "SnapGown <noreply@snapgown.com>",
    to: params.photographerEmail,
    subject: `[SnapGown] New Payment Proof - Order ${params.orderNo}`,
    html: `
      <h2>New Payment Proof Submitted</h2>
      <p>A student has submitted payment proof for order <strong>${params.orderNo}</strong>.</p>
      <ul>
        <li>Student: ${params.studentName}</li>
        <li>Amount: £${params.amountGBP} (¥${params.amountRMB})</li>
      </ul>
      <p>Please log in to your dashboard to verify the payment within 12 hours.</p>
    `,
  });
}

export async function sendOverdueAlert(params: {
  orderNo: string;
  photographerId: string;
  amountGBP: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@snapgown.com";
  return resend.emails.send({
    from: "SnapGown <noreply@snapgown.com>",
    to: adminEmail,
    subject: `[ALERT] Verification Overdue - Order ${params.orderNo}`,
    html: `
      <h2>Verification Overdue Alert</h2>
      <p>Order <strong>${params.orderNo}</strong> has not been verified within 12 hours.</p>
      <ul>
        <li>Photographer ID: ${params.photographerId}</li>
        <li>Amount: £${params.amountGBP}</li>
      </ul>
      <p>Please intervene manually.</p>
    `,
  });
}

export async function sendSuspensionNotice(params: {
  photographerEmail: string;
  debtAmountGBP: string;
}) {
  return resend.emails.send({
    from: "SnapGown <noreply@snapgown.com>",
    to: params.photographerEmail,
    subject: `[SnapGown] Account Suspended - Outstanding Commission`,
    html: `
      <h2>Account Suspended</h2>
      <p>Your account has been suspended due to outstanding commission debt of <strong>£${params.debtAmountGBP}</strong>.</p>
      <p>Please contact the platform administrator to resolve this issue.</p>
    `,
  });
}

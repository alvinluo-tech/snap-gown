// Shared email layout and styles — all inline for maximum email client compatibility.

const BRAND_COLOR = "#2563eb";
const BG_COLOR = "#f8fafc";
const CARD_BG = "#ffffff";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";

function emailLayout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:28px 32px;text-align:center;">
              <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">SnapGown</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${BORDER_COLOR};text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED_COLOR};">
                This is an automated message from SnapGown. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function h2(text: string) {
  return `<h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:${TEXT_COLOR};">${text}</h2>`;
}

function p(text: string, style = "") {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${TEXT_COLOR};${style}">${text}</p>`;
}

function muted(text: string) {
  return `<p style="margin:0;font-size:13px;color:${MUTED_COLOR};line-height:1.5;">${text}</p>`;
}

function infoBox(rows: { label: string; value: string }[]) {
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:${MUTED_COLOR};border-bottom:1px solid ${BORDER_COLOR};white-space:nowrap;">${r.label}</td>
          <td style="padding:8px 12px;font-size:14px;font-weight:500;color:${TEXT_COLOR};border-bottom:1px solid ${BORDER_COLOR};">${r.value}</td>
        </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER_COLOR};border-radius:8px;overflow:hidden;margin:16px 0;">${rowsHtml}</table>`;
}

function highlightBox(text: string) {
  return `<div style="background:#eff6ff;border-left:4px solid ${BRAND_COLOR};padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
    <p style="margin:0;font-size:14px;font-weight:500;color:${BRAND_COLOR};">${text}</p>
  </div>`;
}

function actionButton(text: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="border-radius:8px;background:${BRAND_COLOR};">
        <a href="${url}" target="_blank" style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Email Templates ──────────────────────────────────────────────────

export function paymentNotificationEmail(params: {
  orderNo: string;
  studentName: string;
  amountGBP: string;
  amountRMB: string;
  dashboardUrl: string;
}) {
  const body = `
    ${h2("New Payment Proof Submitted")}
    ${p(`A student has submitted payment proof for order <strong>${params.orderNo}</strong>.`)}
    ${infoBox([
      { label: "Student", value: params.studentName },
      { label: "Amount", value: `£${params.amountGBP} (¥${params.amountRMB})` },
      { label: "Order No.", value: params.orderNo },
    ])}
    ${highlightBox("Please verify the payment within 12 hours.")}
    ${actionButton("Review Payment", params.dashboardUrl)}
    ${muted("If you do not verify within 12 hours, the order will be flagged for admin review.")}
  `;
  return emailLayout("New Payment Proof", body);
}

export function overdueAlertEmail(params: {
  orderNo: string;
  photographerId: string;
  amountGBP: string;
}) {
  const body = `
    ${h2("Verification Overdue")}
    ${p(`Order <strong>${params.orderNo}</strong> has not been verified within the 12-hour window.`)}
    ${infoBox([
      { label: "Order No.", value: params.orderNo },
      { label: "Photographer ID", value: params.photographerId },
      { label: "Amount", value: `£${params.amountGBP}` },
    ])}
    ${highlightBox("Please intervene manually to resolve this order.")}
  `;
  return emailLayout("Alert: Verification Overdue", body);
}

export function suspensionNoticeEmail(params: {
  debtAmountGBP: string;
}) {
  const body = `
    ${h2("Account Suspended")}
    ${p("Your account has been suspended due to outstanding commission debt.")}
    ${infoBox([
      { label: "Outstanding Debt", value: `£${params.debtAmountGBP}` },
      { label: "Status", value: "Suspended" },
    ])}
    ${highlightBox("Please contact the platform administrator to resolve this issue and restore your account.")}
    ${muted("You will not be able to receive new bookings until the debt is settled.")}
  `;
  return emailLayout("Account Suspended", body);
}

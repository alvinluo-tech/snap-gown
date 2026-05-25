import { Resend } from "resend";
import {
  getEmailTemplateA_CN,
  getEmailTemplateB_CN,
  getEmailTemplateC_CN,
} from "./constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "SnapGown <noreply@mail.alvin-luo.me>";
const PLATFORM_NAME = "SnapGown";

// 场景 A：发给摄影师 - 学生已上传付款截图
export async function sendPaymentNotification(params: {
  photographerEmail: string;
  photographerName: string;
  studentName: string;
  bookingId: string;
  shootDate: string;
  shootTime: string;
  shootLocation: string;
  packageName: string;
  amountCNY: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const emailData = getEmailTemplateA_CN({
    photographer_name: params.photographerName,
    student_name: params.studentName,
    booking_id: params.bookingId,
    shoot_date: params.shootDate,
    shoot_time: params.shootTime,
    shoot_location: params.shootLocation,
    package_name: params.packageName,
    amount_cny: params.amountCNY,
    confirm_payment_url: `${siteUrl}/dashboard/photographer/orders`,
    payment_issue_url: `${siteUrl}/dashboard/photographer/orders`,
    platform_name: PLATFORM_NAME,
  });

  return resend.emails.send({
    from: FROM,
    to: params.photographerEmail,
    subject: emailData.subject,
    html: emailData.html,
  });
}

// 场景 B：发给学生 - 摄影师已确认到账
export async function sendBookingConfirmation(params: {
  studentEmail: string;
  studentName: string;
  photographerName: string;
  bookingId: string;
  shootDate: string;
  shootTime: string;
  meetingPoint: string;
  packageName: string;
  duration: string;
  deliverables: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const emailData = getEmailTemplateB_CN({
    student_name: params.studentName,
    photographer_name: params.photographerName,
    booking_id: params.bookingId,
    shoot_date: params.shootDate,
    shoot_time: params.shootTime,
    meeting_point: params.meetingPoint,
    package_name: params.packageName,
    duration: params.duration,
    deliverables: params.deliverables,
    booking_url: `${siteUrl}/dashboard/student`,
    weather_policy_url: `${siteUrl}/rules/weather`,
    platform_name: PLATFORM_NAME,
  });

  return resend.emails.send({
    from: FROM,
    to: params.studentEmail,
    subject: emailData.subject,
    html: emailData.html,
  });
}

// 场景 C：发给摄影师 - 佣金欠款警告
export async function sendCommissionSuspension(params: {
  photographerEmail: string;
  photographerName: string;
  outstandingCommission: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const emailData = getEmailTemplateC_CN({
    photographer_name: params.photographerName,
    outstanding_commission: params.outstandingCommission,
    admin_payment_qr_url: `${siteUrl}/dashboard/admin`,
    upload_commission_receipt_url: `${siteUrl}/dashboard/photographer/orders`,
    commission_dispute_url: `${siteUrl}/dashboard/photographer/orders`,
    platform_name: PLATFORM_NAME,
  });

  return resend.emails.send({
    from: FROM,
    to: params.photographerEmail,
    subject: emailData.subject,
    html: emailData.html,
  });
}

// 保留旧的发送超时提醒函数
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
    html: `<h2>Verification Overdue</h2><p>Order ${params.orderNo} has not been verified within the 12-hour window.</p><p>Photographer ID: ${params.photographerId}</p><p>Amount: £${params.amountGBP}</p>`,
  });
}

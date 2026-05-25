/**
 * Resend 邮件模板函数库
 * 用于后端 Server Actions 中发送自动化邮件
 */

// ============================================================
// 类型定义
// ============================================================

interface EmailTemplateData {
  photographer_name: string;
  student_name: string;
  booking_id: string;
  shoot_date: string;
  shoot_time: string;
  shoot_location: string;
  package_name: string;
  amount_cny: string;
  confirm_payment_url: string;
  payment_issue_url: string;
  platform_name: string;
}

interface BookingConfirmationData {
  photographer_name: string;
  student_name: string;
  booking_id: string;
  shoot_date: string;
  shoot_time: string;
  meeting_point: string;
  package_name: string;
  duration: string;
  deliverables: string;
  booking_url: string;
  weather_policy_url: string;
  platform_name: string;
}

interface CommissionSuspensionData {
  photographer_name: string;
  outstanding_commission: string;
  admin_payment_qr_url: string;
  upload_commission_receipt_url: string;
  commission_dispute_url: string;
  platform_name: string;
}

interface EmailResult {
  subject: string;
  html: string;
  text: string;
}

// ============================================================
// 场景 A：发给摄影师 - 学生已上传付款截图
// ============================================================

/**
 * 场景 A 中文版
 * 学生已上传微信支付截图，催促摄影师 12 小时内核对微信钱包并确认
 */
export function getEmailTemplateA_CN(data: EmailTemplateData): EmailResult {
  const subject = `有学生已上传付款截图，请在 12 小时内确认到账｜订单 ${data.booking_id}`;

  const text = `Hi ${data.photographer_name}，

你有一笔新的毕业照预约等待确认。

学生 ${data.student_name} 已在平台上传微信支付截图，订单信息如下：

- 订单编号：${data.booking_id}
- 拍摄日期：${data.shoot_date}
- 拍摄时间：${data.shoot_time}
- 拍摄地点：${data.shoot_location}
- 套餐名称：${data.package_name}
- 学生支付金额：¥${data.amount_cny}

请你在收到本邮件后 12 小时内完成以下操作：

1. 打开你的微信钱包；
2. 核对是否已收到学生对应金额；
3. 回到平台订单页点击"确认到账"。

确认链接：${data.confirm_payment_url}

为保障学生预约体验，如果 12 小时内未完成确认，平台可能会将该订单转入管理员人工核对流程。人工介入后，平台可能会联系你补充到账截图或说明，订单确认时间也可能被延后。

如果你未收到该笔款项，或发现学生付款金额/备注存在问题，请不要直接忽略订单，请点击下方链接提交异常说明：

提交付款异常：${data.payment_issue_url}

谢谢你的配合。及时确认到账可以帮助学生安心准备毕业照，也能提升你的接单转化率。

Best,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">有学生已上传付款截图</h2>

  <p>Hi <strong>${data.photographer_name}</strong>，</p>

  <p>你有一笔新的毕业照预约等待确认。</p>

  <p>学生 <strong>${data.student_name}</strong> 已在平台上传微信支付截图，订单信息如下：</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">订单编号</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.booking_id}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">拍摄日期</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_date}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">拍摄时间</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_time}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">拍摄地点</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_location}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">套餐名称</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.package_name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">学生支付金额</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5; color: #d4380d; font-weight: bold;">¥${data.amount_cny}</td>
    </tr>
  </table>

  <p>请你在收到本邮件后 <strong>12 小时内</strong>完成以下操作：</p>

  <ol>
    <li>打开你的微信钱包；</li>
    <li>核对是否已收到学生对应金额；</li>
    <li>回到平台订单页点击 <strong>"确认到账"</strong>。</li>
  </ol>

  <p style="text-align: center; margin: 30px 0;">
    <a href="${data.confirm_payment_url}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">👉 确认到账</a>
  </p>

  <div style="background-color: #fff7e6; border: 1px solid #ffd591; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #d46b08;"><strong>⚠️ 重要提醒：</strong>为保障学生预约体验，如果 12 小时内未完成确认，平台可能会将该订单转入管理员人工核对流程。人工介入后，平台可能会联系你补充到账截图或说明，订单确认时间也可能被延后。</p>
  </div>

  <p>如果你未收到该笔款项，或发现学生付款金额/备注存在问题，请不要直接忽略订单，请点击下方链接提交异常说明：</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.payment_issue_url}" style="background-color: #ff4d4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">提交付款异常</a>
  </p>

  <p>谢谢你的配合。及时确认到账可以帮助学生安心准备毕业照，也能提升你的接单转化率。</p>

  <p>Best,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * 场景 A 英文版
 * A student has uploaded a payment screenshot – please confirm within 12 hours
 */
export function getEmailTemplateA_EN(data: EmailTemplateData): EmailResult {
  const subject = `A student has uploaded a payment screenshot – please confirm within 12 hours｜Booking ${data.booking_id}`;

  const text = `Hi ${data.photographer_name},

A new graduation photo booking is waiting for your payment confirmation.

The student ${data.student_name} has uploaded a WeChat payment screenshot on the platform.

Booking details:

- Booking ID: ${data.booking_id}
- Shoot date: ${data.shoot_date}
- Shoot time: ${data.shoot_time}
- Location: ${data.shoot_location}
- Package: ${data.package_name}
- Amount paid by student: ¥${data.amount_cny}

Please complete the following within 12 hours:

1. Check your WeChat wallet;
2. Confirm whether the matching amount has arrived;
3. Return to the booking page and click "Confirm Payment Received".

Confirm here: ${data.confirm_payment_url}

If payment is not confirmed within 12 hours, the platform may refer the booking to an administrator for manual review. This may require additional evidence from you and may delay the booking confirmation.

If you have not received the payment, or if the amount/reference appears incorrect, please report the issue here:

${data.payment_issue_url}

Thank you for helping us keep the booking experience smooth and reliable.

Best,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">Payment Screenshot Uploaded</h2>

  <p>Hi <strong>${data.photographer_name}</strong>,</p>

  <p>A new graduation photo booking is waiting for your payment confirmation.</p>

  <p>The student <strong>${data.student_name}</strong> has uploaded a WeChat payment screenshot on the platform.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Booking ID</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.booking_id}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Shoot Date</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_date}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Shoot Time</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_time}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Location</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.shoot_location}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Package</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5;">${data.package_name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e5e5; font-weight: bold;">Amount Paid</td>
      <td style="padding: 10px; border: 1px solid #e5e5e5; color: #d4380d; font-weight: bold;">¥${data.amount_cny}</td>
    </tr>
  </table>

  <p>Please complete the following within <strong>12 hours</strong>:</p>

  <ol>
    <li>Check your WeChat wallet;</li>
    <li>Confirm whether the matching amount has arrived;</li>
    <li>Return to the booking page and click <strong>"Confirm Payment Received"</strong>.</li>
  </ol>

  <p style="text-align: center; margin: 30px 0;">
    <a href="${data.confirm_payment_url}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">👉 Confirm Payment</a>
  </p>

  <div style="background-color: #fff7e6; border: 1px solid #ffd591; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #d46b08;"><strong>⚠️ Important:</strong> If payment is not confirmed within 12 hours, the platform may refer the booking to an administrator for manual review. This may require additional evidence from you and may delay the booking confirmation.</p>
  </div>

  <p>If you have not received the payment, or if the amount/reference appears incorrect, please report the issue here:</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.payment_issue_url}" style="background-color: #ff4d4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Report Payment Issue</a>
  </p>

  <p>Thank you for helping us keep the booking experience smooth and reliable.</p>

  <p>Best,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

// ============================================================
// 场景 B：发给学生 - 摄影师已确认到账
// ============================================================

/**
 * 场景 B 中文版
 * 预约成功！你的杜伦毕业照拍摄已确认
 */
export function getEmailTemplateB_CN(data: BookingConfirmationData): EmailResult {
  const subject = `预约成功！你的杜伦毕业照拍摄已确认 🎓｜订单 ${data.booking_id}`;

  const text = `Hi ${data.student_name}，

好消息！摄影师 ${data.photographer_name} 已确认收到你的付款，你的毕业照拍摄预约已正式成功 🎓

这不仅是一组照片，也是你在杜伦这段旅程的纪念。城堡、河边、学院、石板路、冬天的风和毕业季的阳光，都会成为你以后回头看时很珍贵的一部分。

## 你的预约信息

- 订单编号：${data.booking_id}
- 摄影师：${data.photographer_name}
- 拍摄日期：${data.shoot_date}
- 拍摄时间：${data.shoot_time}
- 集合地点：${data.meeting_point}
- 套餐名称：${data.package_name}
- 拍摄时长：${data.duration}
- 交付内容：${data.deliverables}

查看订单：${data.booking_url}

---

## 拍摄前小提醒

为了让当天更顺利，建议你提前准备：

1. **学生证 / BRP / 护照照片页**
   某些学院或校园区域可能需要证明身份，建议随身带好学生证。

2. **提前完成妆造**
   建议至少提前 30–60 分钟完成妆容、发型和服装整理，避免临时赶时间。

3. **穿好走的鞋**
   杜伦坡多、石板路多，如果穿高跟鞋，建议额外带一双舒服的鞋用于转场。

4. **注意天气和保暖**
   英国天气变化很快，建议带一件不影响拍摄的小外套、雨伞或纸巾。

5. **提前 10 分钟到达集合点**
   毕业季档期紧张，准时到达可以保证你的完整拍摄时间。

6. **准备一些想拍的参考图**
   如果你有喜欢的风格、姿势或地点，可以提前发给摄影师沟通。

---

## 如果天气不好怎么办？

英国天气确实很会"搞心态"。如果拍摄当天遇到持续大雨、大风、雷电或官方天气预警，请及时与摄影师沟通。

符合平台天气规则的情况，可以申请免费改期。具体规则可在订单页查看：

${data.weather_policy_url}

---

祝你拍摄顺利，也祝你毕业快乐。

愿这组照片能记录下你在 Durham 最闪光、最值得骄傲的一刻。

Warm wishes,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #52c41a; border-bottom: 2px solid #52c41a; padding-bottom: 10px;">🎓 预约成功！</h2>

  <p>Hi <strong>${data.student_name}</strong>，</p>

  <p>好消息！摄影师 <strong>${data.photographer_name}</strong> 已确认收到你的付款，你的毕业照拍摄预约已正式成功 🎓</p>

  <p>这不仅是一组照片，也是你在杜伦这段旅程的纪念。城堡、河边、学院、石板路、冬天的风和毕业季的阳光，都会成为你以后回头看时很珍贵的一部分。</p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📋 你的预约信息</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">订单编号</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.booking_id}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">摄影师</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.photographer_name}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">拍摄日期</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.shoot_date}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">拍摄时间</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.shoot_time}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">集合地点</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.meeting_point}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">套餐名称</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.package_name}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">拍摄时长</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.duration}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">交付内容</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.deliverables}</td>
    </tr>
  </table>

  <p style="text-align: center; margin: 30px 0;">
    <a href="${data.booking_url}" style="background-color: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">查看订单详情</a>
  </p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📸 拍摄前小提醒</h3>

  <p>为了让当天更顺利，建议你提前准备：</p>

  <ol>
    <li><strong>学生证 / BRP / 护照照片页</strong><br>某些学院或校园区域可能需要证明身份，建议随身带好学生证。</li>
    <li><strong>提前完成妆造</strong><br>建议至少提前 30–60 分钟完成妆容、发型和服装整理，避免临时赶时间。</li>
    <li><strong>穿好走的鞋</strong><br>杜伦坡多、石板路多，如果穿高跟鞋，建议额外带一双舒服的鞋用于转场。</li>
    <li><strong>注意天气和保暖</strong><br>英国天气变化很快，建议带一件不影响拍摄的小外套、雨伞或纸巾。</li>
    <li><strong>提前 10 分钟到达集合点</strong><br>毕业季档期紧张，准时到达可以保证你的完整拍摄时间。</li>
    <li><strong>准备一些想拍的参考图</strong><br>如果你有喜欢的风格、姿势或地点，可以提前发给摄影师沟通。</li>
  </ol>

  <div style="background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #0050b3;"><strong>🌧️ 如果天气不好怎么办？</strong></p>
    <p style="margin: 10px 0 0 0; color: #0050b3;">英国天气确实很会"搞心态"。如果拍摄当天遇到持续大雨、大风、雷电或官方天气预警，请及时与摄影师沟通。符合平台天气规则的情况，可以申请免费改期。</p>
    <p style="margin: 10px 0 0 0;"><a href="${data.weather_policy_url}" style="color: #1890ff;">查看天气改期规则 →</a></p>
  </div>

  <p>祝你拍摄顺利，也祝你毕业快乐。</p>

  <p>愿这组照片能记录下你在 Durham 最闪光、最值得骄傲的一刻。</p>

  <p>Warm wishes,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * 场景 B 英文版
 * Booking confirmed! Your Durham graduation photo session is now secured
 */
export function getEmailTemplateB_EN(data: BookingConfirmationData): EmailResult {
  const subject = `Booking confirmed! Your Durham graduation photo session is now secured 🎓｜Booking ${data.booking_id}`;

  const text = `Hi ${data.student_name},

Great news! Your photographer ${data.photographer_name} has confirmed receipt of your payment. Your graduation photo session is now officially booked 🎓

This is more than just a photo session. It is a memory of your time in Durham — the castle, the river, your college, the cobbled streets, the wind, the gowns and the feeling of finally reaching this moment.

## Booking details

- Booking ID: ${data.booking_id}
- Photographer: ${data.photographer_name}
- Date: ${data.shoot_date}
- Time: ${data.shoot_time}
- Meeting point: ${data.meeting_point}
- Package: ${data.package_name}
- Duration: ${data.duration}
- Deliverables: ${data.deliverables}

View booking: ${data.booking_url}

---

## Before your shoot

A few friendly reminders:

1. Bring your student ID if possible.
2. Finish makeup and hair in advance.
3. Wear comfortable shoes for walking between locations.
4. Check the weather and bring a small umbrella or jacket.
5. Arrive 10 minutes early to protect your full shooting time.
6. Prepare reference photos if you have a specific style in mind.

---

If the weather becomes unsuitable for shooting, please contact your photographer as early as possible. Eligible weather-related cases may be rescheduled under the platform weather policy:

${data.weather_policy_url}

Congratulations again, and we hope your graduation photos capture one of the most meaningful moments of your Durham journey.

Warm wishes,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #52c41a; border-bottom: 2px solid #52c41a; padding-bottom: 10px;">🎓 Booking Confirmed!</h2>

  <p>Hi <strong>${data.student_name}</strong>,</p>

  <p>Great news! Your photographer <strong>${data.photographer_name}</strong> has confirmed receipt of your payment. Your graduation photo session is now officially booked 🎓</p>

  <p>This is more than just a photo session. It is a memory of your time in Durham — the castle, the river, your college, the cobbled streets, the wind, the gowns and the feeling of finally reaching this moment.</p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📋 Booking Details</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Booking ID</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.booking_id}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Photographer</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.photographer_name}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Date</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.shoot_date}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Time</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.shoot_time}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Meeting Point</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.meeting_point}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Package</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.package_name}</td>
    </tr>
    <tr style="background-color: #f6ffed;">
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Duration</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.duration}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #b7eb8f; font-weight: bold;">Deliverables</td>
      <td style="padding: 10px; border: 1px solid #b7eb8f;">${data.deliverables}</td>
    </tr>
  </table>

  <p style="text-align: center; margin: 30px 0;">
    <a href="${data.booking_url}" style="background-color: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Booking Details</a>
  </p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📸 Before Your Shoot</h3>

  <p>A few friendly reminders:</p>

  <ol>
    <li><strong>Bring your student ID if possible.</strong></li>
    <li><strong>Finish makeup and hair in advance.</strong></li>
    <li><strong>Wear comfortable shoes</strong> for walking between locations.</li>
    <li><strong>Check the weather</strong> and bring a small umbrella or jacket.</li>
    <li><strong>Arrive 10 minutes early</strong> to protect your full shooting time.</li>
    <li><strong>Prepare reference photos</strong> if you have a specific style in mind.</li>
  </ol>

  <div style="background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #0050b3;"><strong>🌧️ What if the weather is bad?</strong></p>
    <p style="margin: 10px 0 0 0; color: #0050b3;">British weather can be unpredictable. If heavy rain, strong winds, thunderstorms or official weather warnings occur on the day of your shoot, please contact your photographer as early as possible. Eligible weather-related cases may be rescheduled under the platform weather policy.</p>
    <p style="margin: 10px 0 0 0;"><a href="${data.weather_policy_url}" style="color: #1890ff;">View Weather Reschedule Policy →</a></p>
  </div>

  <p>Congratulations again, and we hope your graduation photos capture one of the most meaningful moments of your Durham journey.</p>

  <p>Warm wishes,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

// ============================================================
// 场景 C：发给摄影师 - 佣金欠款警告
// ============================================================

/**
 * 场景 C 中文版
 * 软熔断警告：累计欠佣金超过 £30，账号被系统自动挂起
 */
export function getEmailTemplateC_CN(data: CommissionSuspensionData): EmailResult {
  const subject = `你的摄影师档期已暂时挂起，请完成佣金结算以恢复接单`;

  const text = `Hi ${data.photographer_name}，

先感谢你这段时间在 ${data.platform_name} 上为学生提供毕业照拍摄服务。我们也很开心看到你的档期持续获得关注和预约。

这封邮件是一次系统自动提醒：你的账户当前累计未结算平台服务佣金已超过 £30。根据摄影师入驻规则，系统已将你的账户状态自动调整为：

SUSPENDED｜暂时挂起

请放心，这不是封号，也不是终止合作。
它只是一个自动风控机制，用来确保平台、摄影师和学生三方的预约秩序都能稳定运行。

---

## 当前状态

- 摄影师账号：${data.photographer_name}
- 当前未结算佣金：£${data.outstanding_commission}
- 状态：SUSPENDED
- 影响：你的新档期将暂时不再对学生展示
- 已确认订单：不受影响，请继续按约完成服务

---

## 如何恢复档期？

请扫描平台管理员收款码，补缴当前未结算佣金：

- 应补缴金额：£${data.outstanding_commission}
- 建议备注：${data.photographer_name} + commission
- 管理员收款码：${data.admin_payment_qr_url}

完成付款后，请上传付款截图：

${data.upload_commission_receipt_url}

平台核对后，将尽快恢复你的摄影师档期展示。

---

## 我们为什么设置这个机制？

平台目前不收学生款项，也不从学生付款中自动分账。
学生的拍摄费用会直接进入你的微信钱包，这对摄影师非常友好，也能让你更快收到现金流。

与此同时，平台需要通过后续佣金结算维持系统、日历、邮件通知、订单管理、客服协调和学生端流量运营。

所以我们设置了一个比较宽松的阈值：当累计未结算佣金超过 £30 时，系统会自动暂停新档期展示，直到佣金结清。

这个机制不是为了制造压力，而是为了让合作关系更清楚、更长期、更舒服。

---

## 温和提醒

你仍然是我们重视的合作摄影师。
只要完成本次佣金结算，你的档期可以恢复展示，后续也可以继续正常接单。

如果你认为金额有误，或某些订单存在退款、取消、争议等特殊情况，请直接回复本邮件，或通过下方链接提交说明：

${data.commission_dispute_url}

我们会根据订单记录进行核对，不会一刀切处理。

谢谢你的理解和配合。
希望我们继续一起把杜伦毕业季这件事做得更专业、更好看，也更值得被学生信任。

Best,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #faad14; border-bottom: 2px solid #faad14; padding-bottom: 10px;">⚠️ 摄影师档期已暂时挂起</h2>

  <p>Hi <strong>${data.photographer_name}</strong>，</p>

  <p>先感谢你这段时间在 <strong>${data.platform_name}</strong> 上为学生提供毕业照拍摄服务。我们也很开心看到你的档期持续获得关注和预约。</p>

  <p>这封邮件是一次系统自动提醒：你的账户当前累计未结算平台服务佣金已超过 <strong>£30</strong>。根据摄影师入驻规则，系统已将你的账户状态自动调整为：</p>

  <div style="background-color: #fff2e8; border: 2px solid #faad14; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #d48806;">SUSPENDED ｜ 暂时挂起</p>
  </div>

  <p>请放心，这不是封号，也不是终止合作。它只是一个自动风控机制，用来确保平台、摄影师和学生三方的预约秩序都能稳定运行。</p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📊 当前状态</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">摄影师账号</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">${data.photographer_name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">当前未结算佣金</td>
      <td style="padding: 10px; border: 1px solid #ffd591; color: #d4380d; font-weight: bold;">£${data.outstanding_commission}</td>
    </tr>
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">状态</td>
      <td style="padding: 10px; border: 1px solid #ffd591; color: #faad14; font-weight: bold;">SUSPENDED</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">影响</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">你的新档期将暂时不再对学生展示</td>
    </tr>
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">已确认订单</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">不受影响，请继续按约完成服务</td>
    </tr>
  </table>

  <h3 style="color: #1a1a1a; margin-top: 30px;">💳 如何恢复档期？</h3>

  <p>请扫描平台管理员收款码，补缴当前未结算佣金：</p>

  <ul>
    <li>应补缴金额：<strong>£${data.outstanding_commission}</strong></li>
    <li>建议备注：<strong>${data.photographer_name} + commission</strong></li>
    <li>管理员收款码：${data.admin_payment_qr_url}</li>
  </ul>

  <p>完成付款后，请上传付款截图：</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.upload_commission_receipt_url}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">上传付款截图</a>
  </p>

  <p>平台核对后，将尽快恢复你的摄影师档期展示。</p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">💡 我们为什么设置这个机制？</h3>

  <p>平台目前不收学生款项，也不从学生付款中自动分账。学生的拍摄费用会直接进入你的微信钱包，这对摄影师非常友好，也能让你更快收到现金流。</p>

  <p>与此同时，平台需要通过后续佣金结算维持系统、日历、邮件通知、订单管理、客服协调和学生端流量运营。</p>

  <p>所以我们设置了一个比较宽松的阈值：当累计未结算佣金超过 £30 时，系统会自动暂停新档期展示，直到佣金结清。</p>

  <p>这个机制不是为了制造压力，而是为了让合作关系更清楚、更长期、更舒服。</p>

  <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #389e0d;"><strong>✅ 温和提醒</strong></p>
    <p style="margin: 10px 0 0 0; color: #389e0d;">你仍然是我们重视的合作摄影师。只要完成本次佣金结算，你的档期可以恢复展示，后续也可以继续正常接单。</p>
  </div>

  <p>如果你认为金额有误，或某些订单存在退款、取消、争议等特殊情况，请直接回复本邮件，或通过下方链接提交说明：</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.commission_dispute_url}" style="background-color: #ff4d4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">提交佣金异议</a>
  </p>

  <p>谢谢你的理解和配合。希望我们继续一起把杜伦毕业季这件事做得更专业、更好看，也更值得被学生信任。</p>

  <p>Best,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * 场景 C 英文版
 * Your photographer availability has been temporarily suspended
 */
export function getEmailTemplateC_EN(data: CommissionSuspensionData): EmailResult {
  const subject = `Your photographer availability has been temporarily suspended pending commission settlement`;

  const text = `Hi ${data.photographer_name},

Thank you for providing graduation photo services to students through ${data.platform_name}. We are glad to see your availability receiving attention and bookings.

This is an automated account notice. Your outstanding platform commission has now exceeded £30. Under the photographer onboarding rules, your account status has been automatically changed to:

SUSPENDED

Please note that this is not a ban or a termination of cooperation. It is an automatic risk-control mechanism designed to keep the booking system fair and stable for students, photographers and the platform.

## Current status

- Photographer account: ${data.photographer_name}
- Outstanding commission: £${data.outstanding_commission}
- Status: SUSPENDED
- Impact: your new available slots are temporarily hidden from students
- Existing confirmed bookings: not affected; please continue to complete them as agreed

## How to restore your availability

Please scan the platform administrator's payment QR code and settle the outstanding commission:

- Amount due: £${data.outstanding_commission}
- Suggested reference: ${data.photographer_name} + commission
- Admin payment QR code: ${data.admin_payment_qr_url}

After payment, please upload your payment screenshot here:

${data.upload_commission_receipt_url}

Once verified, your availability will be restored.

If you believe the amount is incorrect, or if any booking involves refund, cancellation or dispute, please reply to this email or submit an explanation here:

${data.commission_dispute_url}

Thank you for your understanding and cooperation.

Best,
${data.platform_name} Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #faad14; border-bottom: 2px solid #faad14; padding-bottom: 10px;">⚠️ Photographer Availability Suspended</h2>

  <p>Hi <strong>${data.photographer_name}</strong>,</p>

  <p>Thank you for providing graduation photo services to students through <strong>${data.platform_name}</strong>. We are glad to see your availability receiving attention and bookings.</p>

  <p>This is an automated account notice. Your outstanding platform commission has now exceeded <strong>£30</strong>. Under the photographer onboarding rules, your account status has been automatically changed to:</p>

  <div style="background-color: #fff2e8; border: 2px solid #faad14; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #d48806;">SUSPENDED</p>
  </div>

  <p>Please note that this is not a ban or a termination of cooperation. It is an automatic risk-control mechanism designed to keep the booking system fair and stable for students, photographers and the platform.</p>

  <h3 style="color: #1a1a1a; margin-top: 30px;">📊 Current Status</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">Photographer Account</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">${data.photographer_name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">Outstanding Commission</td>
      <td style="padding: 10px; border: 1px solid #ffd591; color: #d4380d; font-weight: bold;">£${data.outstanding_commission}</td>
    </tr>
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">Status</td>
      <td style="padding: 10px; border: 1px solid #ffd591; color: #faad14; font-weight: bold;">SUSPENDED</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">Impact</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">Your new available slots are temporarily hidden from students</td>
    </tr>
    <tr style="background-color: #fff2e8;">
      <td style="padding: 10px; border: 1px solid #ffd591; font-weight: bold;">Existing Bookings</td>
      <td style="padding: 10px; border: 1px solid #ffd591;">Not affected; please continue to complete them as agreed</td>
    </tr>
  </table>

  <h3 style="color: #1a1a1a; margin-top: 30px;">💳 How to Restore Your Availability</h3>

  <p>Please scan the platform administrator's payment QR code and settle the outstanding commission:</p>

  <ul>
    <li>Amount due: <strong>£${data.outstanding_commission}</strong></li>
    <li>Suggested reference: <strong>${data.photographer_name} + commission</strong></li>
    <li>Admin payment QR code: ${data.admin_payment_qr_url}</li>
  </ul>

  <p>After payment, please upload your payment screenshot here:</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.upload_commission_receipt_url}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Upload Payment Screenshot</a>
  </p>

  <p>Once verified, your availability will be restored.</p>

  <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #389e0d;"><strong>✅ A Gentle Reminder</strong></p>
    <p style="margin: 10px 0 0 0; color: #389e0d;">You are still a valued partner. Once the outstanding commission is settled, your availability will be restored and you can continue accepting bookings as normal.</p>
  </div>

  <p>If you believe the amount is incorrect, or if any booking involves refund, cancellation or dispute, please reply to this email or submit an explanation here:</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="${data.commission_dispute_url}" style="background-color: #ff4d4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Submit Commission Dispute</a>
  </p>

  <p>Thank you for your understanding and cooperation.</p>

  <p>Best,<br>${data.platform_name} Team</p>
</body>
</html>`;

  return { subject, html, text };
}

// ============================================================
// 导出所有模板函数
// ============================================================

export const emailTemplates = {
  // 场景 A：摄影师确认付款
  photographerPaymentConfirmation: {
    CN: getEmailTemplateA_CN,
    EN: getEmailTemplateA_EN,
  },
  // 场景 B：学生预约成功
  studentBookingConfirmation: {
    CN: getEmailTemplateB_CN,
    EN: getEmailTemplateB_EN,
  },
  // 场景 C：摄影师佣金警告
  photographerCommissionSuspension: {
    CN: getEmailTemplateC_CN,
    EN: getEmailTemplateC_EN,
  },
} as const;

export default emailTemplates;

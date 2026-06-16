import { Resend } from 'resend';

// Initialize Resend client if key is available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Send email with details, falling back to console logging if API key is not set
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Elite Barbershop <onboarding@resend.dev>', // Resend default domain for test/free accounts
        to: [to],
        subject,
        html,
      });
      if (error) {
        console.error('Failed to send email via Resend:', error);
      } else {
        console.log('Email sent successfully via Resend:', data);
      }
    } catch (err) {
      console.error('Error sending email:', err);
    }
  } else {
    // Mock / Log mode
    console.log('\n========= ✉️ [MOCK EMAIL SENT] =========');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('----------------------------------------');
    // Strip HTML tags for cleaner console output
    const cleanHtml = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Body:    ${cleanHtml}`);
    console.log('========================================\n');
  }
}

export async function sendBookingConfirmationEmail(
  customerEmail: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
) {
  const subject = 'تأكيد حجز موعدك - صالون قَصَّة';
  const html = `
    <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; background-color: #050505; color: #ffffff;">
      <h2 style="color: #fbbf24;">مرحباً ${customerName}،</h2>
      <p style="font-size: 16px;">تم تسجيل حجزك الجديد بنجاح في صالون قَصَّة!</p>
      <div style="background-color: #18181b; padding: 15px; border-radius: 8px; border: 1px solid #27272a; margin: 20px 0;">
        <p><strong>الخدمة:</strong> ${serviceName}</p>
        <p><strong>التاريخ:</strong> ${date}</p>
        <p><strong>الوقت:</strong> ${time}</p>
      </div>
      <p style="font-size: 14px; color: #a1a1aa;">حالة حجزك الآن هي: <strong>قيد الانتظار</strong>. سنقوم بإشعارك فور تأكيد الموعد.</p>
      <hr style="border-color: #27272a;" />
      <p style="font-size: 12px; color: #71717a;">صالون قَصَّة - تجربة حلاقة تليق بك.</p>
    </div>
  `;

  await sendEmail({ to: customerEmail, subject, html });
}

export async function sendBookingStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string,
  status: string
) {
  let statusText = '';
  let statusMessage = '';

  if (status === 'confirmed') {
    statusText = 'مؤكد';
    statusMessage = 'يسعدنا إخبارك بأنه تم تأكيد موعدك بنجاح. نحن بانتظار تشريفك لنا!';
  } else if (status === 'cancelled') {
    statusText = 'ملغي';
    statusMessage = 'نأسف لإخبارك بأنه قد تم إلغاء موعدك. إذا كنت ترغب في إعادة الحجز، يمكنك القيام بذلك في أي وقت عبر لوحة التحكم.';
  } else if (status === 'completed') {
    statusText = 'مكتمل';
    statusMessage = 'شكراً لزيارتك لصالون قَصَّة! نأمل أن تكون قد حظيت بتجربة رائعة. يرجى زيارة حسابك لتقييم الخدمة التي تلقيتها.';
  } else {
    return; // Don't send mail for other states like pending
  }

  const subject = `تحديث حالة الحجز: ${statusText} - صالون قَصَّة`;
  const html = `
    <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; background-color: #050505; color: #ffffff;">
      <h2 style="color: #fbbf24;">مرحباً ${customerName}،</h2>
      <p style="font-size: 16px;">هناك تحديث بخصوص حجزك في صالون قَصَّة:</p>
      <div style="background-color: #18181b; padding: 15px; border-radius: 8px; border: 1px solid #27272a; margin: 20px 0;">
        <p><strong>الخدمة:</strong> ${serviceName}</p>
        <p><strong>التاريخ:</strong> ${date}</p>
        <p><strong>الوقت:</strong> ${time}</p>
        <p><strong>الحالة الجديدة:</strong> <span style="color: #fbbf24;">${statusText}</span></p>
      </div>
      <p style="font-size: 16px; line-height: 1.5;">${statusMessage}</p>
      <hr style="border-color: #27272a;" />
      <p style="font-size: 12px; color: #71717a;">صالون قَصَّة - تجربة حلاقة تليق بك.</p>
    </div>
  `;

  await sendEmail({ to: customerEmail, subject, html });
}

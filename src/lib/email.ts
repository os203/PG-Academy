import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || `"PG Academy" <${smtpUser}>`;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials not configured. Skipping email to:", to);
    return;
  }
  
  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4F46E5;">PG Academy Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PG Academy. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, "Reset Your PG Academy Password", html);
};

export const sendInvoiceEmail = async (email: string, name: string, courseTitle: string, amount: number, invoiceId: string) => {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4F46E5; margin: 0;">PG Academy</h1>
        <p style="color: #666; margin: 5px 0;">Payment Receipt & Invoice</p>
      </div>
      
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for your purchase! Here are your receipt details:</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Invoice ID:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoiceId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Date:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr style="border-top: 1px solid #eee;">
            <td style="padding: 15px 0 8px 0; color: #666;">Track:</td>
            <td style="padding: 15px 0 8px 0; font-weight: bold; text-align: right;">${courseTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Total Paid:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10B981; font-size: 18px;">$${amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Learning</a>
      </div>
      
      <p style="color: #666;">If you have any questions, simply reply to this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PG Academy. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, `Your Receipt for ${courseTitle}`, html);
};

export const sendCertificateEmail = async (email: string, name: string, courseTitle: string, uniqueCode: string) => {
  const certificateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/${uniqueCode}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">🎓</div>
        <h1 style="color: #4F46E5; margin: 0;">Congratulations!</h1>
      </div>
      
      <p>Hi <strong>${name}</strong>,</p>
      <p>You did it! We are thrilled to inform you that you have successfully completed <strong>${courseTitle}</strong>.</p>
      <p>Your official PG Academy Certificate of Completion is ready.</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #166534; font-size: 14px;">Verification Code</p>
        <p style="margin: 5px 0 0 0; font-weight: bold; font-family: monospace; font-size: 18px; color: #15803d;">${uniqueCode}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${certificateUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Certificate</a>
      </div>
      
      <p style="color: #666;">You can add this certificate to your LinkedIn profile or print it out for your records.</p>
      <p>Keep up the great work!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PG Academy. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, `Congratulations! Your Certificate for ${courseTitle}`, html);
};

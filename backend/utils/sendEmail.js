const nodemailer = require('nodemailer');

/**
 * Send email (OTP or custom content)
 * @param {string} email - Recipient email address
 * @param {string|Object} otpOrOptions - OTP string OR custom mail options
 */
const sendEmail = async (email, otpOrOptions) => {
  try {
    let transporter;

    // ===============================
    // Create transporter
    // ===============================
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Gmail (Recommended for production)
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      // Custom SMTP
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal (Development / Testing)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // ===============================
    // Email content
    // ===============================
    let mailOptions;

    // ---- OTP Email (Professional Template) ----
    if (typeof otpOrOptions === 'string') {
      const otp = otpOrOptions;

      mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          '"Fitness Tracker" <no-reply@fitness-tracker.com>',
        to: email,
        subject: 'Your One-Time Password (OTP) – Fitness Tracker',
        text: `
Dear User,

We received a request to verify your email address for your Fitness Tracker account.

Your One-Time Password (OTP) is:
${otp}

This OTP is valid for the next 10 minutes.

For security reasons, please do not share this code with anyone. Fitness Tracker will never ask you for your OTP via phone, email, or message.

If you did not request this verification, please ignore this email.

Best regards,
Fitness Tracker Team
`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa;">
  <div style="padding:30px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:30px; font-family:Arial, Helvetica, sans-serif;">
      
      <h2 style="color:#2c3e50; margin-top:0;">Email Verification</h2>

      <p style="font-size:15px; color:#333;">
        Dear User,
      </p>

      <p style="font-size:15px; color:#333;">
        We received a request to verify your email address for your <strong>Fitness Tracker</strong> account.
      </p>

      <p style="font-size:15px; color:#333;">
        Please use the One-Time Password (OTP) below to complete your verification:
      </p>

      <div style="background:#f1f3f6; padding:20px; text-align:center; border-radius:6px; margin:25px 0;">
        <span style="font-size:28px; letter-spacing:4px; color:#1e6fe3; font-weight:bold;">
          ${otp}
        </span>
      </div>

      <p style="font-size:15px; color:#333;">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <p style="font-size:13px; color:#555;">
        For your security, do not share this code with anyone. Fitness Tracker will never ask for your OTP via email, phone calls, or messages.
      </p>

      <p style="font-size:13px; color:#555;">
        If you did not request this verification, please ignore this email.
      </p>

      <hr style="border:none; border-top:1px solid #e0e0e0; margin:25px 0;" />

      <p style="font-size:12px; color:#777;">
        Regards,<br />
        <strong>Fitness Tracker Team</strong>
      </p>

      <p style="font-size:11px; color:#aaa;">
        © 2025 Fitness Tracker. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`,
      };
    }

    // ---- Custom Email (Optional Use) ----
    else if (typeof otpOrOptions === 'object' && otpOrOptions !== null) {
      const opts = otpOrOptions;

      mailOptions = {
        from:
          opts.from ||
          process.env.EMAIL_FROM ||
          '"Fitness Tracker" <no-reply@fitness-tracker.com>',
        to: email,
        subject: opts.subject || 'Fitness Tracker Notification',
        text: opts.text || '',
        html: opts.html || opts.text || '',
      };
    } else {
      throw new Error('Invalid email content');
    }

    // ===============================
    // Send email
    // ===============================
    const info = await transporter.sendMail(mailOptions);

    // Ethereal preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    console.log('✅ Email sent successfully to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;

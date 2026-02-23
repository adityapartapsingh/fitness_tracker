const nodemailer = require('nodemailer');

const sendEmail = async (email, otpOrOptions) => {
  try {
    let transporter;

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000,
        socketTimeout: 60000,
        pool: {
          maxConnections: 5,
          maxMessages: 100
        }
      });
    } else {
      throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.');
    }

    let mailOptions;

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

    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(new Error(`Failed to send email: ${error.message}`));
        } else {
          resolve(info);
        }
      });
    });

    console.log('✅ Email sent successfully to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;

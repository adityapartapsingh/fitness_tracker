const nodemailer = require('nodemailer');

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code to send
 */
const sendEmail = async (email, otp) => {
  try {
    let transporter;

    // Use Gmail if credentials provided, otherwise use test account or SMTP
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use custom SMTP
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
      // Use Ethereal for development/testing
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

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Fitness Tracker App <no-reply@fitness-tracker.local>',
      to: email,
      subject: 'Your Verification OTP - Fitness Tracker',
      text: `Your OTP for email verification is: ${otp}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for signing up with Fitness Tracker!</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #5568d3; margin: 0; letter-spacing: 3px;">${otp}</h1>
          </div>
          <p><strong>This code expires in 10 minutes.</strong></p>
          <p style="color: #666; font-size: 12px;">Do not share this code with anyone. Fitness Tracker will never ask for your OTP via email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">© 2025 Fitness Tracker. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log preview URL for test accounts
    if (nodemailer.getTestMessageUrl && info) {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    console.log('✅ OTP email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;

# Email Verification Setup Guide

This guide explains how to set up email verification for the Fitness Tracker application.

## Architecture Overview

The email verification system consists of three main components:

### 1. **Email Sender Utility** (`backend/utils/sendEmail.js`)
- Handles all email sending logic
- Supports multiple SMTP providers (Gmail, Custom SMTP, Ethereal for testing)
- Sends formatted HTML emails with OTP codes

### 2. **Auth Controller** (`backend/controllers/authController.js`)
- `signup()`: Generates OTP, creates user, sends email
- `verifyOTP()`: Validates OTP and marks user as verified
- `resendOTP()`: Generates new OTP for unverified users
- `login()`: Authenticates verified users

### 3. **Auth Routes** (`backend/routes/authRoutes.js`)
- `POST /api/auth/signup`: Register new user
- `POST /api/auth/verify-otp`: Verify email with OTP
- `POST /api/auth/resend-otp`: Resend OTP
- `POST /api/auth/login`: Login user

## User Flow

```
1. User enters email/password on Frontend
                    ↓
2. Backend generates 6-digit OTP
                    ↓
3. Backend saves user with:
   - isVerified: false
   - otpHash (bcrypt hashed OTP)
   - otpExpires: 10 minutes from now
                    ↓
4. Backend sends OTP to email
                    ↓
5. Frontend shows "Enter OTP" input
                    ↓
6. User enters OTP
                    ↓
7. Backend verifies OTP
   - If valid & not expired:
     * Sets isVerified: true
     * Clears otpHash & otpExpires
     * Returns JWT token
   - If invalid/expired:
     * Returns error
     * User can request resend
                    ↓
8. Frontend redirects to dashboard with token
```

## Setup Instructions

### Option 1: Gmail (Recommended for Development/Production)

**Step 1: Enable 2-Step Verification**
1. Go to [Google Account](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Scroll down to "How you sign in to Google"
4. Click "2-Step Verification"
5. Follow the prompts to set up 2FA

**Step 2: Generate App Password**
1. Go back to Google Account > Security
2. Under "How you sign in to Google", find "App Passwords"
3. Select "Mail" and "Windows Computer" (or your device)
4. Click "Generate"
5. Google will show a 16-character password
6. Copy this password (remove any spaces)

**Step 3: Update `.env` File**
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16charpassword
```

### Option 2: Custom SMTP Server

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### Option 3: Development/Testing (Default)

The system automatically uses Ethereal (a fake SMTP service for testing):
- No configuration needed
- Each email sent will generate a preview URL
- Check console output for the preview URL

## API Endpoints

### POST `/api/auth/signup`
Register a new user and send OTP

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "Registration successful! OTP sent to your email.",
  "email": "john@example.com"
}
```

**Password Requirements:**
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

---

### POST `/api/auth/verify-otp`
Verify email with OTP code

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**Error Responses:**
- `400 - User not found`
- `400 - User already verified`
- `400 - No OTP found. Please signup again.`
- `400 - OTP expired. Please request a new one.`
- `400 - Invalid OTP`

---

### POST `/api/auth/resend-otp`
Resend OTP to email

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP resent to email"
}
```

---

### POST `/api/auth/login`
Login with verified email and password

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400 - Invalid credentials`
- `400 - Email not verified. Please verify your email first.`

---

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, bcrypt hashed),
  isVerified: Boolean (default: false),
  otpHash: String (bcrypt hashed OTP, undefined after verification),
  otpExpires: Date (10 minutes from signup, undefined after verification),
  createdAt: Date (default: Date.now)
}
```

## Testing the System

### 1. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 2. Check Email
- If using Gmail: Check inbox
- If using custom SMTP: Check your email
- If using Ethereal (default): Check browser console or terminal for preview URL

### 3. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## Troubleshooting

### Email Not Sending
1. Check `.env` file is configured correctly
2. For Gmail: Verify App Password is correct (no spaces)
3. For Gmail: Ensure 2-Step Verification is enabled
4. Check server logs for error messages
5. Try using Ethereal (default) to test without real email

### OTP Invalid
- User entered wrong OTP
- OTP expired (10 minute limit)
- Check OTP from email matches what user enters

### User Already Verified
- User already completed email verification
- This is expected behavior, user can login directly

### Resend OTP Not Working
- User account doesn't exist
- User already verified (can't resend if verified)
- Email sending failed (check email configuration)

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds=10
2. **OTP Hashing**: OTPs are hashed before storage (never stored in plain text)
3. **OTP Expiry**: OTPs automatically expire after 10 minutes
4. **JWT Tokens**: Tokens expire after 7 days
5. **Email Verification**: Required for login (prevents unauthorized access)
6. **No Plain Text Emails**: OTP emails use HTML templates with styling

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `GMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-char Gmail app password | `abcd efgh ijkl mnop` |
| `SMTP_HOST` | Custom SMTP server hostname | `smtp.example.com` |
| `SMTP_PORT` | Custom SMTP port | `587` |
| `SMTP_USER` | SMTP username | `user@example.com` |
| `SMTP_PASS` | SMTP password | `password123` |
| `EMAIL_FROM` | Sender email display | `Fitness Tracker <noreply@app.com>` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | Server port | `5000` |

## Next Steps

1. Configure email in `.env`
2. Install dependencies: `npm install`
3. Start server: `npm start`
4. Test signup/verification flow
5. Deploy to production with real email credentials

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API endpoint documentation
3. Check server logs for detailed error messages
4. Verify `.env` configuration

# Email Verification - Quick Start

Get email verification working in 5 minutes!

## Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)
- Backend and Frontend dependencies installed

## Step 1: Configure Email (Choose ONE)

### Option A: Gmail (Recommended)

1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** → **App Passwords**
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password (remove spaces)

Edit `backend/.env`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Option B: Testing (Default - No Config Needed)
Leave `.env` empty - will use Ethereal (fake SMTP)

### Option C: Custom SMTP

Edit `backend/.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

## Step 2: Start Backend

```bash
cd backend
npm install  # if not already done
npm start
```

You should see:
```
✅ MongoDB connected successfully
Server running on port 5000
```

## Step 3: Start Frontend

In another terminal:
```bash
cd frontend
npm install  # if not already done
npm start
```

Frontend opens on http://localhost:3000

## Step 4: Test Signup

1. Click "Sign Up"
2. Fill in:
   - Name: Your name
   - Email: Your email (or test@example.com)
   - Password: Must have uppercase, lowercase, number, and special char (e.g., `Test@Pass123`)
3. Click "Sign Up"
4. You'll see "OTP Input" screen

## Step 5: Check Email for OTP

- **Gmail:** Check your inbox
- **Testing (Ethereal):** Check backend console for preview URL
- **Custom SMTP:** Check your email service

## Step 6: Enter OTP

1. Copy OTP from email
2. Paste in "Enter OTP" field
3. Click "Verify"
4. You're logged in! ✅

## Testing Checklist

- [ ] Signup works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Redirected to dashboard
- [ ] Can create workouts
- [ ] Can logout and login again

## Troubleshooting

### Email not received?
- Check spam/promotions folder
- For Ethereal: Copy preview URL from console and open in browser
- Check backend logs for errors

### OTP Expired?
- Click "Resend OTP" button
- You have 10 minutes from resend

### Can't Login?
- Make sure you verified email first
- Use same email and password as signup

### MongoDB Connection Error?
- Check MongoDB is running
- Verify connection string in `.env`

## What Was Created

```
backend/
├── utils/sendEmail.js           ← Email utility
├── controllers/authController.js ← Auth logic
├── routes/authRoutes.js         ← Auth routes
├── .env.example                 ← Config template
└── test-email-verification.js   ← Test script

Documentation:
├── EMAIL_VERIFICATION_SETUP.md          ← Full guide
├── FRONTEND_EMAIL_INTEGRATION.md        ← Frontend details
└── EMAIL_IMPLEMENTATION_SUMMARY.md      ← Implementation details
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Register user |
| `/api/auth/verify-otp` | POST | Verify email |
| `/api/auth/resend-otp` | POST | Resend OTP |
| `/api/auth/login` | POST | Login user |

## Test with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@Pass123"
  }'
```

### Verify OTP (use OTP from email)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Resend OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@Pass123"
  }'
```

## Test Automation

Run the test script:
```bash
cd backend
node test-email-verification.js
```

This tests:
- Server health
- Signup validation
- Invalid OTP rejection
- OTP resend
- Unverified login blocking
- Password strength

## Password Requirements

Your password must have:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*)

Example: `SecurePass123!` ✅

## Common Issues

| Issue | Solution |
|-------|----------|
| "Email already registered" | Use different email or login |
| "OTP expired" | Click "Resend OTP" |
| "Invalid OTP" | Re-check OTP from email |
| "Email not verified" | Complete verification first |
| "SMTP Error" | Check .env configuration |
| "MongoDB error" | Ensure MongoDB is running |

## Next Steps

1. ✅ Basic setup working?
2. Read [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md) for full documentation
3. Deploy to production with real email service
4. Monitor OTP delivery and success rates

## Support

- Full documentation: [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md)
- Frontend details: [FRONTEND_EMAIL_INTEGRATION.md](./FRONTEND_EMAIL_INTEGRATION.md)
- Implementation: [EMAIL_IMPLEMENTATION_SUMMARY.md](./EMAIL_IMPLEMENTATION_SUMMARY.md)

---

**Ready?** Start with Step 1 above! 🚀

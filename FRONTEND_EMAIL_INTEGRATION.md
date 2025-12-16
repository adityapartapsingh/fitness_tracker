# Frontend Email Verification Integration

This guide explains how the frontend already integrates with the email verification system.

## Frontend Structure

The frontend uses a clean separation of concerns:

### API Layer (`frontend/src/api/authAPI.js`)
Handles all authentication API calls to the backend.

### Components

#### AuthPage (`frontend/src/pages/AuthPage.js`)
Main authentication page that switches between Login and Signup.

#### Signup Component (`frontend/src/components/Auth/Signup.js`)
Handles the complete signup and OTP verification flow:

**States:**
- `form` - User input (name, email, password)
- `loading` - Loading state during API calls
- `error` - Error messages to display
- `step` - Current step: 'form' | 'verify' | 'success'
- `otp` - OTP input from user

**Form Step:**
- Input fields for Name, Email, Password
- Password strength validation with visual feedback
- Shows real-time password requirements

**Verify Step:**
- OTP input field
- "Resend OTP" button
- Automatic redirect after successful verification

**Success Step:**
- Success message with redirect

#### Login Component (`frontend/src/components/Auth/Login.js`)
Standard login form with:
- Email and password inputs
- "Resend OTP" option if user sees "Email not verified" error
- Error handling and display

## API Methods Used

### `authAPI.register(form)`
Calls `POST /api/auth/signup`
```javascript
const form = {
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!"
};
const response = await authAPI.register(form);
```

### `authAPI.verifyOtp(data)`
Calls `POST /api/auth/verify-otp`
```javascript
const data = {
  email: "john@example.com",
  otp: "123456"
};
const response = await authAPI.verifyOtp(data);
```

### `authAPI.resendOtp(data)`
Calls `POST /api/auth/resend-otp`
```javascript
const data = { email: "john@example.com" };
const response = await authAPI.resendOtp(data);
```

### `authAPI.login(form)`
Calls `POST /api/auth/login`
```javascript
const form = {
  email: "john@example.com",
  password: "SecurePass123!"
};
const response = await authAPI.login(form);
```

## User Experience Flow

### Signup Flow
```
1. User fills signup form (Name, Email, Password)
   ↓
2. Frontend validates password strength
   ↓
3. User clicks "Sign Up"
   ↓
4. Frontend sends POST /api/auth/signup
   ↓
5. Backend creates user and sends OTP
   ↓
6. Frontend shows "Enter OTP" step
   ↓
7. User enters OTP from email
   ↓
8. Frontend sends POST /api/auth/verify-otp
   ↓
9. Backend verifies and returns token
   ↓
10. Frontend stores token and redirects to dashboard
```

### Login Flow
```
1. User enters email and password
   ↓
2. User clicks "Login"
   ↓
3. Frontend sends POST /api/auth/login
   ↓
4. Backend verifies credentials and email verification status
   ↓
5. If verified: returns token
   If not verified: returns error "Email not verified"
   ↓
6. Frontend handles response
   - If successful: stores token and redirects to dashboard
   - If not verified: shows "Resend OTP" option
```

### Resend OTP Flow
```
1. User sees "Email not verified" error during login
   ↓
2. User clicks "Resend OTP" button
   ↓
3. Frontend sends POST /api/auth/resend-otp
   ↓
4. Backend generates new OTP and sends email
   ↓
5. Frontend shows success message
   ↓
6. User can check email for new OTP
```

## Password Strength Validator

The frontend includes real-time password validation that checks:

✓ At least 8 characters
✓ Uppercase letter (A-Z)
✓ Lowercase letter (a-z)
✓ Number (0-9)
✓ Special character (!@#$%^&*)

Visual feedback:
- Red (✗) if requirement not met
- Green (✓) if requirement met

Button is only enabled when ALL requirements are met.

## Error Handling

The frontend displays specific error messages:

| Error | User Action |
|-------|-------------|
| "Email already registered" | Use different email or login |
| "OTP expired" | Click "Resend OTP" |
| "Invalid OTP" | Re-enter correct OTP from email |
| "Email not verified" | Click "Resend OTP" or check email |
| "Invalid credentials" | Check email/password and retry |
| "Missing fields" | Fill all required fields |

## Token Storage

After successful login/verification:
1. JWT token is received from backend
2. Token is stored in localStorage (via `onLogin` callback)
3. Token is sent with all subsequent API requests as:
   ```
   Authorization: Bearer <token>
   ```

## API Calls Example

### Request Headers
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Signup Request
```javascript
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Signup Response
```javascript
{
  "message": "Registration successful! OTP sent to your email.",
  "email": "john@example.com"
}
```

### Verify OTP Request
```javascript
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Verify OTP Response
```javascript
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

## Frontend Testing Checklist

- [ ] Signup form displays correctly
- [ ] Password strength validation works in real-time
- [ ] Signup button disabled until password is valid
- [ ] Signup API called with correct data
- [ ] OTP input step shows after signup
- [ ] OTP can be entered and verified
- [ ] "Resend OTP" button works
- [ ] Successful verification redirects to dashboard
- [ ] Login form displays correctly
- [ ] Login works for verified users
- [ ] Login shows error for unverified email
- [ ] "Resend OTP" option appears on verification error
- [ ] Token is stored and used in subsequent requests

## Component Files

- [AuthPage](../frontend/src/pages/AuthPage.js)
- [Signup Component](../frontend/src/components/Auth/Signup.js)
- [Login Component](../frontend/src/components/Auth/Login.js)
- [Auth API](../frontend/src/api/authAPI.js)

## Backend Integration

The frontend communicates with these backend endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login user |

All backend endpoints are documented in [EMAIL_VERIFICATION_SETUP.md](../EMAIL_VERIFICATION_SETUP.md)

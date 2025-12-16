# Email Verification Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  AuthPage.js     │  │  Signup.js       │  Login.js          │
│  │                  │  │  - Password      │  - Email/Pass      │
│  │  - Route switch  │  │    validation    │  - Submit to login  │
│  │  - Auth/Unauth   │  │  - Step manager  │  - Resend OTP      │
│  │                  │  │  - Form state    │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           ▲                      ▲                              │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      │                                          │
│              ┌───────▼────────┐                                │
│              │  authAPI.js    │                                │
│              │                │                                │
│              │ register()     │                                │
│              │ verifyOtp()    │                                │
│              │ resendOtp()    │                                │
│              │ login()        │                                │
│              └───────┬────────┘                                │
│                      │                                          │
│              HTTP POST/JSON                                     │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              routes/authRoutes.js                       │   │
│  │  ┌──────────────┬──────────────────┬──────────────┐   │   │
│  │  │ /signup      │ /verify-otp      │ /resend-otp  │   │   │
│  │  │ /login       │                  │              │   │   │
│  │  └──────────────┴──────────────────┴──────────────┘   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │        controllers/authController.js                    │   │
│  │                                                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ signup() │ │verifyOTP │ │resendOTP │ │ login()  │  │   │
│  │  │          │ │          │ │          │ │          │  │   │
│  │  │- Validate│ │- Verify  │ │- Generate│ │- Check   │  │   │
│  │  │- Hash PW │ │  OTP     │ │- Save    │ │  email   │  │   │
│  │  │- Gen OTP │ │- Check   │ │- Send    │ │- Hash PW │  │   │
│  │  │- Save    │ │  expiry  │ │  email   │ │- Return  │  │   │
│  │  │- Email   │ │- Return  │ │          │ │  token   │  │   │
│  │  │          │ │  token   │ │          │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                         │
│  ┌────────────────────▼──────────────────────────────────┐   │
│  │        utils/sendEmail.js                             │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ Email Provider Selection:                     │   │   │
│  │  │ ✓ Gmail (via App Password)                   │   │   │
│  │  │ ✓ Custom SMTP                                │   │   │
│  │  │ ✓ Ethereal (Testing)                         │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                       │                              │   │
│  │  ┌────────────────────▼──────────────────────────┐  │   │
│  │  │ nodemailer                                    │  │   │
│  │  │ - Create transporter                          │  │   │
│  │  │ - Format HTML email                           │  │   │
│  │  │ - Send mail                                   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     │                                      │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      │
                 SMTP SERVER
                (Gmail/Custom/Ethereal)
                      │
                      │
                    EMAIL
                      │
                      ▼
            ┌──────────────────┐
            │ User's Mailbox   │
            │                  │
            │ Subject:         │
            │ "Your OTP:       │
            │  123456"         │
            └──────────────────┘
```

---

## Database Schema

```
MongoDB: fitness_tracker database

Collection: users
┌─────────────────────────────────────────────────────────┐
│ {                                                        │
│   _id: ObjectId,                                         │
│   name: String,                                          │
│   email: String (unique, lowercase),                     │
│   password: String (bcrypt hashed),                      │
│   isVerified: Boolean (default: false),                  │
│   otpHash: String (bcrypt hashed, undefined after auth), │
│   otpExpires: Date (undefined after auth),               │
│   createdAt: Date,                                       │
│   __v: Number                                            │
│ }                                                        │
└─────────────────────────────────────────────────────────┘

Example User (Before Verification):
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...(bcrypt hashed)...",
  isVerified: false,
  otpHash: "$2a$08$...(hashed 6-digit OTP)...",
  otpExpires: ISODate("2024-01-10T15:45:00Z"),
  createdAt: ISODate("2024-01-10T15:35:00Z"),
  __v: 0
}

Example User (After Verification):
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...(bcrypt hashed)...",
  isVerified: true,
  createdAt: ISODate("2024-01-10T15:35:00Z"),
  __v: 0
}
```

---

## Signup Flow - Sequence Diagram

```
User          Frontend         Backend           Database        Email Service
 │               │               │                 │                 │
 ├──Signup───────>│               │                 │                 │
 │                │ POST /signup  │                 │                 │
 │                ├──────────────>│                 │                 │
 │                │               ├─Validate input──│                 │
 │                │               │                 │                 │
 │                │               ├─Hash password───│                 │
 │                │               │                 │                 │
 │                │               ├─Generate OTP────│                 │
 │                │               │                 │                 │
 │                │               ├─Hash OTP────────│                 │
 │                │               │                 │                 │
 │                │               ├─Save user───────>                 │
 │                │               │                 │                 │
 │                │               ├─Send OTP email──────────────────>│
 │                │               │                 │                 │
 │                │<──Response────<─────────────────│                 │
 │                │  (Success)    │                 │                 │
 │                │               │                 │                 │
 │<─Show OTP input<               │                 │                 │
 │   screen       │               │                 │                 │
 │                │               │                 │                 │
 ├──Enter OTP───-->               │                 │                 │
 │                │ POST /verify  │                 │                 │
 │                ├──────────────>│                 │                 │
 │                │               ├─Find user───────>                 │
 │                │               │<─────────────────                 │
 │                │               │                 │                 │
 │                │               ├─Compare OTP hash│                 │
 │                │               │                 │                 │
 │                │               ├─Check expiry────│                 │
 │                │               │                 │                 │
 │                │               ├─Set verified────>                 │
 │                │               │                 │                 │
 │                │               ├─Generate token──│                 │
 │                │               │                 │                 │
 │                │<──Response────<─────────────────│                 │
 │                │  (Token)      │                 │                 │
 │                │               │                 │                 │
 │<─Redirected────<               │                 │                 │
 │   to dashboard │               │                 │                 │
 │                │               │                 │                 │
```

---

## OTP Verification Flow

```
                    ┌─────────────────────┐
                    │  User Signup        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Generate OTP       │
                    │  Random 6-digit     │
                    │  e.g., 123456       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Hash OTP           │
                    │  bcrypt(otp)        │
                    │  e.g., $2a$08$...   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Save to Database   │
                    │  otpHash: $2a$08$.. │
                    │  otpExpires: +10min │
                    │  isVerified: false  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Send Email         │
                    │  "Your OTP: 123456" │
                    │  Expires in 10 min  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  User Gets Email    │
                    │  Copy OTP code      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  User Enters OTP    │
                    │  OTP Input: 123456  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Verify OTP         │
                    │  bcrypt.compare()   │
                    │  (user_input vs db) │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐          ┌────────▼──────────┐
        │  Valid OTP?    │          │  Expired?         │
        │  & Not Expired │          │  (> 10 min)       │
        └────────┬────────┘          └────────┬──────────┘
                 │ YES                        │ YES
        ┌────────▼──────────────┐  ┌─────────▼─────────┐
        │  Set isVerified: true │  │  Return Error     │
        │  Clear otpHash        │  │  "OTP Expired"    │
        │  Clear otpExpires     │  │  User can resend  │
        │  Save to database     │  │                   │
        └────────┬──────────────┘  └───────────────────┘
                 │
        ┌────────▼──────────────┐
        │  Generate JWT Token   │
        │  { id, email, name }  │
        │  Expires in 7 days    │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │  Return Success       │
        │  - message            │
        │  - token              │
        │  - user data          │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │  User Logged In       │
        │  Can access dashboard │
        │  Can create workouts  │
        └───────────────────────┘
```

---

## Password Strength Validation

```
User Input Password
        │
        ▼
┌──────────────────────────────────┐
│ Check length >= 8                │
│ ✓ Has uppercase (A-Z)            │
│ ✓ Has lowercase (a-z)            │
│ ✓ Has number (0-9)               │
│ ✓ Has special char (!@#$%^&*)    │
└──────────┬───────────────────────┘
           │
     ┌─────▼──────┐
     │ All valid? │
     └─────┬──────┘
           │
    ┌──────┴──────┐
    │ NO          │ YES
    ▼             ▼
┌─────────┐  ┌──────────┐
│ Error   │  │ Allowed  │
│ message │  │ to login │
└─────────┘  └──────────┘

Examples:

❌ "weak"              - Too short, no uppercase/number/special
❌ "Weak123"           - No special character
❌ "STRONG123"         - No lowercase
❌ "StrongPassword"    - No number or special
✅ "Strong@Pass123"    - All requirements met
✅ "MySecure#Pwd2024"  - All requirements met
```

---

## Email Provider Selection Logic

```
                    ┌─────────────────────┐
                    │ Check .env variables│
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼─────┐  ┌────▼────┐  ┌────▼──────┐
        │ Gmail       │  │ Custom   │  │ Default   │
        │ configured? │  │ SMTP?    │  │ (Ethereal)│
        └───┬───┬─────┘  └────┬─────┘  └────┬──────┘
            │YES              │ YES        (No config)
       ┌────▼────┐       ┌────▼──────┐     │
       │ Create  │       │ Create    │     │
       │ Gmail   │       │ Custom    │     │
       │ Transport│       │ Transport │     │
       └────┬────┘       └────┬──────┘     │
            │                 │     ┌──────▼───┐
            │                 │     │ Create   │
            │                 │     │ Ethereal │
            │                 │     │ Transport│
            └─────┬───────────┘     └──────┬───┘
                  │                        │
                  └────────┬───────────────┘
                           │
                    ┌──────▼──────────┐
                    │ Format Email    │
                    │ - To            │
                    │ - Subject       │
                    │ - HTML body     │
                    │ - OTP code      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Send via SMTP   │
                    │ transporter.    │
                    │ sendMail()      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Success/Error   │
                    │ return result   │
                    └─────────────────┘
```

---

## Error Handling Flow

```
Request to Backend
        │
        ▼
┌──────────────────────┐
│ Validate Input       │
├──────────────────────┤
│ - Check required     │
│   fields            │
│ - Format validation  │
└───┬──────────┬───────┘
    │ VALID    │ INVALID
    ▼          ▼
┌──────┐  ┌──────────────┐
│Next  │  │ Return 400   │
│Step  │  │ Error + msg  │
└──┬───┘  └──────────────┘
   │
   ▼
┌──────────────────────┐
│ Database Operations  │
├──────────────────────┤
│ - Query/Update       │
│ - Handle errors      │
└───┬──────────┬───────┘
    │ SUCCESS  │ ERROR
    ▼          ▼
┌──────┐  ┌──────────────┐
│Next  │  │ Return 500   │
│Step  │  │ DB error msg │
└──┬───┘  └──────────────┘
   │
   ▼
┌──────────────────────┐
│ Return Success       │
├──────────────────────┤
│ Status 200/201       │
│ Data + message       │
│ Token (if auth)      │
└──────────────────────┘
```

---

## Token Authentication Flow

```
POST /api/workouts
with Authorization Header
        │
        ▼
┌─────────────────────────┐
│ Extract Token from      │
│ Authorization Header    │
│ "Bearer <token>"        │
└────────┬────────────────┘
         │
    ┌────▼─────┐
    │ Token     │
    │ exists?   │
    └────┬──────┘
         │
    ┌────┴─────┐
    │ NO        │ YES
    ▼           ▼
┌────────┐  ┌───────────────────┐
│Return  │  │ Verify JWT token  │
│ 401    │  │ jwt.verify()      │
│Unauth. │  └──────┬──────┬─────┘
└────────┘         │      │
              VALID│      │INVALID
                   ▼      ▼
             ┌────────┐  ┌────────┐
             │ Extract│  │Return  │
             │ payload│  │ 401    │
             │ (id,   │  │Invalid │
             │ email) │  │token   │
             └────┬───┘  └────────┘
                  │
             ┌────▼─────────┐
             │ Store user   │
             │ in req.user  │
             └────┬─────────┘
                  │
             ┌────▼─────────┐
             │ Call next    │
             │ middleware/  │
             │ route handler│
             └──────────────┘
```

---

## Complete Request-Response Cycle: Signup

```
┌──────────────────────────────────────────────────────────────────────┐
│                         COMPLETE SIGNUP FLOW                         │
└──────────────────────────────────────────────────────────────────────┘

CLIENT REQUEST:
┌─ POST /api/auth/signup ────────────────────────────────────────────┐
│ {                                                                   │
│   "name": "John Doe",                                              │
│   "email": "john@example.com",                                     │
│   "password": "SecurePass123!"                                     │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
SERVER PROCESSING:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ 1. authController.signup()                                         │
│    - Validate input (name, email, password exist)                 │
│    - Validate password (8+, upper, lower, num, special)           │
│    - Check email not registered                                   │
│                                                                     │
│ 2. Hash password                                                   │
│    bcrypt.genSalt(10) + bcrypt.hash(password, salt)               │
│    Result: $2a$10$...[64 chars]...                                │
│                                                                     │
│ 3. Generate OTP                                                    │
│    Math.floor(100000 + Math.random() * 900000)                    │
│    Result: 123456 (6-digit)                                       │
│                                                                     │
│ 4. Hash OTP                                                        │
│    bcrypt.hash(otp, 8)                                            │
│    Result: $2a$08$...[64 chars]...                                │
│                                                                     │
│ 5. Set expiry                                                      │
│    Date.now() + 10 * 60 * 1000 = 10 minutes from now             │
│                                                                     │
│ 6. Create user                                                     │
│    User.create({                                                   │
│      name, email, password: hashed,                               │
│      isVerified: false,                                            │
│      otpHash: hashed_otp,                                          │
│      otpExpires: expiry_date                                       │
│    })                                                              │
│                                                                     │
│ 7. Send email                                                      │
│    sendEmail(email, otp_plaintext)                                │
│    - Creates transporter (Gmail/SMTP/Ethereal)                   │
│    - Formats HTML email with OTP                                  │
│    - Sends via nodemailer                                         │
│                                                                     │
│ 8. Return response                                                 │
│    status: 201                                                     │
│    message: "OTP sent..."                                         │
│    email: "john@example.com"                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
SERVER RESPONSE:
┌─ HTTP 201 Created ────────────────────────────────────────────────┐
│ {                                                                  │
│   "message": "Registration successful!                            │
│              OTP sent to your email.                              │
│              Please verify within 10 minutes.",                   │
│   "email": "john@example.com"                                     │
│ }                                                                  │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
DATABASE STATE:
┌─ MongoDB users collection ────────────────────────────────────────┐
│ {                                                                  │
│   _id: ObjectId("..."),                                            │
│   name: "John Doe",                                                │
│   email: "john@example.com",                                       │
│   password: "$2a$10$...[hashed]...",                              │
│   isVerified: false,                                               │
│   otpHash: "$2a$08$...[hashed]...",                               │
│   otpExpires: Date("2024-01-10T15:45:30.000Z"),                   │
│   createdAt: Date("2024-01-10T15:35:30.000Z"),                    │
│   __v: 0                                                           │
│ }                                                                  │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
EMAIL SENT:
┌─────────────────────────────────────────────────────────────────┐
│ From: Fitness Tracker <noreply@app.com>                         │
│ To: john@example.com                                             │
│ Subject: Your Verification OTP - Fitness Tracker               │
│                                                                  │
│ [HTML EMAIL]                                                     │
│                                                                  │
│ Email Verification                                               │
│ Thank you for signing up!                                        │
│                                                                  │
│                    123456                                        │
│                                                                  │
│ This code expires in 10 minutes.                                 │
│ Do not share this code with anyone.                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Verification Flow Diagram

```
User receives email with OTP (e.g., 123456)
                │
                ▼
User enters OTP in frontend form
                │
                ▼
Frontend sends: POST /api/auth/verify-otp
                 { email, otp: "123456" }
                │
                ▼
authController.verifyOTP() executes
                │
┌───────────────┼───────────────┐
│               │               │
▼               ▼               ▼

Validate    Find user    Check already
input       in DB        verified?
│           │            │
└─┬─────────┘            │ YES
  │ INVALID              │
  ├─> Return 400         └─> Return 400
  │   Error              │   "Already verified"
  │                      │
  │              │ NO (not verified)
  │              ▼
  │         Check OTP exists
  │         & not expired
  │         │
  │    ┌────┴────┐
  │    │ EXPIRED │
  │    ▼         ▼ OK
  │   Return   Compare hashes
  │    400     bcrypt.compare()
  │   "OTP      │
  │  expired"   ├─ Match? ─┐
  │             │         │
  │             │    YES   NO
  │             │     │     │
  │             │     ▼     └─> Return 400
  │             │   Update       "Invalid OTP"
  │             │   user:
  │             │   - isVerified = true
  │             │   - otpHash = undefined
  │             │   - otpExpires = undefined
  │             │   - save()
  │             │     │
  │             │     ▼
  │             │   Generate JWT token
  │             │   jwt.sign({
  │             │     id, email, name
  │             │   }, JWT_SECRET)
  │             │     │
  │             │     ▼
  │             │   Return 200
  │             │   {
  │             │     message: "Success",
  │             │     token: "eyJ...",
  │             │     user: { id, email, name }
  │             │   }
  │             │     │
  │             │     ▼
  └─────────────┴──> Frontend receives
                    - Stores token
                    - Redirects to dashboard
                    - User is authenticated!
```

---

This completes the architecture documentation!

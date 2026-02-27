import React, { useState } from 'react';
import { authAPI } from '../../api/authAPI';
import './Auth.css';

function Signup({ onSignup }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validatePassword = (pwd) => {
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    return { hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  const passwordValidation = validatePassword(form.password);
  const isPasswordValid = Object.values(passwordValidation).every(v => v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOtp('');
    try {
      const res = await authAPI.register(form);
      setStep('otp');
      setOtpSent(true);
      setSecondsLeft(5 * 60);
    } catch (err) {
      console.error('Signup error:', err);
      
      let message = 'Signup failed';
      
      if (err?.response?.status === 503) {
        message = '❌ Email service temporarily unavailable. Please try again later.';
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.response?.status) {
        message = `Server error: ${err.response.status}. Please check your connection and try again.`;
      } else if (err?.request && !err?.response) {
        message = '❌ Cannot reach server. Make sure the backend is running and you have internet connection.';
      } else {
        message = err?.message || 'Signup failed. Please try again.';
      }
      
      setError(message);
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOtp({ email: form.email, otp });
      setStep('success');
      const data = res.data || res;
      setTimeout(() => onSignup(data), 1500);
    } catch (err) {
      console.error('OTP verification error:', err);
      
      let message = 'OTP verification failed';
      
      if (err?.response?.status === 400) {
        message = err?.response?.data?.message || 'Invalid OTP. Please try again.';
      } else if (err?.response?.status === 429) {
        message = '⏱️ Too many attempts. Please wait before trying again.';
      } else if (err?.request && !err?.response) {
        message = '❌ Cannot reach server. Please check your connection.';
      } else {
        message = err?.response?.data?.message || err?.message || 'Verification failed. Please try again.';
      }
      
      setError(message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setOtp('');
    try {
      await authAPI.resendOtp({ email: form.email });
      setSecondsLeft(5 * 60);
      setError('');
    } catch (err) {
      console.error('Resend OTP error:', err);
      
      let message = 'Failed to resend OTP';
      
      if (err?.response?.status === 429) {
        message = '⏱️ Too many requests. Please wait 30 seconds before resending.';
      } else if (err?.request && !err?.response) {
        message = '❌ Cannot reach server. Please check your connection.';
      } else {
        message = err?.response?.data?.message || err?.message || 'Failed to resend OTP. Try again later.';
      }
      
      setError(message);
    }
    setLoading(false);
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtp('');
    setError('');
    setOtpSent(false);
    setSecondsLeft(0);
  };

  React.useEffect(() => {
    if (!secondsLeft) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      
      {/* Progress Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          opacity: step === 'form' || step === 'otp' || step === 'success' ? 1 : 0.5
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: step === 'form' ? '#3b82f6' : '#10b981',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            marginRight: '8px'
          }}>
            {step === 'form' ? '1' : '✓'}
          </div>
          <span style={{ fontSize: '12px' }}>Account Info</span>
        </div>

        <div style={{ 
          flex: 1, 
          height: '2px', 
          background: (step === 'otp' || step === 'success') ? '#10b981' : '#e5e7eb',
          margin: '0 12px'
        }}></div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          opacity: step === 'otp' || step === 'success' ? 1 : 0.5
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: step === 'otp' ? '#3b82f6' : step === 'success' ? '#10b981' : '#e5e7eb',
            color: step === 'otp' ? 'white' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            marginLeft: '8px'
          }}>
            {step === 'success' ? '✓' : '2'}
          </div>
          <span style={{ fontSize: '12px' }}>Verify Email</span>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {/* Step 1: Account Information */}
      {step === 'form' && (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Create a secure account by entering your details below.
          </p>

          <label>Full Name</label>
          <input 
            name="name" 
            type="text" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="John Doe"
            required 
          />

          <label>Email Address</label>
          <input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="john@example.com"
            required 
          />

          <label>Password</label>
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Enter a strong password"
            required 
          />
          
          {form.password && (
            <div style={{ marginTop: 12, padding: 12, background: '#f3f4f6', borderRadius: 4, fontSize: 12 }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Password requirements:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ color: passwordValidation.hasLength ? '#10b981' : '#ef4444' }}>
                  {passwordValidation.hasLength ? '✓' : '✗'} At least 8 characters
                </div>
                <div style={{ color: passwordValidation.hasUpper ? '#10b981' : '#ef4444' }}>
                  {passwordValidation.hasUpper ? '✓' : '✗'} Uppercase letter (A-Z)
                </div>
                <div style={{ color: passwordValidation.hasLower ? '#10b981' : '#ef4444' }}>
                  {passwordValidation.hasLower ? '✓' : '✗'} Lowercase letter (a-z)
                </div>
                <div style={{ color: passwordValidation.hasNumber ? '#10b981' : '#ef4444' }}>
                  {passwordValidation.hasNumber ? '✓' : '✗'} Number (0-9)
                </div>
                <div style={{ color: passwordValidation.hasSpecial ? '#10b981' : '#ef4444' }}>
                  {passwordValidation.hasSpecial ? '✓' : '✗'} Special character (!@#$%^&*)
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            background: '#fef3c7', 
            border: '1px solid #fcd34d', 
            padding: '10px 12px', 
            borderRadius: '6px', 
            marginTop: '16px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#92400e'
          }}>
            🔐 We'll send a verification code to your email. You must enter it to complete signup.
          </div>
          
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading || !isPasswordValid}
          >
            {loading ? 'Processing…' : 'Continue to Verification'}
          </button>
        </form>
      )}

      {/* Step 2: Email Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerify}>
          <div style={{ 
            background: '#dbeafe', 
            border: '2px solid #0284c7', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontSize: '13px',
            color: '#0c4a6e'
          }}>
            ✉️ <strong>Verification Code Sent</strong><br/>
            We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to verify and create your account.
          </div>
          
          {secondsLeft > 0 ? (
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              ⏱️ Code expires in <strong>{formatTime(secondsLeft)}</strong>
            </p>
          ) : (
            <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '12px' }}>
              ⏰ Code expired. Please resend.
            </p>
          )}

          <label>Enter 6-Digit Code</label>
          <input 
            name="otp" 
            type="text" 
            maxLength="6"
            placeholder="000000"
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
            required 
            style={{ 
              textAlign: 'center', 
              fontSize: '28px', 
              letterSpacing: '8px', 
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}
          />

          <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
            Check your spam folder if you don't see the email.
          </p>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading || otp.length !== 6}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Verifying…' : 'Verify & Create Account'}
          </button>

          <button 
            type="button" 
            className="auth-btn" 
            onClick={handleResend} 
            disabled={loading} 
            style={{ marginTop: 8, background:'#f59e0b' }}
          >
            📧 Resend Code
          </button>

          <button 
            type="button" 
            className="auth-btn" 
            onClick={handleBackToForm} 
            disabled={loading} 
            style={{ marginTop: 8, background:'#6b7280' }}
          >
            ← Back to Account Info
          </button>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>✅</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#059669' }}>
            Account Created Successfully!
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Your email has been verified and your account is ready to use.
          </p>
          <p style={{ fontSize: '13px', color: '#999' }}>Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default Signup;

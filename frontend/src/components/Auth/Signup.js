import React, { useState } from 'react';
import { authAPI } from '../../api/authAPI';
import './Auth.css';

function Signup({ onSignup }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'success'
  const [otp, setOtp] = useState('');

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
    try {
      const res = await authAPI.register(form);
      // registration creates user and sends OTP
      setStep('verify');
    } catch (err) {
      console.error('Signup error raw:', err);
      const serverMsg = err?.response?.data?.message || err?.response?.data || null;
      const status = err?.response?.status;
      const message = serverMsg ? `${serverMsg}${status ? ` (status ${status})` : ''}` : err?.message || 'Signup failed';
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
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => onSignup(res.data), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.resendOtp({ email: form.email });
    } catch (err) {
      setError('Failed to resend OTP');
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2>Sign Up</h2>
      {error && <div className="auth-error">{error}</div>}
      {step === 'form' && (
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" type="text" value={form.name} onChange={handleChange} required />
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          
          {form.password && (
            <div style={{ marginTop: 12, padding: 12, background: '#f3f4f6', borderRadius: 4, fontSize: 12 }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Password must have:</p>
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
          
          <button type="submit" className="auth-btn" disabled={loading || !isPasswordValid}>{loading ? 'Signing up…' : 'Sign Up'}</button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify}>
          <p>We sent a 6-digit OTP to <strong>{form.email}</strong>. Enter it below to verify your email.</p>
          <label>OTP</label>
          <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Verifying…' : 'Verify'}</button>
          <button type="button" className="auth-btn" onClick={handleResend} disabled={loading} style={{ marginTop: 8, background:'#f59e0b' }}>Resend OTP</button>
        </form>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>✅ Email verified successfully!</p>
          <p>Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default Signup;

import React, { useState } from 'react';
import { authAPI } from '../../api/authAPI';
import './Auth.css';

function Login({ onLogin, openReset }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      const data = res.data || res;
      onLogin(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      setError(msg);
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.resendOtp({ email: form.email });
      setError('OTP sent if account exists and is unverified');
      setSecondsLeft(5 * 60);
    } catch (err) {
      setError('Failed to send OTP');
    }
    setLoading(false);
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.loginWithOtp({ email: form.email, otp });
      const data = res.data || res;
      onLogin(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'OTP login failed';
      setError(msg);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    // kept for compatibility but use authAPI.resendOtp
    await handleSendOtp();
  };

  // (forgot-password UI removed; use reset flow from AuthPage if needed)

  // countdown effect
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
      <h2>Login</h2>
      {error && <div className="auth-error">{error}</div>}
      {!useOtp && (
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
          {/* Forgot-password removed from login card */}
        </form>
      )}

      {useOtp && (
        <form onSubmit={handleOtpLogin}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>OTP</label>
          <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          {secondsLeft > 0 ? (
            <p>OTP expires in <strong>{formatTime(secondsLeft)}</strong></p>
          ) : (
            <p style={{ color: '#ef4444' }}>OTP expired. Please resend.</p>
          )}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="link-reset" onClick={handleSendOtp} disabled={loading}>Send OTP</button>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Logging in…' : 'Login with OTP'}</button>
        </form>
      )}

      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <button type="button" className="link-reset" onClick={() => setUseOtp(u => !u)}>{useOtp ? 'Use Password Instead' : 'Use OTP Instead'}</button>
      </div>
    
    </div>
  );
}

export default Login;

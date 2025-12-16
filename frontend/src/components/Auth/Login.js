import React, { useState } from 'react';
import { authAPI } from '../../api/authAPI';
import './Auth.css';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      onLogin(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
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
      onLogin(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'OTP login failed';
      setError(msg);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
      setError('OTP resent if account exists and is unverified');
    } catch (e) {
      setError('Failed to resend OTP');
    }
    setLoading(false);
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
        </form>
      )}

      {useOtp && (
        <form onSubmit={handleOtpLogin}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>OTP</label>
          <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Logging in…' : 'Login with OTP'}</button>
          <button type="button" className="auth-btn" onClick={handleSendOtp} disabled={loading} style={{ marginTop: 8, background:'#f59e0b' }}>Send OTP</button>
        </form>
      )}

      <div style={{ marginTop: 8 }}>
        <button className="auth-btn" onClick={() => setUseOtp(u => !u)}>{useOtp ? 'Use Password Instead' : 'Use OTP Instead'}</button>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { authAPI } from '../../api/authAPI';
import './Auth.css';

function ResetPassword({ onReset }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'verify'
  const [secondsLeft, setSecondsLeft] = useState(0);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setError('Reset link sent to your email');
      setStep('verify');
      setSecondsLeft(5 * 60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset link');
    }
    setLoading(false);
  };

  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ email, otp, password });
      setError('Password reset successful — redirecting to login');
      setStep('email');
      setTimeout(() => {
        if (onReset) onReset();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

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
      <h2>Reset Password</h2>
      {error && <div className="auth-error">{error}</div>}

      {step === 'email' && (
        <form onSubmit={handleSendReset}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="auth-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleResetWithOtp}>
          <p>We sent a reset code to <strong>{email}</strong>. Enter it below with your new password.</p>
          <label>Reset Code (OTP)</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {secondsLeft > 0 ? (
            <p>Code expires in <strong>{formatTime(secondsLeft)}</strong></p>
          ) : (
            <p style={{ color: '#ef4444' }}>Code expired. Please resend.</p>
          )}
          <button className="auth-btn" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;


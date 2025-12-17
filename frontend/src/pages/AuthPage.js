import React, { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import ResetPassword from '../components/Auth/ResetPassword';
import './AuthPage.css';

function AuthPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'reset'

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🏋️ Exercise Progress Tracker</h1>
          <p>Track your fitness journey with dynamic charts and progress visualization</p>
        </div>

        <div className="auth-content">
          {authMode === 'login' ? (
            <>
              <Login
                onLogin={(data) => {
                  onAuthSuccess(data);
                }}
                openReset={() => setAuthMode('reset')}
              />
              <div className="auth-toggle">
                <p>Don't have an account? <button onClick={() => setAuthMode('signup')}>Sign Up</button></p>
                <p style={{ marginTop: 8 }}>Reset password? <button onClick={() => setAuthMode('reset')}>Reset</button></p>
              </div>
            </>
          ) : authMode === 'signup' ? (
            <>
              <Signup
                onSignup={(data) => {
                  onAuthSuccess(data);
                }}
              />
              <div className="auth-toggle">
                <p>Already have an account? <button onClick={() => setAuthMode('login')}>Login</button></p>
              </div>
            </>
          ) : (
            <>
              <ResetPassword
                onReset={() => setAuthMode('login')}
              />
              <div className="auth-toggle">
                <p>Back to <button onClick={() => setAuthMode('login')}>Login</button></p>
              </div>
            </>
          )}
        </div>

        <div className="auth-footer">
          <p>© 2025 Exercise Progress Tracker | Stay Fit, Stay Healthy</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

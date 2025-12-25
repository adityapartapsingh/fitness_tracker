import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import ResetPassword from '../components/Auth/ResetPassword';
import './AuthPage.css';

function AuthPage({ onAuthSuccess }) {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(mode || 'login');

  useEffect(() => {
    if (mode && mode !== authMode) {
      setAuthMode(mode);
    }
  }, [mode]);

  const handleModeChange = (newMode) => {
    setAuthMode(newMode);
    navigate(`/auth/${newMode}`);
  };

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
                openReset={() => handleModeChange('reset')}
              />
              <div className="auth-toggle">
                <p>Don't have an account? <button onClick={() => handleModeChange('signup')}>Sign Up</button></p>
                <p style={{ marginTop: 8 }}>Reset password? <button onClick={() => handleModeChange('reset')}>Reset</button></p>
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
                <p>Already have an account? <button onClick={() => handleModeChange('login')}>Login</button></p>
              </div>
            </>
          ) : (
            <>
              <ResetPassword
                onReset={() => handleModeChange('login')}
              />
              <div className="auth-toggle">
                <p>Back to <button onClick={() => handleModeChange('login')}>Login</button></p>
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

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('darkMode')) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const saveAuth = (data) => {
    if (data?.token) localStorage.setItem('token', data.token);
    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user || null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage onAuthSuccess={saveAuth} />}
        />
        <Route
          path="/auth/:mode"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage onAuthSuccess={saveAuth} />}
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                user={user}
                handleLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            ) : (
              <Navigate to="/auth/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

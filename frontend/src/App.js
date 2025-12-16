import React, { useState, useEffect } from 'react';
import { workoutAPI } from './api/workoutAPI';
import { authAPI } from './api/authAPI';
import WorkoutForm from './components/WorkoutForm';
import WorkoutList from './components/WorkoutList';
import ProgressCharts from './components/ProgressCharts';
import Statistics from './components/Statistics';
import './App.css';
import AuthPage from './pages/AuthPage';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      return stored ? 'dashboard' : 'login';
    } catch {
      return 'login';
    }
  });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // persist token/user
  const saveAuth = (data) => {
    if (data?.token) localStorage.setItem('token', data.token);
    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user || null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('login');
  };

  // Fetch all workouts
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await workoutAPI.getAllWorkouts();
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
    setLoading(false);
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await workoutAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch data only when authenticated
  useEffect(() => {
    if (user) {
      fetchWorkouts();
      fetchStats();
    }
  }, [user]);

  // Handle add workout
  const handleAddWorkout = async (workout) => {
    try {
      await workoutAPI.createWorkout(workout);
      fetchWorkouts();
      fetchStats();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  // Handle delete workout
  const handleDeleteWorkout = async (id) => {
    try {
      await workoutAPI.deleteWorkout(id);
      fetchWorkouts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // If user is not authenticated, show full-screen auth page
  if (!user) {
    return <AuthPage onAuthSuccess={saveAuth} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏋️ Exercise Progress Tracker</h1>
        <p>Track your fitness journey with dynamic charts and progress visualization</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add Workout
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
        <div style={{ marginLeft: 12 }}>
          <span style={{ marginRight: 8 }}>Hello, {user.name}</span>
          <button className="tab-button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            {stats && <Statistics stats={stats} />}
            <ProgressCharts workouts={workouts} />
          </div>
        )}

        {activeTab === 'add' && (
          <WorkoutForm onSubmit={handleAddWorkout} />
        )}

        {activeTab === 'history' && (
          <WorkoutList
            workouts={workouts}
            loading={loading}
            onDelete={handleDeleteWorkout}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Exercise Progress Tracker | Stay Fit, Stay Healthy</p>
      </footer>
    </div>
  );
}

export default App;

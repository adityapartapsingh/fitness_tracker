import React, { useState, useEffect } from 'react';
import { workoutAPI } from './api/workoutAPI';
import WorkoutForm from './components/WorkoutForm';
import WorkoutList from './components/WorkoutList';
import ProgressCharts from './components/ProgressCharts';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Initial fetch
  useEffect(() => {
    fetchWorkouts();
    fetchStats();
  }, []);

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

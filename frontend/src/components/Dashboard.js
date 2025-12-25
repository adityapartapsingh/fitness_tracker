import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../api/workoutAPI';
import WorkoutForm from './WorkoutForm';
import WorkoutList from './WorkoutList';
import ProgressCharts from './ProgressCharts';
import Statistics from './Statistics';
import StreakCalendar from './StreakCalendar';
import WeeklyStreak from './WeeklyStreak';
import Profile from './Profile';
import WaterWidget from './WaterWidget';
import AIAssistantWidget from './AIAssistantWidget';

export default function Dashboard({ user, handleLogout, setDarkMode, darkMode }) {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

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

    const fetchStats = async () => {
        try {
            const response = await workoutAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWorkouts();
            fetchStats();
        }
    }, [user]);

    const handleAddWorkout = async (workout) => {
        try {
            await workoutAPI.createWorkout(workout);
            fetchWorkouts();
            fetchStats();
        } catch (error) {
            console.error('Error adding workout:', error);
        }
    };

    const handleDeleteWorkout = async (id) => {
        try {
            await workoutAPI.deleteWorkout(id);
            fetchWorkouts();
            fetchStats();
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    const getStreakInfo = () => {
        if (workouts.length === 0) {
            return { currentStreak: 0, longestStreak: 0, streakPoints: 0 };
        }
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const dates = sortedWorkouts.map(w => new Date(w.date).toDateString());
        const uniqueDates = [...new Set(dates)];
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;
        for (let i = 0; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const nextDate = i + 1 < uniqueDates.length ? new Date(uniqueDates[i + 1]) : null;
            if (nextDate) {
                const diffTime = Math.abs(currentDate - nextDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
            }
        }
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastWorkoutDateStr = uniqueDates[0];
        if (lastWorkoutDateStr === today || lastWorkoutDateStr === yesterday) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }
        const streakPoints = (currentStreak * 10) + (longestStreak * 5);
        return { currentStreak, longestStreak, streakPoints };
    };

    const streakInfo = user ? getStreakInfo() : { currentStreak: 0, longestStreak: 0, streakPoints: 0 };

    return (
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
            <nav className="nav-tabs">
                <div className="nav-title">📊 Exercise Progress Tracker</div>
                <div className="nav-buttons">
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
                    <button
                        className={`tab-button ${activeTab === 'streaks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('streaks')}
                    >
                        🔥 Streaks
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                    <div className="streak-display">
                        <span className="streak-item">🔥 {streakInfo.currentStreak} day streak</span>
                        <span className="streak-item">⭐ {streakInfo.streakPoints} points</span>
                    </div>
                    <div className="nav-user-info">
                        <span>Hello, {user.name}</span>
                        <button
                            className="theme-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                            title="Toggle dark mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button className="tab-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <main className="app-main">
                {activeTab === 'dashboard' && (
                    <div className="dashboard">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <WeeklyStreak workouts={workouts} />
                            <WaterWidget />
                        </div>
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

                {activeTab === 'streaks' && (
                    <StreakCalendar workouts={workouts} />
                )}

                {activeTab === 'profile' && (
                    <Profile />
                )}
            </main>

            <footer className="app-footer">
                <p>© 2025 Exercise Progress Tracker | Stay Fit, Stay Healthy</p>
            </footer>
            <AIAssistantWidget userToken={localStorage.getItem('token')} />
        </div>
    );
}

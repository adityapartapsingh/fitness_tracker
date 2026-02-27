import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../api/client';
import WorkoutForm from './WorkoutForm';
import WorkoutList from './WorkoutList';
import ProgressCharts from './ProgressCharts';
import Statistics from './Statistics';
import StreakCalendar from './StreakCalendar';
import WeeklyStreak from './WeeklyStreak';
import Profile from './Profile';
import WaterWidget from './WaterWidget';
import AIAssistantWidget from './AIAssistantWidget';
import ExerciseLibrary from './ExerciseLibrary';
import MealTracker from './MealTracker';
import BodyMeasurements from './BodyMeasurements';
import WeeklyReport from './WeeklyReport';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import WorkoutTimer from './WorkoutTimer';
import ExportData from './ExportData';

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'report', icon: '📈', label: 'Reports' },
        ],
    },
    {
        label: 'Fitness',
        items: [
            { id: 'add', icon: '➕', label: 'Log Workout' },
            { id: 'history', icon: '📋', label: 'History' },
            { id: 'exercises', icon: '💪', label: 'Exercises' },
            { id: 'timer', icon: '⏱️', label: 'Timer' },
            { id: 'streaks', icon: '🔥', label: 'Streaks' },
        ],
    },
    {
        label: 'Nutrition',
        items: [
            { id: 'meals', icon: '🍽️', label: 'Meals' },
        ],
    },
    {
        label: 'Body',
        items: [
            { id: 'body', icon: '📏', label: 'Measurements' },
        ],
    },
    {
        label: 'Community',
        items: [
            { id: 'achievements', icon: '🏆', label: 'Achievements' },
            { id: 'leaderboard', icon: '🏅', label: 'Leaderboard' },
        ],
    },
    {
        label: 'Settings',
        items: [
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'export', icon: '📥', label: 'Export Data' },
        ],
    },
];

const PAGE_TITLES = {
    dashboard: 'Dashboard', add: 'Log Workout', history: 'Workout History',
    exercises: 'Exercise Library', meals: 'Meal Tracker', streaks: 'Streaks',
    profile: 'Profile', body: 'Body Measurements', report: 'Reports',
    achievements: 'Achievements', leaderboard: 'Leaderboard', timer: 'Workout Timer',
    export: 'Export Data',
};

export default function Dashboard({ user, handleLogout, setDarkMode, darkMode }) {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileOpen, setMobileOpen] = useState(false);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await workoutAPI.getAll();
            setWorkouts(response.data || []);
        } catch (error) {
            console.error('Error fetching workouts:', error);
            setWorkouts([]);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const response = await workoutAPI.getStats();
            setStats(response.data || null);
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
            await workoutAPI.create(workout);
            fetchWorkouts();
            fetchStats();
        } catch (error) {
            console.error('Error adding workout:', error);
        }
    };

    const handleDeleteWorkout = async (id) => {
        try {
            await workoutAPI.delete(id);
            fetchWorkouts();
            fetchStats();
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    const getStreakInfo = () => {
        if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
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
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    const navigate = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    return (
        <div className={`app-layout ${darkMode ? 'dark-mode' : ''}`}>
            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">⚡</div>
                    <div>
                        <div className="brand-text">FitTracker</div>
                        <div className="brand-sub">Pro Dashboard</div>
                    </div>
                </div>

                {NAV_SECTIONS.map(section => (
                    <div className="sidebar-section" key={section.label}>
                        <div className="sidebar-section-label">{section.label}</div>
                        <div className="sidebar-nav">
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => navigate(item.id)}
                                >
                                    <span className="sidebar-item-icon">{item.icon}</span>
                                    <span className="sidebar-item-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user.name}</div>
                            <div className="sidebar-user-role">Member</div>
                        </div>
                    </div>
                    <div className="sidebar-actions">
                        <button className="sidebar-action-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
                            {darkMode ? '☀️' : '🌙'} Theme
                        </button>
                        <button className="sidebar-action-btn" onClick={handleLogout} title="Sign out">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Main content */}
            <div className="main-content">
                {/* Top bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
                        <h1 className="topbar-page-title">{PAGE_TITLES[activeTab] || 'Dashboard'}</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-streak">
                            <span className="topbar-streak-item">🔥 {streakInfo.currentStreak}d streak</span>
                            <span className="topbar-streak-item">⭐ {streakInfo.streakPoints} pts</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="page-content">
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
                    {activeTab === 'add' && <WorkoutForm onSubmit={handleAddWorkout} />}
                    {activeTab === 'history' && (
                        <WorkoutList workouts={workouts} loading={loading} onDelete={handleDeleteWorkout} />
                    )}
                    {activeTab === 'exercises' && <ExerciseLibrary />}
                    {activeTab === 'meals' && <MealTracker />}
                    {activeTab === 'streaks' && <StreakCalendar workouts={workouts} />}
                    {activeTab === 'profile' && <Profile />}
                    {activeTab === 'body' && <BodyMeasurements />}
                    {activeTab === 'report' && <WeeklyReport />}
                    {activeTab === 'achievements' && <Achievements />}
                    {activeTab === 'leaderboard' && <Leaderboard />}
                    {activeTab === 'timer' && <WorkoutTimer />}
                    {activeTab === 'export' && <ExportData />}
                </main>

                <footer className="app-footer">
                    <p>© 2025 FitTracker Pro — Stay Fit, Stay Healthy</p>
                </footer>
            </div>

            <AIAssistantWidget userToken={localStorage.getItem('token')} />
        </div>
    );
}

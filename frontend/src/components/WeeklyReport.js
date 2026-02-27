import React, { useState, useEffect } from 'react';
import { workoutAPI, aiAPI } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';
import './WeeklyReport.css';

export default function WeeklyReport() {
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState('');
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        workoutAPI.getReport(period)
            .then(r => setReport(r.data || null))
            .catch(() => setReport(null))
            .finally(() => setLoading(false));
    }, [period]);

    const fetchInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await aiAPI.getInsights();
            setInsights(res.assistant || 'No insights available.');
        } catch { setInsights('Failed to load insights.'); }
        setInsightsLoading(false);
    };

    if (loading) return <div className="loading">Loading report…</div>;
    if (!report) return <div className="empty-state">No data available yet.</div>;

    const calChange = report.prevTotalCalories > 0 ? Math.round(((report.totalCalories - report.prevTotalCalories) / report.prevTotalCalories) * 100) : 0;
    const workoutChange = report.prevTotalWorkouts > 0 ? Math.round(((report.totalWorkouts - report.prevTotalWorkouts) / report.prevTotalWorkouts) * 100) : 0;

    return (
        <div className="weekly-report">
            <div className="wr-header">
                <h2>📊 {period === 'weekly' ? 'Weekly' : 'Monthly'} Report</h2>
                <div className="wr-toggle">
                    <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>7 Days</button>
                    <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>30 Days</button>
                </div>
            </div>

            <div className="wr-summary-cards">
                <div className="wr-card">
                    <div className="wr-card-icon">🏋️</div>
                    <div className="wr-card-value">{report.totalWorkouts}</div>
                    <div className="wr-card-label">Workouts</div>
                    {workoutChange !== 0 && <div className={`wr-change ${workoutChange >= 0 ? 'up' : 'down'}`}>{workoutChange >= 0 ? '↑' : '↓'} {Math.abs(workoutChange)}%</div>}
                </div>
                <div className="wr-card">
                    <div className="wr-card-icon">🔥</div>
                    <div className="wr-card-value">{report.totalCalories}</div>
                    <div className="wr-card-label">Calories Burned</div>
                    {calChange !== 0 && <div className={`wr-change ${calChange >= 0 ? 'up' : 'down'}`}>{calChange >= 0 ? '↑' : '↓'} {Math.abs(calChange)}%</div>}
                </div>
                <div className="wr-card">
                    <div className="wr-card-icon">⏱️</div>
                    <div className="wr-card-value">{report.totalDuration}</div>
                    <div className="wr-card-label">Minutes</div>
                </div>
                <div className="wr-card">
                    <div className="wr-card-icon">💧</div>
                    <div className="wr-card-value">{report.waterGoalDays}</div>
                    <div className="wr-card-label">Water Goal Days</div>
                </div>
            </div>

            {report.nutrition && (
                <div className="wr-nutrition">
                    <h3>🍽️ Nutrition Summary</h3>
                    <div className="wr-nutrition-grid">
                        <span>🔥 {report.nutrition.calories} cal</span>
                        <span>🥩 {report.nutrition.protein}g protein</span>
                        <span>🍞 {report.nutrition.carbs}g carbs</span>
                        <span>🥑 {report.nutrition.fat}g fat</span>
                    </div>
                </div>
            )}

            {report.dailyBreakdown && report.dailyBreakdown.length > 0 && (
                <div className="wr-chart">
                    <h3>Daily Activity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={report.dailyBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calories Burned" />
                            <Bar dataKey="mealCalories" fill="#10b981" radius={[4, 4, 0, 0]} name="Calories Eaten" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="wr-insights">
                <button className="wr-insights-btn" onClick={fetchInsights} disabled={insightsLoading}>
                    {insightsLoading ? '🧠 Analyzing…' : '🤖 Get AI Insights'}
                </button>
                {insights && (
                    <div className="wr-insights-content">
                        <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

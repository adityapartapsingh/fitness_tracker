import React from 'react';
import './Statistics.css';

function Statistics({ stats }) {
  // Handle null/undefined stats
  if (!stats) {
    return (
      <div className="statistics-container">
        <h2>Your Statistics</h2>
        <div className="empty-state">
          <p>No statistics available yet. Start logging workouts!</p>
        </div>
      </div>
    );
  }

  // Support both naming conventions (averageCalories and avgCalories)
  const avgCalories = stats.avgCalories ?? stats.averageCalories ?? 0;
  const totalCalories = stats.totalCalories ?? 0;
  const totalDuration = stats.totalDuration ?? 0;
  const totalWorkouts = stats.totalWorkouts ?? 0;

  return (
    <div className="statistics-container">
      <h2>Your Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-content">
            <div className="stat-value">{totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{totalCalories.toFixed(0)}</div>
            <div className="stat-label">Total Calories Burned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{totalDuration.toFixed(1)}</div>
            <div className="stat-label">Total Minutes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{avgCalories.toFixed(0)}</div>
            <div className="stat-label">Avg Calories Per Workout</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

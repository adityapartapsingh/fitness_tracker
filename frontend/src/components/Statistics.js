import React from 'react';
import './Statistics.css';

function Statistics({ stats }) {
  return (
    <div className="statistics-container">
      <h2>Your Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCalories.toFixed(0)}</div>
            <div className="stat-label">Total Calories Burned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDuration.toFixed(1)}</div>
            <div className="stat-label">Total Minutes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgCalories.toFixed(0)}</div>
            <div className="stat-label">Avg Calories Per Workout</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

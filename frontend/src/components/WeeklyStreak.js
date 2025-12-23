import React, { useMemo } from 'react';
import './WeeklyStreak.css';

function WeeklyStreak({ workouts }) {
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayIndex = date.getDay();
      const dayName = days[dayIndex];

      // Check if there's a workout on this day
      const hasWorkout = workouts.some(
        workout => new Date(workout.date).toDateString() === dateStr
      );

      weekData.push({
        date,
        dayName,
        hasWorkout,
        dateStr,
      });
    }

    return weekData;
  }, [workouts]);

  return (
    <div className="weekly-streak-container">
      <h3>This Week's Activity</h3>
      <div className="weekly-streak-grid">
        {weeklyData.map((day, index) => (
          <div key={index} className="day-box">
            <div className="day-name">{day.dayName}</div>
            <div className={`day-indicator ${day.hasWorkout ? 'active' : 'inactive'}`}>
              {day.hasWorkout ? '🔥' : '❌'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyStreak;

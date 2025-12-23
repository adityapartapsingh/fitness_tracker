import React, { useState, useMemo } from 'react';
import './StreakCalendar.css';

function StreakCalendar({ workouts }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const calendarData = useMemo(() => {
    // Get first day of the month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Create workouts map for quick lookup
    const workoutMap = new Map();
    workouts.forEach(workout => {
      const dateStr = new Date(workout.date).toDateString();
      workoutMap.set(dateStr, workout);
    });

    const calendar = [];
    let week = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toDateString();
      const hasWorkout = workoutMap.has(dateStr);

      week.push({
        day,
        date,
        dateStr,
        hasWorkout,
        isToday: dateStr === today.toDateString(),
      });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // Fill remaining cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      calendar.push(week);
    }

    return calendar;
  }, [workouts, currentYear, currentMonth, today]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="streak-calendar-container">
      <div className="calendar-header">
        <h2>🔥 Streak Calendar</h2>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-controls">
          <button className="nav-button" onClick={handlePrevMonth} title="Previous month">
            ◀ Prev
          </button>

          <div className="month-year-selector">
            <select 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="month-select"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <input 
              type="number" 
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value) || currentYear)}
              className="year-input"
              min="1900"
              max="2100"
            />
          </div>

          <button className="nav-button" onClick={handleNextMonth} title="Next month">
            Next ▶
          </button>

          <button className="today-button" onClick={handleToday} title="Go to today">
            Today
          </button>
        </div>

        <div className="month-year-display">
          {monthNames[currentMonth]} {currentYear}
        </div>

        <div className="calendar-grid">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarData.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`calendar-day ${
                  day === null ? 'empty' : ''
                } ${day?.isToday ? 'today' : ''} ${
                  day?.hasWorkout ? 'has-workout' : 'no-workout'
                }`}
              >
                {day ? (
                  <>
                    <div className="day-number">{day.day}</div>
                    <div className="day-status">
                      {day.hasWorkout ? '🔥' : ''}
                    </div>
                  </>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-box has-workout">🔥</div>
          <span>Workout completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-box no-workout"></div>
          <span>No workout</span>
        </div>
        <div className="legend-item">
          <div className="legend-box today"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

export default StreakCalendar;

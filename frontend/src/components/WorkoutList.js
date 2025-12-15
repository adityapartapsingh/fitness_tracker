import React from 'react';
import './WorkoutList.css';

function WorkoutList({ workouts, loading, onDelete }) {
  if (loading) {
    return <div className="loading">Loading workouts...</div>;
  }

  if (workouts.length === 0) {
    return (
      <div className="empty-state">
        <p>No workouts recorded yet. Start tracking your fitness journey!</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="workout-list-container">
      <h2>Workout History</h2>
      <div className="workouts-grid">
        {workouts.map((workout) => (
          <div key={workout._id} className="workout-card">
            <div className="workout-header">
              <h3>{workout.exerciseName}</h3>
              <span className="workout-date">{formatDate(workout.date)}</span>
            </div>

            <div className="workout-details">
              <div className="detail-item">
                <span className="label">⏱️ Duration:</span>
                <span className="value">{workout.duration} min</span>
              </div>
              <div className="detail-item">
                <span className="label">🔥 Calories:</span>
                <span className="value">{workout.calories} kcal</span>
              </div>

              {workout.reps && (
                <div className="detail-item">
                  <span className="label">🔁 Reps:</span>
                  <span className="value">{workout.reps}</span>
                </div>
              )}

              {workout.weight && (
                <div className="detail-item">
                  <span className="label">⚖️ Weight:</span>
                  <span className="value">{workout.weight} lbs</span>
                </div>
              )}

              {workout.notes && (
                <div className="detail-item full-width">
                  <span className="label">📝 Notes:</span>
                  <p className="notes">{workout.notes}</p>
                </div>
              )}
            </div>

            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this workout?')) {
                  onDelete(workout._id);
                }
              }}
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutList;

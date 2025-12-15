import React, { useState } from 'react';
import './WorkoutForm.css';

function WorkoutForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    exerciseName: '',
    duration: '',
    calories: '',
    reps: '',
    weight: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.exerciseName || !formData.duration || !formData.calories) {
      alert('Please fill in all required fields');
      return;
    }

    const workoutData = {
      exerciseName: formData.exerciseName,
      duration: parseFloat(formData.duration),
      calories: parseFloat(formData.calories),
      reps: formData.reps ? parseInt(formData.reps) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      notes: formData.notes,
      date: new Date(),
    };

    await onSubmit(workoutData);
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    
    setFormData({
      exerciseName: '',
      duration: '',
      calories: '',
      reps: '',
      weight: '',
      notes: '',
    });
  };

  return (
    <div className="workout-form-container">
      <div className="form-card">
        <h2>Add New Workout</h2>
        {submitted && <div className="success-message">✅ Workout added successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="exerciseName">Exercise Name *</label>
            <input
              type="text"
              id="exerciseName"
              name="exerciseName"
              value={formData.exerciseName}
              onChange={handleChange}
              placeholder="e.g., Running, Bench Press, Yoga"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 30"
                step="0.5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="calories">Calories Burned *</label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="e.g., 250"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reps">Reps (optional)</label>
              <input
                type="number"
                id="reps"
                name="reps"
                value={formData.reps}
                onChange={handleChange}
                placeholder="e.g., 12"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (lbs/kg) (optional)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 50"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about your workout..."
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn">
            ➕ Add Workout
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkoutForm;

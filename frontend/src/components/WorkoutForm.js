import React, { useState, useEffect, useRef } from 'react';
import { exerciseAPI } from '../api/client';
import './WorkoutForm.css';

function WorkoutForm({ onSubmit, prefill }) {
  const [formData, setFormData] = useState({
    exerciseName: '', duration: '', calories: '', reps: '', weight: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const dropdownRef = useRef(null);

  // Load exercise library once
  useEffect(() => {
    exerciseAPI.getAll().then(res => {
      setExercises(res.data || res || []);
    }).catch(() => { });
  }, []);

  // Accept prefill from Timer
  useEffect(() => {
    if (prefill) {
      setFormData(prev => ({ ...prev, ...prefill }));
      if (prefill.exerciseName) {
        const match = exercises.find(e => e.name.toLowerCase() === prefill.exerciseName.toLowerCase());
        if (match) setSelectedExercise(match);
      }
    }
  }, [prefill, exercises]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-calculate calories when duration changes and an exercise is selected
  useEffect(() => {
    if (selectedExercise && formData.duration) {
      const cal = Math.round(selectedExercise.caloriesPerMinute * parseFloat(formData.duration));
      setFormData(prev => ({ ...prev, calories: String(cal) }));
    }
  }, [formData.duration, selectedExercise]);

  const handleSearchChange = (value) => {
    setFormData(prev => ({ ...prev, exerciseName: value }));
    if (value.trim().length > 0) {
      const filtered = exercises.filter(e =>
        e.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
    setSelectedExercise(null);
  };

  const selectExercise = (exercise) => {
    setFormData(prev => ({
      ...prev,
      exerciseName: exercise.name,
      calories: prev.duration ? String(Math.round(exercise.caloriesPerMinute * parseFloat(prev.duration))) : prev.calories,
    }));
    setSelectedExercise(exercise);
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exerciseName || !formData.duration || !formData.calories) {
      alert('Please fill in all required fields');
      return;
    }

    await onSubmit({
      exerciseName: formData.exerciseName,
      duration: parseFloat(formData.duration),
      calories: parseFloat(formData.calories),
      reps: formData.reps ? parseInt(formData.reps) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      notes: formData.notes,
      date: new Date(),
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ exerciseName: '', duration: '', calories: '', reps: '', weight: '', notes: '' });
    setSelectedExercise(null);
  };

  return (
    <div className="workout-form-container">
      <div className="form-card">
        <h2>Log Workout</h2>
        {submitted && <div className="success-message">✅ Workout added successfully!</div>}

        <form onSubmit={handleSubmit}>
          {/* Exercise picker */}
          <div className="form-group" ref={dropdownRef}>
            <label htmlFor="exerciseName">Exercise Name *</label>
            <div className="exercise-picker">
              <input
                type="text"
                id="exerciseName"
                name="exerciseName"
                value={formData.exerciseName}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => formData.exerciseName && setShowDropdown(true)}
                placeholder="Search exercises… (e.g., Push Ups, Running)"
                autoComplete="off"
                required
              />
              {selectedExercise && (
                <span className="exercise-matched" title={`${selectedExercise.caloriesPerMinute} cal/min`}>
                  ✅ {selectedExercise.category} · {selectedExercise.caloriesPerMinute} cal/min
                </span>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="exercise-dropdown">
                  {searchResults.map(ex => (
                    <button
                      type="button"
                      key={ex._id || ex.name}
                      className="exercise-dropdown-item"
                      onClick={() => selectExercise(ex)}
                    >
                      <span className="ex-name">{ex.name}</span>
                      <span className="ex-meta">
                        {ex.category} · {ex.difficulty} · {ex.caloriesPerMinute} cal/min
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number" id="duration" name="duration"
                value={formData.duration} onChange={handleChange}
                placeholder="e.g., 30" step="0.5" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="calories">
                Calories Burned *
                {selectedExercise && <span className="auto-calc-badge">Auto</span>}
              </label>
              <input
                type="number" id="calories" name="calories"
                value={formData.calories} onChange={handleChange}
                placeholder="e.g., 250" step="1" required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reps">Reps (optional)</label>
              <input
                type="number" id="reps" name="reps"
                value={formData.reps} onChange={handleChange}
                placeholder="e.g., 12"
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Weight (lbs/kg) (optional)</label>
              <input
                type="number" id="weight" name="weight"
                value={formData.weight} onChange={handleChange}
                placeholder="e.g., 50" step="0.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes" name="notes"
              value={formData.notes} onChange={handleChange}
              placeholder="Add any notes about your workout..."
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn">➕ Log Workout</button>
        </form>
      </div>
    </div>
  );
}

export default WorkoutForm;

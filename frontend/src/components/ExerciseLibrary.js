import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../api/client';
import './ExerciseLibrary.css';

export default function ExerciseLibrary() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('');
    const [categories, setCategories] = useState({ categories: [], muscleGroups: [] });
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        exerciseAPI.getCategories().then(r => setCategories(r.data || { categories: [], muscleGroups: [] })).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;
        if (muscleGroup) params.muscleGroup = muscleGroup;
        exerciseAPI.getAll(params)
            .then(r => setExercises(r.data || []))
            .catch(() => setExercises([]))
            .finally(() => setLoading(false));
    }, [search, category, difficulty, muscleGroup]);

    const categoryIcons = { strength: '🏋️', cardio: '🏃', flexibility: '🧘', balance: '⚖️' };
    const difficultyColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };

    return (
        <div className="exercise-library">
            <h2>💪 Exercise Library</h2>

            <div className="exercise-filters">
                <input
                    type="text" placeholder="Search exercises..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="exercise-search"
                />
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {(categories.categories || []).map(c => (
                        <option key={c} value={c}>{categoryIcons[c] || ''} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="beginner">🟢 Beginner</option>
                    <option value="intermediate">🟡 Intermediate</option>
                    <option value="advanced">🔴 Advanced</option>
                </select>
                <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)}>
                    <option value="">All Muscles</option>
                    {(categories.muscleGroups || []).map(m => (
                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading exercises...</div>
            ) : exercises.length === 0 ? (
                <div className="empty-state">No exercises found. Try different filters.</div>
            ) : (
                <div className="exercise-grid">
                    {exercises.map(ex => (
                        <div
                            key={ex._id}
                            className={`exercise-card ${expanded === ex._id ? 'expanded' : ''}`}
                            onClick={() => setExpanded(expanded === ex._id ? null : ex._id)}
                        >
                            <div className="exercise-card-header">
                                <span className="exercise-icon">{categoryIcons[ex.category] || '💪'}</span>
                                <div className="exercise-card-info">
                                    <h3>{ex.name}</h3>
                                    <div className="exercise-meta">
                                        <span className="exercise-badge" style={{ background: difficultyColors[ex.difficulty] }}>
                                            {ex.difficulty}
                                        </span>
                                        <span className="exercise-equip">🔧 {ex.equipment}</span>
                                        <span className="exercise-cal">🔥 {ex.caloriesPerMinute} cal/min</span>
                                    </div>
                                </div>
                            </div>
                            {expanded === ex._id && (
                                <div className="exercise-details">
                                    <div className="exercise-muscles">
                                        <strong>Muscle Groups:</strong>
                                        <div className="muscle-tags">
                                            {ex.muscleGroups.map(m => <span key={m} className="muscle-tag">{m}</span>)}
                                        </div>
                                    </div>
                                    {ex.instructions && (
                                        <div className="exercise-instructions">
                                            <strong>Instructions:</strong>
                                            <p>{ex.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

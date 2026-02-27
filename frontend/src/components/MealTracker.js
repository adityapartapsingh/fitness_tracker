import React, { useState, useEffect } from 'react';
import { mealAPI, aiAPI } from '../api/client';
import './MealTracker.css';

export default function MealTracker() {
    const [meals, setMeals] = useState([]);
    const [todaySummary, setTodaySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fat: '' });
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStatus, setAiStatus] = useState('');

    const fetchToday = async () => {
        try {
            const res = await mealAPI.getToday();
            setTodaySummary(res.data || null);
            setMeals((res.data && res.data.meals) || []);
        } catch { setMeals([]); }
        setLoading(false);
    };

    useEffect(() => { fetchToday(); }, []);

    const handleAIFill = async () => {
        if (!form.name.trim()) {
            setAiStatus('⚠️ Enter a food name first');
            setTimeout(() => setAiStatus(''), 2000);
            return;
        }
        setAiLoading(true);
        setAiStatus('🧠 Looking up nutrition...');
        try {
            const res = await aiAPI.nutritionLookup(form.name.trim());
            if (res.success && res.data) {
                const d = res.data;
                setForm(prev => ({
                    ...prev,
                    name: d.name || prev.name,
                    calories: String(d.calories || ''),
                    protein: String(d.protein || ''),
                    carbs: String(d.carbs || ''),
                    fat: String(d.fat || ''),
                }));
                setAiStatus(`✅ Filled! (${d.servingSize || '1 serving'})`);
            } else {
                setAiStatus('❌ Could not find nutrition data');
            }
        } catch (err) {
            console.error('AI nutrition lookup failed:', err);
            setAiStatus('❌ AI lookup failed');
        }
        setAiLoading(false);
        setTimeout(() => setAiStatus(''), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.calories) return;
        try {
            await mealAPI.create({
                name: form.name,
                mealType: form.mealType,
                calories: Number(form.calories),
                protein: Number(form.protein) || 0,
                carbs: Number(form.carbs) || 0,
                fat: Number(form.fat) || 0,
            });
            setForm({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fat: '' });
            setShowForm(false);
            fetchToday();
        } catch (err) { console.error('Failed to log meal:', err); }
    };

    const handleDelete = async (id) => {
        try { await mealAPI.delete(id); fetchToday(); } catch (err) { console.error(err); }
    };

    const totals = todaySummary?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    const mealTypeIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' };
    const calorieGoal = 2200;
    const calPercent = Math.min(100, Math.round((totals.calories / calorieGoal) * 100));

    return (
        <div className="meal-tracker">
            <div className="meal-header">
                <h2>🍽️ Meal Tracker</h2>
                <button className="meal-add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Log Meal'}
                </button>
            </div>

            {showForm && (
                <form className="meal-form" onSubmit={handleSubmit}>
                    <div className="meal-form-row meal-name-row">
                        <input
                            placeholder="Food name (e.g., Grilled Chicken Breast)"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            className={`ai-fill-btn ${aiLoading ? 'loading' : ''}`}
                            onClick={handleAIFill}
                            disabled={aiLoading}
                            title="Auto-fill nutrition from AI"
                        >
                            {aiLoading ? '⏳' : '🤖'} {aiLoading ? 'Analyzing...' : 'AI Fill'}
                        </button>
                        <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })}>
                            <option value="breakfast">🌅 Breakfast</option>
                            <option value="lunch">☀️ Lunch</option>
                            <option value="dinner">🌙 Dinner</option>
                            <option value="snack">🍿 Snack</option>
                        </select>
                    </div>
                    {aiStatus && <div className="ai-status-msg">{aiStatus}</div>}
                    <div className="meal-form-row macros-row">
                        <input type="number" placeholder="Calories*" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} required />
                        <input type="number" placeholder="Protein (g)" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
                        <input type="number" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
                        <input type="number" placeholder="Fat (g)" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
                    </div>
                    <button type="submit" className="meal-submit-btn">Log Meal</button>
                </form>
            )}

            <div className="macro-summary">
                <div className="macro-card macro-total">
                    <div className="macro-label">Calories</div>
                    <div className="macro-value">{totals.calories}</div>
                    <div className="macro-bar">
                        <div className="macro-bar-fill" style={{ width: `${calPercent}%`, background: calPercent >= 100 ? '#ef4444' : '#6366f1' }} />
                    </div>
                    <div className="macro-goal">{calPercent}% of {calorieGoal} goal</div>
                </div>
                <div className="macro-card"><div className="macro-label">Protein</div><div className="macro-value">{totals.protein}g</div><div className="macro-icon">🥩</div></div>
                <div className="macro-card"><div className="macro-label">Carbs</div><div className="macro-value">{totals.carbs}g</div><div className="macro-icon">🍞</div></div>
                <div className="macro-card"><div className="macro-label">Fat</div><div className="macro-value">{totals.fat}g</div><div className="macro-icon">🥑</div></div>
            </div>

            <h3>Today's Meals ({totals.count})</h3>
            {loading ? <div className="loading">Loading…</div> : meals.length === 0 ? (
                <div className="empty-state">No meals logged today. Start by clicking "Log Meal"!</div>
            ) : (
                <div className="meal-list">
                    {meals.map(m => (
                        <div key={m._id} className="meal-item">
                            <span className="meal-type-icon">{mealTypeIcons[m.mealType] || '🍽️'}</span>
                            <div className="meal-item-info">
                                <strong>{m.name}</strong>
                                <span className="meal-item-type">{m.mealType}</span>
                            </div>
                            <div className="meal-item-macros">
                                <span>{m.calories} cal</span>
                                <span>P:{m.protein}g</span>
                                <span>C:{m.carbs}g</span>
                                <span>F:{m.fat}g</span>
                            </div>
                            <button className="meal-delete-btn" onClick={() => handleDelete(m._id)}>🗑️</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

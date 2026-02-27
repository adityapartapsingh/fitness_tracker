import React, { useState, useEffect } from 'react';
import { bodyMeasurementAPI } from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './BodyMeasurements.css';

const FIELDS = [
    { key: 'weight', label: 'Weight (kg)', icon: '⚖️', color: '#3b82f6' },
    { key: 'waist', label: 'Waist (cm)', icon: '📏', color: '#ef4444' },
    { key: 'chest', label: 'Chest (cm)', icon: '💪', color: '#10b981' },
    { key: 'arms', label: 'Arms (cm)', icon: '🦾', color: '#f59e0b' },
    { key: 'thighs', label: 'Thighs (cm)', icon: '🦵', color: '#8b5cf6' },
    { key: 'hips', label: 'Hips (cm)', icon: '📐', color: '#ec4899' },
    { key: 'bodyFat', label: 'Body Fat (%)', icon: '🔥', color: '#f97316' },
];

export default function BodyMeasurements() {
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({});
    const [activeChart, setActiveChart] = useState('weight');

    const fetchData = async () => {
        try {
            const res = await bodyMeasurementAPI.getAll();
            setMeasurements(res.data || []);
        } catch { setMeasurements([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {};
        FIELDS.forEach(f => { if (form[f.key]) data[f.key] = Number(form[f.key]); });
        if (Object.keys(data).length === 0) return;
        try {
            await bodyMeasurementAPI.create(data);
            setForm({});
            setShowForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const chartData = [...measurements].reverse().map(m => ({
        date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        ...FIELDS.reduce((acc, f) => { acc[f.key] = m[f.key]; return acc; }, {}),
    }));

    const latest = measurements[0] || {};
    const activeField = FIELDS.find(f => f.key === activeChart);

    return (
        <div className="body-measurements">
            <div className="bm-header">
                <h2>📏 Body Measurements</h2>
                <button className="bm-add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Log Measurement'}
                </button>
            </div>

            {showForm && (
                <form className="bm-form" onSubmit={handleSubmit}>
                    <div className="bm-form-grid">
                        {FIELDS.map(f => (
                            <div key={f.key} className="bm-field">
                                <label>{f.icon} {f.label}</label>
                                <input type="number" step="0.1" placeholder={f.label} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="bm-submit-btn">Save Measurement</button>
                </form>
            )}

            <div className="bm-latest-cards">
                {FIELDS.map(f => (
                    <div key={f.key} className={`bm-card ${activeChart === f.key ? 'active' : ''}`} onClick={() => setActiveChart(f.key)} style={{ borderColor: activeChart === f.key ? f.color : 'transparent' }}>
                        <span className="bm-card-icon">{f.icon}</span>
                        <div className="bm-card-value">{latest[f.key] ?? '—'}</div>
                        <div className="bm-card-label">{f.label}</div>
                    </div>
                ))}
            </div>

            {loading ? <div className="loading">Loading…</div> : chartData.length < 2 ? (
                <div className="empty-state">Log at least 2 measurements to see progress charts.</div>
            ) : (
                <div className="bm-chart-container">
                    <h3>{activeField?.icon} {activeField?.label} Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey={activeChart} stroke={activeField?.color} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

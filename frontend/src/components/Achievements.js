import React, { useState, useEffect } from 'react';
import { achievementAPI } from '../api/client';
import './Achievements.css';

export default function Achievements() {
    const [data, setData] = useState({ achievements: [], newlyUnlocked: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        achievementAPI.getAll()
            .then(r => setData(r.data || { achievements: [], newlyUnlocked: [] }))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const { achievements, newlyUnlocked } = data;
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    if (loading) return <div className="loading">Loading achievements…</div>;

    return (
        <div className="achievements-page">
            <h2>🏆 Achievements</h2>
            <div className="achievements-summary">
                <span className="ach-count">{unlocked.length} / {achievements.length} Unlocked</span>
                <div className="ach-progress-bar">
                    <div className="ach-progress-fill" style={{ width: `${(unlocked.length / Math.max(achievements.length, 1)) * 100}%` }} />
                </div>
            </div>

            {newlyUnlocked.length > 0 && (
                <div className="ach-new-banner">
                    🎉 New achievement{newlyUnlocked.length > 1 ? 's' : ''} unlocked!
                    {newlyUnlocked.map(a => <span key={a.type} className="ach-new-item">{a.icon} {a.name}</span>)}
                </div>
            )}

            <div className="ach-grid">
                {unlocked.map(a => (
                    <div key={a.type} className="ach-card unlocked">
                        <div className="ach-icon">{a.icon}</div>
                        <h4>{a.name}</h4>
                        <p>{a.description}</p>
                        <span className="ach-date">🔓 {new Date(a.unlockedAt).toLocaleDateString()}</span>
                    </div>
                ))}
                {locked.map(a => (
                    <div key={a.type} className="ach-card locked">
                        <div className="ach-icon locked-icon">🔒</div>
                        <h4>{a.name}</h4>
                        <p>{a.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { achievementAPI } from '../api/client';
import './Leaderboard.css';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        achievementAPI.getLeaderboard()
            .then(r => setLeaders(r.data || []))
            .catch(() => setLeaders([]))
            .finally(() => setLoading(false));
    }, []);

    const medals = ['🥇', '🥈', '🥉'];

    if (loading) return <div className="loading">Loading leaderboard…</div>;

    return (
        <div className="leaderboard">
            <h2>🏅 Leaderboard</h2>
            {leaders.length === 0 ? (
                <div className="empty-state">No users on the leaderboard yet.</div>
            ) : (
                <div className="lb-list">
                    {leaders.map((u, i) => (
                        <div key={i} className={`lb-row ${i < 3 ? 'lb-top' : ''}`}>
                            <div className="lb-rank">{i < 3 ? medals[i] : `#${u.rank}`}</div>
                            <div className="lb-name">{u.name}</div>
                            <div className="lb-stats">
                                <span className="lb-stat">🔥 {u.currentStreak}d</span>
                                <span className="lb-stat">⭐ {u.longestStreak}d best</span>
                                <span className="lb-points">{u.points} pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

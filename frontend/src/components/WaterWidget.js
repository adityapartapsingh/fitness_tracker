import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api/profileAPI';
import './WaterWidget.css';

function WaterWidget() {
  const [today, setToday] = useState({ todayIntake: 0, goal: 2000, percentage: 0 });
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState(250);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchToday = async () => {
    try {
      const data = await profileAPI.getTodayWaterIntake();
      // API returns { todayIntake, goal, percentage }
      setToday(data);
    } catch (err) {
      console.error('Failed to fetch today water', err);
    }
  };

  useEffect(() => {
    fetchToday();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await profileAPI.getWaterHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch water history', err);
    }
  };

  const handleAdd = async (value) => {
    try {
      setLoading(true);
      const amt = value || parseInt(amount, 10);
      await profileAPI.addWaterIntake(amt);
      await fetchToday();
      await fetchHistory();
      setMsg('Recorded');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error('Add water failed', err);
      setMsg('Failed');
      setTimeout(() => setMsg(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(Math.round((today.todayIntake || 0) / (today.goal || 1) * 100), 100);

  return (
    <div className="water-widget full-card">
      <div className="water-top">
        <div className="water-left">
          <h3>💧 Daily Water Intake</h3>
          <div className="water-meter-large">
            <div className="water-meter-outer">
              <div className="water-fill-large" style={{ height: `${progress}%` }} />
              <div className="water-text-large">{today.todayIntake || 0}ml</div>
            </div>
            <div className="water-stats-large">
              <div><strong>Today's Intake:</strong> <span className="val">{today.todayIntake || 0} ml</span></div>
              <div><strong>Daily Goal:</strong> <span className="val">{today.goal || 0} ml</span></div>
              <div><strong>Progress:</strong> <span className="val">{progress}%</span></div>
            </div>
          </div>
        </div>

        <div className="water-right">
          <label className="label">Add Water (ml)</label>
          <div className="input-row">
            <input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || 0, 10))} />
            <div className="quick-buttons">
              <button onClick={() => setAmount(250)}>250ml</button>
              <button onClick={() => setAmount(500)}>500ml</button>
            </div>
          </div>

          <button className="add-button" onClick={() => handleAdd()} disabled={loading}>
            {loading ? 'Adding…' : 'Add Water 💧'}
          </button>

          <div className="goal-input">
            <label>Daily Goal (ml)</label>
            <input type="number" value={today.goal || 2000} readOnly />
          </div>
        </div>
      </div>

      <div className="water-history-card">
        <h4>Last 7 Days</h4>
        <div className="history-grid-large">
          {history.map((d, i) => {
            const pct = Math.min((d.amount / d.goal) * 100, 100);
            return (
              <div key={i} className="history-item-large">
                <div className="hist-bar-outer">
                  <div className="hist-bar-fill" style={{ height: `${pct}%` }} />
                </div>
                <div className="hist-date">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div className="hist-amount">{d.amount}ml</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WaterWidget;

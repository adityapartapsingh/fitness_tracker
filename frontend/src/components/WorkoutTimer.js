import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WorkoutTimer.css';

export default function WorkoutTimer() {
    const [mode, setMode] = useState('workout'); // workout | rest
    const [workoutTime, setWorkoutTime] = useState(60);
    const [restTime, setRestTime] = useState(30);
    const [timeLeft, setTimeLeft] = useState(60);
    const [running, setRunning] = useState(false);
    const [sets, setSets] = useState(0);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    const playBeep = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch { }
    }, []);

    useEffect(() => {
        if (running && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && running) {
            playBeep();
            if (mode === 'workout') {
                setSets(s => s + 1);
                setMode('rest');
                setTimeLeft(restTime);
            } else {
                setMode('workout');
                setTimeLeft(workoutTime);
            }
        }
        return () => clearInterval(intervalRef.current);
    }, [running, timeLeft, mode, workoutTime, restTime, playBeep]);

    const toggleTimer = () => setRunning(!running);

    const resetTimer = () => {
        setRunning(false);
        setMode('workout');
        setTimeLeft(workoutTime);
        setSets(0);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progress = mode === 'workout'
        ? ((workoutTime - timeLeft) / workoutTime) * 100
        : ((restTime - timeLeft) / restTime) * 100;

    const presets = [
        { label: 'HIIT', work: 30, rest: 15 },
        { label: 'Tabata', work: 20, rest: 10 },
        { label: 'Strength', work: 60, rest: 90 },
        { label: 'Endurance', work: 120, rest: 60 },
    ];

    return (
        <div className="workout-timer">
            <h2>⏱️ Workout Timer</h2>

            <div className="timer-presets">
                {presets.map(p => (
                    <button key={p.label} className="preset-btn" onClick={() => {
                        setWorkoutTime(p.work);
                        setRestTime(p.rest);
                        setTimeLeft(p.work);
                        setRunning(false);
                        setMode('workout');
                        setSets(0);
                    }}>
                        {p.label}
                        <small>{p.work}s / {p.rest}s</small>
                    </button>
                ))}
            </div>

            <div className="timer-settings">
                <div className="timer-setting">
                    <label>Work (seconds)</label>
                    <input type="number" value={workoutTime} onChange={e => {
                        const v = Number(e.target.value); setWorkoutTime(v);
                        if (!running && mode === 'workout') setTimeLeft(v);
                    }} min={5} max={600} />
                </div>
                <div className="timer-setting">
                    <label>Rest (seconds)</label>
                    <input type="number" value={restTime} onChange={e => {
                        const v = Number(e.target.value); setRestTime(v);
                        if (!running && mode === 'rest') setTimeLeft(v);
                    }} min={5} max={300} />
                </div>
            </div>

            <div className={`timer-display ${mode}`}>
                <div className="timer-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={mode === 'workout' ? '#3b82f6' : '#10b981'} strokeWidth="6" strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`} strokeDashoffset="70.75" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s linear' }} />
                    </svg>
                    <div className="timer-text">
                        <div className="timer-mode-label">{mode === 'workout' ? '💪 WORK' : '😮‍💨 REST'}</div>
                        <div className="timer-countdown">{formatTime(timeLeft)}</div>
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                <button className={`timer-btn ${running ? 'pause' : 'start'}`} onClick={toggleTimer}>
                    {running ? '⏸ Pause' : '▶ Start'}
                </button>
                <button className="timer-btn reset" onClick={resetTimer}>🔄 Reset</button>
            </div>

            <div className="timer-sets">Sets completed: <strong>{sets}</strong></div>

            <audio ref={audioRef} />
        </div>
    );
}

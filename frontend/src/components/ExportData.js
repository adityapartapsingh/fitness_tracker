import React, { useState } from 'react';
import { workoutAPI } from '../api/client';
import './ExportData.css';

export default function ExportData() {
    const [status, setStatus] = useState('');

    const handleExport = async (format) => {
        setStatus(`Exporting as ${format.toUpperCase()}...`);
        try {
            if (format === 'csv') {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/workouts/export?format=csv`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fitness-data.csv';
                a.click();
                URL.revokeObjectURL(url);
                setStatus('✅ CSV downloaded!');
            } else {
                const res = await workoutAPI.exportData('json');
                const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fitness-data.json';
                a.click();
                URL.revokeObjectURL(url);
                setStatus('✅ JSON downloaded!');
            }
        } catch (err) {
            setStatus('❌ Export failed');
            console.error(err);
        }
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div className="export-data">
            <h2>📥 Export Your Data</h2>
            <p className="export-desc">Download all your workout and meal data for backup or analysis.</p>

            <div className="export-cards">
                <div className="export-card" onClick={() => handleExport('csv')}>
                    <div className="export-icon">📊</div>
                    <h3>CSV Format</h3>
                    <p>Spreadsheet-compatible. Open in Excel, Google Sheets, etc.</p>
                    <button className="export-btn csv-btn">Download CSV</button>
                </div>
                <div className="export-card" onClick={() => handleExport('json')}>
                    <div className="export-icon">🔧</div>
                    <h3>JSON Format</h3>
                    <p>Developer-friendly structured data format.</p>
                    <button className="export-btn json-btn">Download JSON</button>
                </div>
            </div>

            {status && <div className="export-status">{status}</div>}
        </div>
    );
}

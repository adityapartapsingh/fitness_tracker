import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ProgressCharts.css';

function ProgressCharts({ workouts }) {
  const chartsData = useMemo(() => {
    if (workouts.length === 0) {
      return {
        timeSeriesData: [],
        exerciseData: [],
        calorieData: [],
      };
    }

    // Sort workouts by date
    const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Time series data (last 7 workouts)
    const timeSeriesData = sorted.slice(-7).map((w) => ({
      name: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: w.calories,
      duration: w.duration,
    }));

    // Exercise frequency
    const exerciseMap = {};
    sorted.forEach((w) => {
      exerciseMap[w.exerciseName] = (exerciseMap[w.exerciseName] || 0) + 1;
    });
    const exerciseData = Object.entries(exerciseMap).map(([name, count]) => ({
      name,
      value: count,
    }));

    // Calories by exercise (top 5)
    const calorieMap = {};
    sorted.forEach((w) => {
      calorieMap[w.exerciseName] = (calorieMap[w.exerciseName] || 0) + w.calories;
    });
    const calorieData = Object.entries(calorieMap)
      .map(([name, total]) => ({
        name,
        calories: total,
      }))
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5);

    return {
      timeSeriesData,
      exerciseData,
      calorieData,
    };
  }, [workouts]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (workouts.length === 0) {
    return (
      <div className="empty-charts">
        <p>📊 No workout data available. Add some workouts to see charts!</p>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <h2>Progress Visualization</h2>

      {/* Calories & Duration Over Time */}
      <div className="chart-wrapper">
        <h3>Calories & Duration Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartsData.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Duration (min)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="calories" stroke="#ef4444" name="Calories" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#3b82f6" name="Duration" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        {/* Exercise Frequency Pie Chart */}
        {chartsData.exerciseData.length > 0 && (
          <div className="chart-wrapper">
            <h3>Exercise Frequency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartsData.exerciseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartsData.exerciseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Exercises by Calories Bar Chart */}
        {chartsData.calorieData.length > 0 && (
          <div className="chart-wrapper">
            <h3>Top Exercises by Calories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartsData.calorieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Total Calories (kcal)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="calories" fill="#10b981" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressCharts;

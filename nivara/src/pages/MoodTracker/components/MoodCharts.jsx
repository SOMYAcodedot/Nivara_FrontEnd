import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { FaChartLine, FaChartPie, FaChartBar, FaSyncAlt } from "react-icons/fa";
import "./MoodCharts.css";

const EMOTION_COLORS = {
  happy: "#4CAF50",
  calm: "#81C784",
  content: "#8BC34A",
  hopeful: "#FFC107",
  excited: "#FF9800",
  neutral: "#9E9E9E",
  tired: "#78909C",
  anxious: "#FF7043",
  stressed: "#EF5350",
  sad: "#42A5F5",
  irritated: "#E57373",
  overwhelmed: "#AB47BC",
};

const PIE_COLORS = ["#667eea", "#764ba2", "#4CAF50", "#FF9800", "#EF5350", "#42A5F5", "#9E9E9E", "#AB47BC"];

const MoodCharts = ({ refreshTrigger }) => {
  const [trendData, setTrendData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  const fetchChartData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [trendRes, emotionRes, stressRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/mood/trend/?days=${days}`, { headers }),
        axios.get(`http://localhost:8000/api/mood/emotions/?days=${days}`, { headers }),
        axios.get(`http://localhost:8000/api/mood/stress/?days=${days}`, { headers }),
      ]);

      // Format trend data for line chart
      const formattedTrend = trendRes.data.trend_data?.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mood: item.mood_score,
        entries: item.entries,
      })) || [];

      // Format emotion data for pie chart
      const formattedEmotion = emotionRes.data.distribution?.map((item) => ({
        name: item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1),
        value: item.count,
        percentage: item.percentage,
      })) || [];

      // Format stress data for bar chart
      const formattedStress = stressRes.data.weekly_stress_data?.map((item) => ({
        week: new Date(item.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        stressLevel: item.stress_percentage,
        avgMood: item.avg_mood,
        entries: item.total_entries,
      })) || [];

      setTrendData(formattedTrend);
      setEmotionData(formattedEmotion);
      setStressData(formattedStress);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, refreshTrigger]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.fill }}>
            {payload[0].value} entries ({payload[0].payload.percentage?.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="charts-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading your mood analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-error">
        <p>{error}</p>
        <button onClick={fetchChartData} className="retry-btn">
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mood-charts">
      {/* Period Selector */}
      <div className="charts-header">
        <h3>Mood Analytics</h3>
        <div className="period-selector">
          <button
            className={`period-btn ${days === 7 ? "active" : ""}`}
            onClick={() => setDays(7)}
          >
            7 Days
          </button>
          <button
            className={`period-btn ${days === 14 ? "active" : ""}`}
            onClick={() => setDays(14)}
          >
            14 Days
          </button>
          <button
            className={`period-btn ${days === 30 ? "active" : ""}`}
            onClick={() => setDays(30)}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Mood Trend Line Chart */}
      <div className="chart-card">
        <div className="chart-title">
          <FaChartLine className="chart-icon" style={{ color: "#667eea" }} />
          <h4>Mood Trend</h4>
        </div>
        {trendData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood Score"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ fill: "#667eea", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: "#764ba2" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data">
            <p>No mood data available for this period</p>
          </div>
        )}
      </div>

      <div className="charts-row">
        {/* Emotion Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">
            <FaChartPie className="chart-icon" style={{ color: "#764ba2" }} />
            <h4>Emotion Distribution</h4>
          </div>
          {emotionData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMOTION_COLORS[entry.name.toLowerCase()] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend 
                    layout="horizontal" 
                    align="center" 
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">
              <p>No emotion data available</p>
            </div>
          )}
        </div>

        {/* Stress Pattern Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">
            <FaChartBar className="chart-icon" style={{ color: "#EF5350" }} />
            <h4>Weekly Stress Patterns</h4>
          </div>
          {stressData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#888" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="stressLevel" 
                    name="Stress Level %" 
                    fill="#EF5350" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="avgMood" 
                    name="Avg Mood" 
                    fill="#4CAF50" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">
              <p>No stress data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodCharts;

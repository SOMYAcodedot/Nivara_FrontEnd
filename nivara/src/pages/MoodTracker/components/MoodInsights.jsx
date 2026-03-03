import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBrain,
  FaHeartbeat,
  FaLightbulb,
  FaLeaf,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSmile,
  FaMoon,
} from "react-icons/fa";
import "./MoodInsights.css";

const MoodInsights = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:8000/api/mood/summary/?days=30",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSummary(response.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const getStressLevelColor = (level) => {
    if (!level) return "#9E9E9E";
    switch (level.toLowerCase()) {
      case "low":
        return "#4CAF50";
      case "moderate":
        return "#FFC107";
      case "high":
        return "#FF7043";
      case "very high":
        return "#EF5350";
      default:
        return "#9E9E9E";
    }
  };

  const getMoodColor = (score) => {
    if (score >= 8) return "#4CAF50";
    if (score >= 6) return "#8BC34A";
    if (score >= 4) return "#FFC107";
    if (score >= 2) return "#FF7043";
    return "#EF5350";
  };

  const getEmotionalInsight = (summary) => {
    if (!summary) return "";

    const { dominant_emotion, stress_level, mood_stability_index } = summary;

    let insight = "";

    // Emotional stability insight
    if (mood_stability_index >= 70) {
      insight += "Your emotional state has been quite stable recently, showing good resilience. ";
    } else if (mood_stability_index >= 50) {
      insight += "You've experienced some emotional fluctuations, which is completely normal. ";
    } else {
      insight += "Your emotions have been quite variable lately. Consider focusing on grounding activities. ";
    }

    // Dominant emotion interpretation
    if (dominant_emotion) {
      const emotionName = dominant_emotion.charAt(0).toUpperCase() + dominant_emotion.slice(1);
      if (["happy", "calm", "content", "hopeful"].includes(dominant_emotion.toLowerCase())) {
        insight += `Your predominant emotion has been ${emotionName}, which indicates positive mental well-being. `;
      } else if (["anxious", "stressed", "overwhelmed"].includes(dominant_emotion.toLowerCase())) {
        insight += `You've been experiencing ${emotionName} as your dominant emotion. This is a signal to prioritize self-care. `;
      } else {
        insight += `${emotionName} has been your most frequent emotional state. `;
      }
    }

    // Stress interpretation
    if (stress_level === "High" || stress_level === "Very High") {
      insight += "Your stress markers suggest it may be time to incorporate more relaxation techniques. ";
    } else if (stress_level === "Moderate") {
      insight += "Your stress levels are manageable but monitoring is recommended. ";
    } else if (stress_level === "Low") {
      insight += "Great job maintaining low stress levels! ";
    }

    return insight;
  };

  const getCareRecommendations = (summary) => {
    if (!summary) return [];

    const recommendations = [];
    const { stress_level, average_mood, dominant_emotion, mood_stability_index } = summary;

    // Based on stress level
    if (stress_level === "High" || stress_level === "Very High") {
      recommendations.push({
        icon: <FaLeaf />,
        text: "Try 5-10 minutes of deep breathing or meditation daily",
        color: "#4CAF50",
      });
      recommendations.push({
        icon: <FaMoon />,
        text: "Prioritize quality sleep (7-9 hours) to help regulate stress",
        color: "#764ba2",
      });
    }

    // Based on mood
    if (average_mood < 5) {
      recommendations.push({
        icon: <FaSmile />,
        text: "Engage in activities that bring you joy, even for 15 minutes",
        color: "#FFC107",
      });
      recommendations.push({
        icon: <FaHeartbeat />,
        text: "Light physical activity can boost endorphins and mood",
        color: "#EF5350",
      });
    }

    // Based on stability
    if (mood_stability_index < 50) {
      recommendations.push({
        icon: <FaBrain />,
        text: "Journaling can help process emotions and identify patterns",
        color: "#667eea",
      });
    }

    // Based on dominant emotion
    if (dominant_emotion?.toLowerCase() === "anxious") {
      recommendations.push({
        icon: <FaLightbulb />,
        text: "Try grounding techniques: name 5 things you can see, 4 you can touch...",
        color: "#FF9800",
      });
    }

    // Default recommendations if none specific
    if (recommendations.length === 0) {
      recommendations.push({
        icon: <FaLeaf />,
        text: "Continue your healthy routines - they're working well",
        color: "#4CAF50",
      });
      recommendations.push({
        icon: <FaSmile />,
        text: "Share your positive energy with others today",
        color: "#FFC107",
      });
    }

    return recommendations.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loading-spinner-large"></div>
        <p>Analyzing your emotional patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <button onClick={fetchSummary} className="retry-btn">
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  if (!summary || summary.total_entries === 0) {
    return (
      <div className="insights-empty">
        <FaBrain className="empty-icon" />
        <h4>No Data Yet</h4>
        <p>Start logging your moods to see personalized insights and recommendations!</p>
      </div>
    );
  }

  return (
    <div className="mood-insights">
      <h3 className="insights-title">
        <FaBrain className="title-icon" /> Mood Insights
      </h3>

      {/* Summary Stats */}
      <div className="insights-stats">
        <div className="stat-item">
          <div
            className="stat-value"
            style={{ color: getMoodColor(summary.average_mood) }}
          >
            {summary.average_mood?.toFixed(1) || "—"}
          </div>
          <div className="stat-label">Average Mood</div>
        </div>

        <div className="stat-item">
          <div
            className="stat-value"
            style={{ color: getStressLevelColor(summary.stress_level) }}
          >
            {summary.stress_level || "—"}
          </div>
          <div className="stat-label">Stress Level</div>
        </div>

        <div className="stat-item">
          <div className="stat-value" style={{ color: "#667eea" }}>
            {summary.dominant_emotion
              ? summary.dominant_emotion.charAt(0).toUpperCase() +
                summary.dominant_emotion.slice(1)
              : "—"}
          </div>
          <div className="stat-label">Dominant Emotion</div>
        </div>

        <div className="stat-item">
          <div className="stat-value" style={{ color: "#764ba2" }}>
            {summary.mood_stability_index?.toFixed(0) || "—"}%
          </div>
          <div className="stat-label">Mood Stability</div>
        </div>
      </div>

      {/* Cycle Phase (if tracked) */}
      {summary.cycle_phase && (
        <div className="cycle-info">
          <FaMoon className="cycle-icon" />
          <span>Cycle Phase: {summary.cycle_phase}</span>
        </div>
      )}

      {/* AI Insight */}
      <div className="insight-card">
        <div className="insight-header">
          <FaLightbulb className="insight-icon" />
          <h4>Emotional Analysis</h4>
        </div>
        <p className="insight-text">{getEmotionalInsight(summary)}</p>
      </div>

      {/* Care Recommendations */}
      <div className="recommendations-section">
        <h4 className="recommendations-title">
          <FaHeartbeat className="rec-icon" /> Care Recommendations
        </h4>
        <div className="recommendations-list">
          {getCareRecommendations(summary).map((rec, index) => (
            <div key={index} className="recommendation-item" style={{ "--rec-color": rec.color }}>
              <div className="rec-icon-wrapper" style={{ background: rec.color }}>
                {rec.icon}
              </div>
              <span>{rec.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Summary */}
      <div className="data-summary">
        <p>
          Based on <strong>{summary.total_entries}</strong> mood entries over the last{" "}
          <strong>{summary.period_days}</strong> days
        </p>
      </div>
    </div>
  );
};

export default MoodInsights;

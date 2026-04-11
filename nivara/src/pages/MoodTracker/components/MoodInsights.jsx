import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ensureMinElapsed, MIN_AWARE_LOADING_MS } from "../../../utils/minLoadingDelay";
import {
  FaBookOpen,
  FaHeartbeat,
  FaLightbulb,
  FaLeaf,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSmile,
  FaMoon,
} from "react-icons/fa";
import NivaraButterflyMark from "../../../components/NivaraButterflyMark/NivaraButterflyMark";
import "./MoodInsights.css";

const API_BASE_URL = "http://localhost:8000/api";

const REC_ICONS = [
  { icon: <FaLeaf />, color: "#4CAF50" },
  { icon: <FaSmile />, color: "#FFC107" },
  { icon: <FaMoon />, color: "#764ba2" },
  { icon: <FaLightbulb />, color: "#FF9800" },
];

const MoodInsights = ({ refreshTrigger, periodDays = 30 }) => {
  const [summary, setSummary] = useState(null);
  const [aiPayload, setAiPayload] = useState(null);
  const [aiFetchFailed, setAiFetchFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    const started = Date.now();
    setLoading(true);
    setError("");
    setAiFetchFailed(false);

    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };
    const days = periodDays;

    try {
      const [summaryRes, aiRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/mood/summary/?days=${days}`, { headers }),
        axios.get(`${API_BASE_URL}/mood/insights-ai/?days=${days}`, { headers }),
      ]);

      if (summaryRes.status !== "fulfilled") {
        console.error("Error fetching mood summary:", summaryRes.reason);
        setError("Failed to load insights");
        setSummary(null);
        setAiPayload(null);
        return;
      }

      setSummary(summaryRes.value.data);

      if (aiRes.status === "fulfilled") {
        setAiPayload(aiRes.value.data);
        setAiFetchFailed(false);
      } else {
        console.error("Error fetching mood insights-ai:", aiRes.reason);
        setAiPayload(null);
        setAiFetchFailed(true);
      }
    } catch (err) {
      console.error("Error fetching mood insights:", err);
      setError("Failed to load insights");
      setSummary(null);
      setAiPayload(null);
    } finally {
      await ensureMinElapsed(started, MIN_AWARE_LOADING_MS);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [periodDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

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

  const getEmotionalInsight = (s) => {
    if (!s) return "";

    const { dominant_emotion, stress_level, mood_stability_index } = s;

    let insight = "";

    if (mood_stability_index >= 70) {
      insight += "Your emotional state has been quite stable recently, showing good resilience. ";
    } else if (mood_stability_index >= 50) {
      insight += "You've experienced some emotional fluctuations, which is completely normal. ";
    } else {
      insight += "Your emotions have been quite variable lately. Consider focusing on grounding activities. ";
    }

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

    if (stress_level === "High" || stress_level === "Very High") {
      insight += "Your stress markers suggest it may be time to incorporate more relaxation techniques. ";
    } else if (stress_level === "Moderate") {
      insight += "Your stress levels are manageable but monitoring is recommended. ";
    } else if (stress_level === "Low") {
      insight += "Great job maintaining low stress levels! ";
    }

    return insight;
  };

  const getCareRecommendations = (s) => {
    if (!s) return [];

    const recommendations = [];
    const { stress_level, average_mood, dominant_emotion, mood_stability_index } = s;

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

    if (mood_stability_index < 50) {
      recommendations.push({
        icon: <FaBookOpen />,
        text: "Journaling can help process emotions and identify patterns",
        color: "#667eea",
      });
    }

    if (dominant_emotion?.toLowerCase() === "anxious") {
      recommendations.push({
        icon: <FaLightbulb />,
        text: "Try grounding techniques: name 5 things you can see, 4 you can touch...",
        color: "#FF9800",
      });
    }

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

  const useLlmCopy =
    aiPayload &&
    aiPayload.llm_generated === true &&
    typeof aiPayload.emotional_analysis === "string" &&
    aiPayload.emotional_analysis.trim().length > 0;

  const llmRecommendations =
    useLlmCopy &&
    Array.isArray(aiPayload.care_recommendations) &&
    aiPayload.care_recommendations.length > 0
      ? aiPayload.care_recommendations
          .filter((t) => typeof t === "string" && t.trim())
          .map((text, index) => {
            const slot = REC_ICONS[index % REC_ICONS.length];
            return { icon: slot.icon, text, color: slot.color };
          })
      : null;

  const careRecsForUi =
    llmRecommendations && llmRecommendations.length > 0
      ? llmRecommendations
      : getCareRecommendations(summary);

  const emotionalText = useLlmCopy
    ? aiPayload.emotional_analysis.trim()
    : getEmotionalInsight(summary);

  const footnoteEntries =
    useLlmCopy && aiPayload.footnote && typeof aiPayload.footnote.total_entries === "number"
      ? aiPayload.footnote.total_entries
      : summary?.total_entries;

  const footnotePeriodDays =
    useLlmCopy && aiPayload.footnote && typeof aiPayload.footnote.period_days === "number"
      ? aiPayload.footnote.period_days
      : summary?.period_days ?? periodDays;

  const llmNotice =
    aiPayload &&
    aiPayload.llm_generated === false &&
    (aiPayload.error ||
      aiPayload.detail ||
      aiPayload.message ||
      "Personalized text could not be generated. Showing standard insights instead.");

  if (loading) {
    return (
      <div className="mood-insights-loader-host" aria-busy="true" aria-live="polite">
        <div className="mood-insights-loader-inner">
          <div className="mood-insights-aware-spinner" />
          <p className="mood-insights-aware-title">Preparing your mood insights</p>
          <p className="mood-insights-aware-sub">
            Summarizing your patterns and personalized guidance — this may take a moment on first
            load, then stays quick while our cache is warm.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  if (!summary || summary.total_entries === 0) {
    return (
      <div className="insights-empty">
        <NivaraButterflyMark className="empty-icon" variant="mono" decorative />
        <h4>No Data Yet</h4>
        <p>Start logging your moods to see personalized insights and recommendations!</p>
      </div>
    );
  }

  return (
    <div className="mood-insights">
      <h3 className="insights-title">
        <NivaraButterflyMark className="title-icon" decorative /> Mood Insights
      </h3>

      {(aiFetchFailed || llmNotice) && (
        <div className="insights-ai-notice" role="status">
          <FaExclamationTriangle className="insights-ai-notice-icon" />
          <p>
            {aiFetchFailed
              ? "Could not load AI insights. Showing standard analysis below."
              : String(llmNotice)}
          </p>
        </div>
      )}

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

      {summary.cycle_phase && (
        <div className="cycle-info">
          <FaMoon className="cycle-icon" />
          <span>Cycle Phase: {summary.cycle_phase}</span>
        </div>
      )}

      <div className="insight-card">
        <div className="insight-header">
          <FaLightbulb className="insight-icon" />
          <h4>Emotional Analysis</h4>
        </div>
        <p className="insight-text">{emotionalText}</p>
      </div>

      <div className="recommendations-section">
        <h4 className="recommendations-title">
          <FaHeartbeat className="rec-icon" /> Care Recommendations
        </h4>
        <div className="recommendations-list">
          {careRecsForUi.map((rec, index) => (
            <div key={index} className="recommendation-item" style={{ "--rec-color": rec.color }}>
              <div className="rec-icon-wrapper" style={{ background: rec.color }}>
                {rec.icon}
              </div>
              <span>{rec.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="data-summary">
        <p>
          Based on <strong>{footnoteEntries}</strong> mood entries over the last{" "}
          <strong>{footnotePeriodDays}</strong> days
        </p>
      </div>
    </div>
  );
};

export default MoodInsights;

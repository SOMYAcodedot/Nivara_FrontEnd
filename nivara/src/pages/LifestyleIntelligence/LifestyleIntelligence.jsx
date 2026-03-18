import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaLeaf,
  FaSmile,
  FaMoon,
  FaUtensils,
  FaHeart,
  FaSyncAlt,
  FaExclamationTriangle,
  FaFemale,
  FaBrain,
  FaRobot,
} from "react-icons/fa";
import "./LifestyleIntelligence.css";

const API_BASE_URL = "http://localhost:8000/api";

const LifestyleIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days] = useState(30);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE_URL}/lifestyle/recommendations/?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching lifestyle recommendations:", err);
      setError(
        err.response?.status === 401
          ? "Please log in to see your personalized recommendations."
          : err.response?.data?.detail || "Failed to load recommendations."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const getStressColor = (level) => {
    if (!level) return "#9E9E9E";
    switch (String(level).toLowerCase()) {
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

  if (loading && !data) {
    return (
      <div className="lifestyle-intelligence-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="lifestyle-intelligence-page">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaLeaf className="header-icon" /> Lifestyle Intelligence
            </h1>
            <p>Personalized yoga, diet, sleep and emotional regulation tips</p>
          </div>
        </div>
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    source,
    generated_by,
    message,
    context: contextData = {},
    recommendations: recs = {},
  } = data || {};
  const {
    mood_analysis,
    cycle_phase,
    stress_level,
    period_days,
  } = contextData;
  const {
    yoga_suggestions = {},
    diet_adjustments = {},
    sleep_guidance = {},
    emotional_regulation_tips = {},
  } = recs;

  return (
    <div className="lifestyle-intelligence-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaLeaf className="header-icon" /> Lifestyle Intelligence
          </h1>
          <p>Personalized yoga, diet, sleep and emotional regulation tips based on your mood, cycle and stress</p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => fetchRecommendations()}
          disabled={loading}
          title="Refresh recommendations"
        >
          <FaSyncAlt className={loading ? "spin" : ""} /> {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* AI Engine badge & message */}
      {(source === "ai_engine" || generated_by || message) && (
        <section className="ai-engine-banner">
          {source === "ai_engine" && (
            <span className="ai-powered-badge">
              <FaRobot /> Powered by AI Engine
            </span>
          )}
          {generated_by && (
            <h3 className="ai-generated-by">{generated_by}</h3>
          )}
          {message && (
            <p className="ai-message">{message}</p>
          )}
        </section>
      )}

      {/* Based on your context */}
      <section className="context-section">
        <h2 className="section-title">Based on your current context</h2>
        <div className="context-cards">
          {mood_analysis && (
            <div className="context-card">
              <div className="context-card-icon" style={{ background: "#667eea20", color: "#667eea" }}>
                <FaSmile />
              </div>
              <div className="context-card-body">
                <h3>Mood</h3>
                <p className="context-value">
                  {mood_analysis.dominant_emotion
                    ? `${mood_analysis.dominant_emotion.charAt(0).toUpperCase() + mood_analysis.dominant_emotion.slice(1)}`
                    : "—"}
                  {mood_analysis.average_mood != null && (
                    <span className="mood-score"> (avg: {mood_analysis.average_mood}/10)</span>
                  )}
                </p>
                {mood_analysis.trend && (
                  <p className="context-meta">Trend: {mood_analysis.trend}</p>
                )}
              </div>
            </div>
          )}
          {cycle_phase && (
            <div className="context-card">
              <div className="context-card-icon" style={{ background: "#E91E6320", color: "#E91E63" }}>
                <FaFemale />
              </div>
              <div className="context-card-body">
                <h3>Cycle</h3>
                <p className="context-value">{cycle_phase.phase_display || cycle_phase.cycle_phase || "—"}</p>
                {cycle_phase.cycle_day != null && (
                  <p className="context-meta">Day {cycle_phase.cycle_day} of cycle</p>
                )}
              </div>
            </div>
          )}
          {stress_level && (
            <div className="context-card">
              <div className="context-card-icon" style={{ background: `${getStressColor(stress_level)}20`, color: getStressColor(stress_level) }}>
                <FaBrain />
              </div>
              <div className="context-card-body">
                <h3>Stress</h3>
                <p className="context-value" style={{ color: getStressColor(stress_level) }}>{stress_level}</p>
                {period_days != null && (
                  <p className="context-meta">Last {period_days} days</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {/* Yoga */}
        {(yoga_suggestions.suggestions?.length > 0 || yoga_suggestions.summary) && (
          <section className="rec-card yoga-card">
            <div className="rec-card-header">
              <FaLeaf className="rec-card-icon" />
              <h2>Yoga suggestions</h2>
            </div>
            {yoga_suggestions.summary && (
              <p className="rec-summary">{yoga_suggestions.summary}</p>
            )}
            {yoga_suggestions.suggestions?.length > 0 && (
              <ul className="rec-list">
                {yoga_suggestions.suggestions.map((item, i) => (
                  <li key={i}>{typeof item === "string" ? item : item.name || item.title || JSON.stringify(item)}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Diet */}
        {(diet_adjustments.adjustments?.length > 0 || diet_adjustments.phase_note) && (
          <section className="rec-card diet-card">
            <div className="rec-card-header">
              <FaUtensils className="rec-card-icon" />
              <h2>Diet adjustments</h2>
            </div>
            {diet_adjustments.phase_note && (
              <p className="rec-summary">{diet_adjustments.phase_note}</p>
            )}
            {diet_adjustments.adjustments?.length > 0 && (
              <ul className="rec-list">
                {diet_adjustments.adjustments.map((item, i) => (
                  <li key={i}>{typeof item === "string" ? item : item.name || item.title || JSON.stringify(item)}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Sleep */}
        {(sleep_guidance.tips?.length > 0 || sleep_guidance.summary || sleep_guidance.target_hours) && (
          <section className="rec-card sleep-card">
            <div className="rec-card-header">
              <FaMoon className="rec-card-icon" />
              <h2>Sleep guidance</h2>
            </div>
            {sleep_guidance.target_hours && (
              <p className="rec-target">Target: {sleep_guidance.target_hours} hours</p>
            )}
            {sleep_guidance.summary && (
              <p className="rec-summary">{sleep_guidance.summary}</p>
            )}
            {sleep_guidance.tips?.length > 0 && (
              <ul className="rec-list">
                {sleep_guidance.tips.map((tip, i) => (
                  <li key={i}>{typeof tip === "string" ? tip : tip.name || tip.title || JSON.stringify(tip)}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Emotional regulation */}
        {(emotional_regulation_tips.tips?.length > 0 || emotional_regulation_tips.context_note) && (
          <section className="rec-card emotional-card">
            <div className="rec-card-header">
              <FaHeart className="rec-card-icon" />
              <h2>Emotional regulation tips</h2>
            </div>
            {emotional_regulation_tips.context_note && (
              <p className="rec-summary">{emotional_regulation_tips.context_note}</p>
            )}
            {emotional_regulation_tips.tips?.length > 0 && (
              <ul className="rec-list">
                {emotional_regulation_tips.tips.map((tip, i) => (
                  <li key={i}>{typeof tip === "string" ? tip : tip.name || tip.title || JSON.stringify(tip)}</li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {!mood_analysis && !cycle_phase && !stress_level && (
        <p className="no-context-note">Add mood logs and optionally cycle data to get more personalized recommendations.</p>
      )}
    </div>
  );
};

export default LifestyleIntelligence;

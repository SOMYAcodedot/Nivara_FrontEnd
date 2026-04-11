import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FaRobot,
} from "react-icons/fa";
import NivaraButterflyMark from "../../components/NivaraButterflyMark/NivaraButterflyMark";
import "./LifestyleIntelligence.css";
import { tryRefreshAccessToken, friendlyApiError } from "../../utils/apiAuth";
import {
  ensureMinElapsed,
  MIN_AWARE_LOADING_MS,
} from "../../utils/minLoadingDelay";
import { formatSleepTargetHours } from "../../utils/sleepTargetFormat";
import { hasLifestyleRecommendationContent } from "../../utils/lifestyleRecsHasContent";

const API_BASE_URL = "http://localhost:8000/api";

const LifestyleIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recsWarning, setRecsWarning] = useState("");
  const [days] = useState(30);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchRecommendations = useCallback(async () => {
    const started = Date.now();
    setLoading(true);
    setError("");
    setRecsWarning("");
    const url = `${API_BASE_URL}/lifestyle/recommendations/?days=${days}`;
    const getOnce = (token) =>
      axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    try {
      const token = localStorage.getItem("access_token");
      let response;
      try {
        response = await getOnce(token);
      } catch (firstErr) {
        if (firstErr.response?.status === 401) {
          const next = await tryRefreshAccessToken();
          if (next) {
            response = await getOnce(next);
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }
      setData(response.data);
      const recs = response.data?.recommendations;
      if (!hasLifestyleRecommendationContent(recs)) {
        setRecsWarning(
          "We couldn't load detailed recommendations right now. Try adding mood logs or refreshing in a few minutes."
        );
      }
    } catch (err) {
      console.error("Error fetching lifestyle recommendations:", err);
      setError(
        friendlyApiError(
          err,
          "We couldn't load recommendations. Please try again shortly."
        )
      );
      setData(null);
    } finally {
      await ensureMinElapsed(started, MIN_AWARE_LOADING_MS);
      if (mountedRef.current) {
        setLoading(false);
      }
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
        <div className="loading-container loading-container-aware">
          <div className="loading-spinner"></div>
          <p className="loading-title">Preparing your recommendations</p>
          <p className="loading-sub">
            Aligning yoga, diet, sleep, and emotional tips with your mood, cycle,
            and stress patterns…
          </p>
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
    llm_generated,
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
    <div className="lifestyle-intelligence-page lifestyle-page-with-overlay">
      {loading && data && (
        <div className="page-refresh-overlay" aria-busy="true" aria-live="polite">
          <div className="page-refresh-overlay-inner">
            <div className="loading-spinner"></div>
            <p className="loading-title">Refreshing your plan</p>
            <p className="loading-sub">Fetching the latest personalized guidance…</p>
          </div>
        </div>
      )}
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

      {/* AI / LLM badges & message */}
      {(llm_generated ||
        source === "ai_engine" ||
        generated_by ||
        message ||
        recsWarning) && (
        <section className="ai-engine-banner">
          <div className="ai-badges-row">
            {llm_generated && (
              <span className="llm-personalized-badge" title="Recommendations from your wellness data">
                <FaRobot /> Personalized with AI
              </span>
            )}
            {source === "ai_engine" && !llm_generated && (
              <span className="ai-powered-badge">
                <FaRobot /> Powered by AI Engine
              </span>
            )}
          </div>
          {generated_by && (
            <h3 className="ai-generated-by">{generated_by}</h3>
          )}
          {message && (
            <p className="ai-message">{message}</p>
          )}
          {recsWarning && (
            <p className="recs-warning" role="status">
              <FaExclamationTriangle /> {recsWarning}
            </p>
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
                <NivaraButterflyMark variant="mono" decorative />
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
              <ul className="rec-list rec-list-structured">
                {yoga_suggestions.suggestions.map((item, i) => {
                  if (typeof item === "string") {
                    return <li key={i}>{item}</li>;
                  }
                  const title = item.title || item.name;
                  const desc = item.description;
                  const dur =
                    item.duration_min != null && item.duration_min !== ""
                      ? `${item.duration_min} min`
                      : null;
                  return (
                    <li key={i} className="rec-structured-item">
                      <div className="rec-structured-head">
                        {title ? (
                          <span className="rec-item-title">{title}</span>
                        ) : null}
                        {dur ? (
                          <span className="rec-item-duration">{dur}</span>
                        ) : null}
                      </div>
                      {desc ? (
                        <p className="rec-item-description">{desc}</p>
                      ) : null}
                    </li>
                  );
                })}
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
              <ul className="rec-list rec-list-structured">
                {diet_adjustments.adjustments.map((adj, i) => {
                  if (typeof adj === "string") {
                    return <li key={i}>{adj}</li>;
                  }
                  const category = adj.category;
                  const tip = adj.tip;
                  return (
                    <li key={i} className="rec-structured-item diet-adjustment-row">
                      {category ? (
                        <span className="diet-category">{category}</span>
                      ) : null}
                      {tip ? <p className="diet-tip">{tip}</p> : null}
                    </li>
                  );
                })}
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
            {sleep_guidance.target_hours != null && sleep_guidance.target_hours !== "" && (
              <p className="rec-target">
                Target:{" "}
                {typeof sleep_guidance.target_hours === "number"
                  ? `${sleep_guidance.target_hours} h`
                  : formatSleepTargetHours(sleep_guidance.target_hours) ||
                    sleep_guidance.target_hours}
              </p>
            )}
            {sleep_guidance.summary && (
              <p className="rec-summary">{sleep_guidance.summary}</p>
            )}
            {sleep_guidance.tips?.length > 0 && (
              <ul className="rec-list">
                {sleep_guidance.tips.map((tip, i) => (
                  <li key={i}>
                    {typeof tip === "string"
                      ? tip
                      : tip.text || tip.title || tip.name || String(tip)}
                  </li>
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
                  <li key={i}>
                    {typeof tip === "string"
                      ? tip
                      : tip.text || tip.title || tip.name || String(tip)}
                  </li>
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

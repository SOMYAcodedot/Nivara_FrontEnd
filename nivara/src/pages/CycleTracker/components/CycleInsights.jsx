import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ensureMinElapsed, MIN_AWARE_LOADING_MS } from "../../../utils/minLoadingDelay";
import {
  FaLightbulb,
  FaHeart,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaInfoCircle,
  FaCalendarAlt,
  FaBell,
} from "react-icons/fa";
import NivaraButterflyMark from "../../../components/NivaraButterflyMark/NivaraButterflyMark";
import "./CycleInsights.css";

const API_BASE_URL = "http://localhost:8000/api";

const PHASE_DEFAULTS = {
  menstrual: "Energy may be lower. Be gentle with yourself and prioritize rest.",
  follicular: "Rising estrogen can boost mood and energy. Great time for new projects.",
  ovulation: "Peak energy and confidence. Optimal for social activities.",
  luteal: "Progesterone rises, potentially causing PMS. Practice extra self-care.",
};

const MOOD_CYCLE_INTRO_DEFAULT =
  "Your menstrual cycle affects your emotional patterns through hormonal fluctuations. Understanding this connection can help you manage your mental wellness better.";

const CycleInsights = ({ refreshTrigger, moodWindowDays = 30 }) => {
  const [insights, setInsights] = useState(null);
  const [irregularity, setIrregularity] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchInsights = useCallback(async () => {
    const started = Date.now();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const q = `mood_window_days=${moodWindowDays}`;

      const [insightsRes, irregularityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cycle/insights/?${q}`, { headers }),
        axios.get(`${API_BASE_URL}/cycle/irregularity/`, { headers }),
      ]);

      setInsights(insightsRes.data);
      setIrregularity(irregularityRes.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      await ensureMinElapsed(started, MIN_AWARE_LOADING_MS);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [moodWindowDays]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights, refreshTrigger]);

  const llm = insights?.llm;
  const regularityAnalysis = insights?.regularity_analysis;
  const prediction = insights?.prediction;
  const phaseTips = llm?.phase_tips || {};

  const formatPredictionDate = (iso) => {
    if (!iso || typeof iso !== "string") return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const personalizedBody =
    llm?.generated && typeof llm.personalized_insights === "string" && llm.personalized_insights.trim()
      ? llm.personalized_insights.trim()
      : null;

  const regularityBadgeText = () => {
    if (regularityAnalysis?.has_data && typeof regularityAnalysis.regularity_message === "string") {
      return regularityAnalysis.regularity_message;
    }
    if (!irregularity) return "Your cycle appears regular";
    return irregularity.is_irregular ? "Some irregularity detected" : "Your cycle appears regular";
  };

  const regularityIsIrregularVisual = () => {
    if (regularityAnalysis?.has_data === true) {
      if (regularityAnalysis.is_regular === false) return true;
      if (regularityAnalysis.is_regular === true) return false;
      const msg = (regularityAnalysis.regularity_message || "").toLowerCase();
      if (msg.includes("irregular") || msg.includes("variation") || msg.includes("concern")) {
        return true;
      }
      return false;
    }
    return Boolean(irregularity?.is_irregular);
  };

  if (loading) {
    return (
      <div className="cycle-insights cycle-insights-loader-root" aria-busy="true" aria-live="polite">
        <div className="cycle-insights-loader-host">
          <div className="cycle-insights-loader-inner">
            <div className="cycle-insights-aware-spinner" />
            <p className="cycle-insights-aware-title">Preparing your cycle insights</p>
            <p className="cycle-insights-aware-sub">
              Connecting your cycle, mood window, and personalized guidance — first load may take a
              moment; repeat visits stay fast with server-side caching.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-insights">
      {/* Personal Insights Card */}
      <div className="insights-card cycle-card">
        <div className="cycle-card-header">
          <div className="icon-wrapper">
            <FaLightbulb />
          </div>
          <h3>Personalized Insights</h3>
        </div>

        {llm?.generated === false && (llm.error || llm.detail || llm.message) && (
          <div className="cycle-llm-notice" role="status">
            <FaExclamationTriangle />
            <p>{String(llm.error || llm.detail || llm.message)}</p>
          </div>
        )}

        {personalizedBody && (
          <div className="insight-highlight">
            <NivaraButterflyMark className="highlight-icon" variant="mono" decorative />
            <p>{personalizedBody}</p>
          </div>
        )}

        {!personalizedBody && insights?.phase_summary && (
          <div className="insight-highlight">
            <NivaraButterflyMark className="highlight-icon" variant="mono" decorative />
            <p>{insights.phase_summary}</p>
          </div>
        )}

        {insights?.insights && insights.insights.length > 0 && (
          <div className="insights-list">
            <h4>
              <FaInfoCircle /> Key Observations
            </h4>
            <ul>
              {insights.insights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {insights?.hormone_connection && (
          <div className="hormone-section">
            <h4>
              <FaHeart /> Hormonal Connection
            </h4>
            <p>{insights.hormone_connection}</p>
          </div>
        )}
      </div>

      {/* Recommendations Card (legacy list from API) */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div className="recommendations-card cycle-card">
          <div className="cycle-card-header">
            <div
              className="icon-wrapper"
              style={{ background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)" }}
            >
              <FaCheckCircle />
            </div>
            <h3>Recommendations</h3>
          </div>

          <div className="recommendations-grid">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-number">{index + 1}</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next period prediction (engine) */}
      {prediction &&
        (prediction.predicted_next_period != null ||
          prediction.days_until_next_period != null ||
          (prediction.countdown_message && String(prediction.countdown_message).trim())) && (
          <div className="prediction-card cycle-card">
            <div className="cycle-card-header">
              <div
                className="icon-wrapper"
                style={{ background: "linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)" }}
              >
                <FaCalendarAlt />
              </div>
              <h3>Next period prediction</h3>
            </div>
            <div className="prediction-body">
              {prediction.predicted_next_period && (
                <div className="prediction-row">
                  <span className="prediction-label">Predicted start</span>
                  <span className="prediction-value">{formatPredictionDate(prediction.predicted_next_period)}</span>
                </div>
              )}
              {prediction.days_until_next_period != null && prediction.days_until_next_period !== "" && (
                <div className="prediction-row">
                  <span className="prediction-label">Days until next period</span>
                  <span className="prediction-value">{prediction.days_until_next_period}</span>
                </div>
              )}
              {prediction.countdown_message && String(prediction.countdown_message).trim() && (
                <p className="prediction-message">{String(prediction.countdown_message).trim()}</p>
              )}
            </div>
          </div>
        )}

      {/* LLM alerts */}
      {Array.isArray(llm?.alerts) && llm.alerts.length > 0 && (
        <div className="alerts-card cycle-card">
          <div className="cycle-card-header">
            <div
              className="icon-wrapper"
              style={{ background: "linear-gradient(135deg, #FF9800 0%, #E65100 100%)" }}
            >
              <FaBell />
            </div>
            <h3>Alerts</h3>
          </div>
          <ul className="alerts-list">
            {llm.alerts
              .filter((a) => typeof a === "string" && a.trim())
              .map((text, index) => (
                <li key={index}>
                  <FaExclamationTriangle className="alerts-list-icon" />
                  <span>{text.trim()}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Irregularity Analysis Card — show if legacy irregularity API or new regularity_analysis exists */}
      {(irregularity || regularityAnalysis) && (
        <div className="irregularity-card cycle-card">
          <div className="cycle-card-header">
            <div
              className="icon-wrapper"
              style={{
                background:
                  regularityAnalysis?.has_data === false && !irregularity
                    ? "linear-gradient(135deg, #78909C 0%, #546E7A 100%)"
                    : regularityIsIrregularVisual()
                      ? "linear-gradient(135deg, #FF9800 0%, #E65100 100%)"
                      : "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
              }}
            >
              {regularityAnalysis?.has_data === false && !irregularity ? (
                <FaInfoCircle />
              ) : regularityIsIrregularVisual() ? (
                <FaExclamationTriangle />
              ) : (
                <FaChartLine />
              )}
            </div>
            <h3>Cycle Regularity Analysis</h3>
          </div>

          <div className="regularity-status">
            {regularityAnalysis?.has_data === false && !irregularity ? (
              <div className="status-indicator regularity-unknown">
                <FaInfoCircle />
                <span>Log more cycles to assess regularity</span>
              </div>
            ) : regularityIsIrregularVisual() ? (
              <div className="status-indicator irregular">
                <FaExclamationTriangle />
                <span>{regularityBadgeText() || "Some irregularity detected"}</span>
              </div>
            ) : (
              <div className="status-indicator regular">
                <FaCheckCircle />
                <span>{regularityBadgeText() || "Your cycle appears regular"}</span>
              </div>
            )}
          </div>

          {llm?.generated &&
            typeof llm.cycle_regularity_narrative === "string" &&
            llm.cycle_regularity_narrative.trim() && (
              <div className="regularity-narrative">
                <p>{llm.cycle_regularity_narrative.trim()}</p>
              </div>
            )}

          {irregularity?.analysis && (
            <div className="analysis-content">
              {irregularity.analysis.average_cycle_length && (
                <div className="stat-row">
                  <span className="stat-label">Average Cycle Length</span>
                  <span className="stat-value">{irregularity.analysis.average_cycle_length} days</span>
                </div>
              )}

              {irregularity.analysis.cycle_variation && (
                <div className="stat-row">
                  <span className="stat-label">Cycle Variation</span>
                  <span className="stat-value">±{irregularity.analysis.cycle_variation} days</span>
                </div>
              )}

              {irregularity.analysis.total_cycles_analyzed && (
                <div className="stat-row">
                  <span className="stat-label">Cycles Analyzed</span>
                  <span className="stat-value">{irregularity.analysis.total_cycles_analyzed}</span>
                </div>
              )}
            </div>
          )}

          {irregularity.notes && irregularity.notes.length > 0 && (
            <div className="irregularity-notes">
              <h4>Notes</h4>
              <ul>
                {irregularity.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {irregularity.recommendations && irregularity.recommendations.length > 0 && (
            <div className="irregularity-recs">
              <h4>Recommendations</h4>
              <ul>
                {irregularity.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mood-Cycle Connection Card */}
      <div className="connection-card cycle-card">
        <div className="cycle-card-header">
          <div
            className="icon-wrapper"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <NivaraButterflyMark variant="mono" decorative />
          </div>
          <h3>Mood & Cycle Connection</h3>
        </div>

        <div className="connection-content">
          <p className="connection-intro">
            {llm?.generated && typeof llm.mood_cycle_connection === "string" && llm.mood_cycle_connection.trim()
              ? llm.mood_cycle_connection.trim()
              : MOOD_CYCLE_INTRO_DEFAULT}
          </p>

          <div className="phase-moods">
            <div className="phase-mood-item">
              <h5>🌊 Menstrual Phase</h5>
              <p>
                {(phaseTips.menstrual && String(phaseTips.menstrual).trim()) || PHASE_DEFAULTS.menstrual}
              </p>
            </div>
            <div className="phase-mood-item">
              <h5>🌱 Follicular Phase</h5>
              <p>
                {(phaseTips.follicular && String(phaseTips.follicular).trim()) || PHASE_DEFAULTS.follicular}
              </p>
            </div>
            <div className="phase-mood-item">
              <h5>☀️ Ovulation</h5>
              <p>{(phaseTips.ovulation && String(phaseTips.ovulation).trim()) || PHASE_DEFAULTS.ovulation}</p>
            </div>
            <div className="phase-mood-item">
              <h5>🌙 Luteal Phase</h5>
              <p>{(phaseTips.luteal && String(phaseTips.luteal).trim()) || PHASE_DEFAULTS.luteal}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsights;

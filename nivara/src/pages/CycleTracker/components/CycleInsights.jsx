import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaLightbulb, 
  FaHeart, 
  FaBrain, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaInfoCircle
} from "react-icons/fa";
import "./CycleInsights.css";

const API_BASE_URL = "http://localhost:8000/api";

const CycleInsights = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState(null);
  const [irregularity, setIrregularity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [insightsRes, irregularityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cycle/insights/`, { headers }),
        axios.get(`${API_BASE_URL}/cycle/irregularity/`, { headers })
      ]);

      setInsights(insightsRes.data);
      setIrregularity(irregularityRes.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cycle-insights">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing your cycle data...</p>
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

        {insights?.phase_summary && (
          <div className="insight-highlight">
            <FaBrain className="highlight-icon" />
            <p>{insights.phase_summary}</p>
          </div>
        )}

        {insights?.insights && insights.insights.length > 0 && (
          <div className="insights-list">
            <h4><FaInfoCircle /> Key Observations</h4>
            <ul>
              {insights.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {insights?.hormone_connection && (
          <div className="hormone-section">
            <h4><FaHeart /> Hormonal Connection</h4>
            <p>{insights.hormone_connection}</p>
          </div>
        )}
      </div>

      {/* Recommendations Card */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div className="recommendations-card cycle-card">
          <div className="cycle-card-header">
            <div className="icon-wrapper" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)" }}>
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

      {/* Irregularity Analysis Card */}
      {irregularity && (
        <div className="irregularity-card cycle-card">
          <div className="cycle-card-header">
            <div 
              className="icon-wrapper" 
              style={{ 
                background: irregularity.is_irregular 
                  ? "linear-gradient(135deg, #FF9800 0%, #E65100 100%)"
                  : "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)"
              }}
            >
              {irregularity.is_irregular ? <FaExclamationTriangle /> : <FaChartLine />}
            </div>
            <h3>Cycle Regularity Analysis</h3>
          </div>

          <div className="regularity-status">
            {irregularity.is_irregular ? (
              <div className="status-indicator irregular">
                <FaExclamationTriangle />
                <span>Some irregularity detected</span>
              </div>
            ) : (
              <div className="status-indicator regular">
                <FaCheckCircle />
                <span>Your cycle appears regular</span>
              </div>
            )}
          </div>

          {irregularity.analysis && (
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
          <div className="icon-wrapper" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <FaBrain />
          </div>
          <h3>Mood & Cycle Connection</h3>
        </div>

        <div className="connection-content">
          <p className="connection-intro">
            Your menstrual cycle affects your emotional patterns through hormonal fluctuations. 
            Understanding this connection can help you manage your mental wellness better.
          </p>

          <div className="phase-moods">
            <div className="phase-mood-item">
              <h5>🌊 Menstrual Phase</h5>
              <p>Energy may be lower. Be gentle with yourself and prioritize rest.</p>
            </div>
            <div className="phase-mood-item">
              <h5>🌱 Follicular Phase</h5>
              <p>Rising estrogen can boost mood and energy. Great time for new projects.</p>
            </div>
            <div className="phase-mood-item">
              <h5>☀️ Ovulation</h5>
              <p>Peak energy and confidence. Optimal for social activities.</p>
            </div>
            <div className="phase-mood-item">
              <h5>🌙 Luteal Phase</h5>
              <p>Progesterone rises, potentially causing PMS. Practice extra self-care.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsights;

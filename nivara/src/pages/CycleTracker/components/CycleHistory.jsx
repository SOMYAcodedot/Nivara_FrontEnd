import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHistory, FaCalendarAlt, FaTint, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import "./CycleHistory.css";

const API_BASE_URL = "http://localhost:8000/api";

const CycleHistory = ({ refreshTrigger }) => {
  const [periodLogs, setPeriodLogs] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("periods");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [periodsRes, checkinsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cycle/period/`, { headers }),
        axios.get(`${API_BASE_URL}/cycle/checkin/?days=30`, { headers })
      ]);

      // Ensure data is always an array
      const periodData = periodsRes.data?.results || periodsRes.data || [];
      const checkinData = checkinsRes.data?.results || checkinsRes.data || [];
      setPeriodLogs(Array.isArray(periodData) ? periodData : []);
      setCheckinHistory(Array.isArray(checkinData) ? checkinData : []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeriod = async (logId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/cycle/period/${logId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPeriodLogs(prev => prev.filter(log => log.id !== logId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting period:", err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getFlowColor = (flow) => {
    switch (flow) {
      case "light": return "#ffcdd2";
      case "moderate": return "#ef9a9a";
      case "heavy": return "#e57373";
      case "very_heavy": return "#c62828";
      default: return "#bdbdbd";
    }
  };

  if (loading) {
    return (
      <div className="cycle-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-history">
      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${activeView === "periods" ? "active" : ""}`}
          onClick={() => setActiveView("periods")}
        >
          <FaTint /> Period Logs
        </button>
        <button
          className={`toggle-btn ${activeView === "checkins" ? "active" : ""}`}
          onClick={() => setActiveView("checkins")}
        >
          <FaCalendarAlt /> Daily Check-ins
        </button>
      </div>

      {/* Period Logs */}
      {activeView === "periods" && (
        <div className="history-section">
          <h3>
            <FaHistory /> Period History
          </h3>
          
          {periodLogs.length === 0 ? (
            <div className="empty-state">
              <FaTint className="empty-icon" />
              <p>No period logs yet</p>
              <span>Start logging your periods to see your history here.</span>
            </div>
          ) : (
            <div className="period-logs">
              {periodLogs.map((log) => (
                <div key={log.id} className="period-log-card">
                  <div className="log-header">
                    <div className="log-dates">
                      <span className="start-date">
                        <FaCalendarAlt /> {formatDate(log.period_start_date)}
                      </span>
                      {log.period_end_date && (
                        <span className="end-date">
                          to {formatDate(log.period_end_date)}
                        </span>
                      )}
                    </div>
                    <div className="log-actions">
                      <button
                        className="action-btn delete"
                        onClick={() => setDeleteConfirm(log.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="log-details">
                    <div className="detail-badge">
                      <span 
                        className="flow-dot" 
                        style={{ background: getFlowColor(log.flow_intensity) }}
                      ></span>
                      {log.flow_intensity?.replace("_", " ")} flow
                    </div>
                    
                    {log.severe_pain && (
                      <div className="detail-badge pain">
                        <FaExclamationTriangle /> Severe pain
                      </div>
                    )}

                    {log.cycle_length && (
                      <div className="detail-badge">
                        {log.cycle_length} day cycle
                      </div>
                    )}
                  </div>

                  {log.notes && (
                    <p className="log-notes">{log.notes}</p>
                  )}

                  {/* Delete Confirmation */}
                  {deleteConfirm === log.id && (
                    <div className="delete-confirm">
                      <p>Delete this period log?</p>
                      <div className="confirm-actions">
                        <button
                          className="confirm-btn cancel"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="confirm-btn delete"
                          onClick={() => handleDeletePeriod(log.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Check-ins */}
      {activeView === "checkins" && (
        <div className="history-section">
          <h3>
            <FaCalendarAlt /> Check-in History (Last 30 Days)
          </h3>
          
          {checkinHistory.length === 0 ? (
            <div className="empty-state">
              <FaCalendarAlt className="empty-icon" />
              <p>No check-ins yet</p>
              <span>Start doing daily check-ins to track patterns.</span>
            </div>
          ) : (
            <div className="checkin-logs">
              {checkinHistory.map((checkin) => (
                <div key={checkin.id} className="checkin-log-card">
                  <div className="checkin-date">
                    <FaCalendarAlt />
                    {formatDate(checkin.checkin_date)}
                  </div>

                  <div className="checkin-content">
                    {checkin.mood && checkin.mood.length > 0 && (
                      <div className="checkin-row">
                        <span className="row-label">Mood:</span>
                        <div className="tag-list">
                          {checkin.mood.map((m, i) => (
                            <span key={i} className="tag mood-tag">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkin.energy_level && (
                      <div className="checkin-row">
                        <span className="row-label">Energy:</span>
                        <span className={`energy-badge ${checkin.energy_level}`}>
                          {checkin.energy_level.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    {checkin.physical_symptoms && checkin.physical_symptoms.length > 0 && (
                      <div className="checkin-row">
                        <span className="row-label">Symptoms:</span>
                        <div className="tag-list">
                          {checkin.physical_symptoms.map((s, i) => (
                            <span key={i} className="tag symptom-tag">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkin.user_notes && (
                      <p className="checkin-notes">{checkin.user_notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleHistory;

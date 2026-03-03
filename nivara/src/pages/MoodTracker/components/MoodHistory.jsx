import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHistory, FaCalendarAlt, FaSyncAlt, FaChevronDown } from "react-icons/fa";
import "./MoodHistory.css";

const EMOTION_EMOJIS = {
  happy: "😊",
  calm: "😌",
  content: "🙂",
  hopeful: "🌟",
  excited: "🎉",
  neutral: "😐",
  tired: "😴",
  anxious: "😰",
  stressed: "😓",
  sad: "😢",
  irritated: "😤",
  overwhelmed: "😵",
};

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

const MoodHistory = ({ refreshTrigger }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8000/api/mood/history/detailed/?days=${days}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEntries(response.data.entries || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load mood history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, limit, refreshTrigger]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodColor = (score) => {
    if (score >= 8) return "#4CAF50";
    if (score >= 6) return "#8BC34A";
    if (score >= 4) return "#FFC107";
    if (score >= 2) return "#FF7043";
    return "#EF5350";
  };

  const loadMore = () => {
    setLimit((prev) => prev + 10);
  };

  if (loading && entries.length === 0) {
    return (
      <div className="history-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading your mood history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-error">
        <p>{error}</p>
        <button onClick={fetchHistory} className="retry-btn">
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mood-history">
      <div className="history-header">
        <div className="header-title">
          <FaHistory className="history-icon" />
          <h3>Mood History</h3>
        </div>
        <div className="history-filter">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="days-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
          </select>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="history-empty">
          <FaCalendarAlt className="empty-icon" />
          <p>No mood entries yet. Start logging your moods!</p>
        </div>
      ) : (
        <>
          <div className="entries-list">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`entry-card ${expanded[entry.id] ? "expanded" : ""}`}
                onClick={() => entry.journal_text && toggleExpand(entry.id)}
              >
                <div className="entry-main">
                  {/* Mood Score */}
                  <div
                    className="mood-score-badge"
                    style={{ background: getMoodColor(entry.mood_score) }}
                  >
                    {entry.mood_score}
                  </div>

                  {/* Emotion */}
                  <div className="entry-emotion">
                    <span className="emotion-emoji">
                      {EMOTION_EMOJIS[entry.emotion_type] || "😐"}
                    </span>
                    <span
                      className="emotion-text"
                      style={{ color: EMOTION_COLORS[entry.emotion_type] }}
                    >
                      {entry.emotion_type?.charAt(0).toUpperCase() +
                        entry.emotion_type?.slice(1)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="entry-date">
                    <span className="date-text">{formatDate(entry.entry_date)}</span>
                    {entry.created_at && (
                      <span className="time-text">{formatTime(entry.created_at)}</span>
                    )}
                  </div>

                  {/* Expand indicator */}
                  {entry.journal_text && (
                    <div className={`expand-icon ${expanded[entry.id] ? "rotated" : ""}`}>
                      <FaChevronDown />
                    </div>
                  )}
                </div>

                {/* Journal Text (expanded) */}
                {entry.journal_text && expanded[entry.id] && (
                  <div className="entry-journal">
                    <p>{entry.journal_text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-btn" disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodHistory;

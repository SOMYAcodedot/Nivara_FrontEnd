import React, { useState } from "react";
import axios from "axios";
import { FaPaperPlane, FaCalendarAlt, FaSmile, FaBook } from "react-icons/fa";
import "./MoodForm.css";

const EMOTION_TYPES = [
  { value: "happy", label: "Happy", emoji: "😊", color: "#4CAF50" },
  { value: "calm", label: "Calm", emoji: "😌", color: "#81C784" },
  { value: "content", label: "Content", emoji: "🙂", color: "#8BC34A" },
  { value: "hopeful", label: "Hopeful", emoji: "🌟", color: "#FFC107" },
  { value: "excited", label: "Excited", emoji: "🎉", color: "#FF9800" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "#9E9E9E" },
  { value: "tired", label: "Tired", emoji: "😴", color: "#78909C" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "#FF7043" },
  { value: "stressed", label: "Stressed", emoji: "😓", color: "#EF5350" },
  { value: "sad", label: "Sad", emoji: "😢", color: "#42A5F5" },
  { value: "irritated", label: "Irritated", emoji: "😤", color: "#E57373" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: "#AB47BC" },
];

const MoodForm = ({ onMoodLogged }) => {
  const [formData, setFormData] = useState({
    mood_score: 5,
    emotion_type: "",
    journal_text: "",
    entry_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleScoreChange = (score) => {
    setFormData({ ...formData, mood_score: score });
  };

  const handleEmotionSelect = (emotion) => {
    setFormData({ ...formData, emotion_type: emotion });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emotion_type) {
      setMessage({ text: "Please select an emotion type", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://localhost:8000/api/mood/log/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ text: "Mood logged successfully! 🎉", type: "success" });
      setFormData({
        mood_score: 5,
        emotion_type: "",
        journal_text: "",
        entry_date: new Date().toISOString().split("T")[0],
      });

      if (onMoodLogged) {
        onMoodLogged();
      }
    } catch (error) {
      console.error("Error logging mood:", error);
      setMessage({
        text: error.response?.data?.error || "Failed to log mood. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodLabel = (score) => {
    if (score <= 2) return "Very Low";
    if (score <= 4) return "Low";
    if (score <= 6) return "Moderate";
    if (score <= 8) return "Good";
    return "Excellent";
  };

  const getMoodColor = (score) => {
    if (score <= 2) return "#EF5350";
    if (score <= 4) return "#FF7043";
    if (score <= 6) return "#FFC107";
    if (score <= 8) return "#8BC34A";
    return "#4CAF50";
  };

  return (
    <div className="mood-form-card">
      <div className="mood-form-header">
        <FaSmile className="form-icon" />
        <h3>Log Your Mood</h3>
      </div>

      {message.text && (
        <div className={`form-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mood-form">
        {/* Mood Score Slider */}
        <div className="form-group">
          <label>How are you feeling? (1-10)</label>
          <div className="mood-slider-container">
            <div className="mood-score-display" style={{ color: getMoodColor(formData.mood_score) }}>
              <span className="score-number">{formData.mood_score}</span>
              <span className="score-label">{getMoodLabel(formData.mood_score)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood_score}
              onChange={(e) => handleScoreChange(parseInt(e.target.value))}
              className="mood-slider"
              style={{
                background: `linear-gradient(to right, ${getMoodColor(formData.mood_score)} 0%, ${getMoodColor(formData.mood_score)} ${(formData.mood_score - 1) * 11.11}%, #e0e0e0 ${(formData.mood_score - 1) * 11.11}%, #e0e0e0 100%)`,
              }}
            />
            <div className="slider-labels">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Emotion Selection */}
        <div className="form-group">
          <label>What emotion best describes you?</label>
          <div className="emotion-grid">
            {EMOTION_TYPES.map((emotion) => (
              <button
                type="button"
                key={emotion.value}
                className={`emotion-btn ${formData.emotion_type === emotion.value ? "selected" : ""}`}
                onClick={() => handleEmotionSelect(emotion.value)}
                style={{
                  "--emotion-color": emotion.color,
                  borderColor: formData.emotion_type === emotion.value ? emotion.color : "transparent",
                  background: formData.emotion_type === emotion.value ? `${emotion.color}15` : "transparent",
                }}
              >
                <span className="emotion-emoji">{emotion.emoji}</span>
                <span className="emotion-label">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="form-group">
          <label>
            <FaCalendarAlt className="label-icon" /> Date
          </label>
          <input
            type="date"
            name="entry_date"
            value={formData.entry_date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="date-input"
          />
        </div>

        {/* Journal Entry */}
        <div className="form-group">
          <label>
            <FaBook className="label-icon" /> Journal Entry (Optional)
          </label>
          <textarea
            name="journal_text"
            value={formData.journal_text}
            onChange={handleChange}
            placeholder="Write about your day, thoughts, or feelings..."
            rows="4"
            className="journal-textarea"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <FaPaperPlane /> Log Mood
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MoodForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarDay, FaPaperPlane, FaSmile, FaBolt, FaHeartbeat } from "react-icons/fa";
import "./DailyCheckin.css";

const API_BASE_URL = "http://localhost:8000/api";

const DailyCheckin = ({ onCheckinComplete }) => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [todayCheckin, setTodayCheckin] = useState(null);

  const [formData, setFormData] = useState({
    checkin_date: new Date().toISOString().split("T")[0],
    mood: [],
    energy_level: "",
    physical_symptoms: [],
    user_notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [optionsRes, todayRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cycle/options/`),
        axios.get(`${API_BASE_URL}/cycle/checkin/today/`, { headers })
      ]);

      setOptions(optionsRes.data);

      // If there's already a checkin for today, populate the form
      if (todayRes.data && !todayRes.data.message) {
        setTodayCheckin(todayRes.data);
        setFormData({
          checkin_date: todayRes.data.checkin_date,
          mood: todayRes.data.mood || [],
          energy_level: todayRes.data.energy_level || "",
          physical_symptoms: todayRes.data.physical_symptoms || [],
          user_notes: todayRes.data.user_notes || ""
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      // Try to fetch just options if today's checkin fails
      try {
        const optionsRes = await axios.get(`${API_BASE_URL}/cycle/options/`);
        setOptions(optionsRes.data);
      } catch (optErr) {
        console.error("Error fetching options:", optErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ text: "", type: "" });
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // At least one field should be filled
    if (formData.mood.length === 0 && !formData.energy_level && formData.physical_symptoms.length === 0) {
      setMessage({ text: "Please select at least one mood, energy level, or symptom", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("access_token");

      await axios.post(`${API_BASE_URL}/cycle/checkin/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setMessage({ 
        text: todayCheckin ? "Check-in updated! 🎉" : "Check-in saved! 🎉", 
        type: "success" 
      });

      if (onCheckinComplete) {
        onCheckinComplete();
      }

      // Refresh today's checkin
      fetchData();
    } catch (err) {
      console.error("Error saving checkin:", err);
      setMessage({
        text: err.response?.data?.error || "Failed to save check-in. Please try again.",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="daily-checkin-card cycle-card">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-checkin-card cycle-card">
      <div className="cycle-card-header">
        <div className="icon-wrapper">
          <FaCalendarDay />
        </div>
        <h3>Daily Check-in</h3>
      </div>

      {todayCheckin && (
        <div className="checkin-info">
          <span className="checkin-badge">Already checked in today</span>
          <p>Update your check-in below if anything has changed.</p>
        </div>
      )}

      {message.text && (
        <div className={`form-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkin-form">
        {/* Mood Selection */}
        <div className="form-group">
          <label>
            <FaSmile className="label-icon" />
            How are you feeling today?
          </label>
          <p className="field-hint">Select all that apply</p>
          <div className="mood-select-grid">
            {options?.mood_choices?.map((mood) => (
              <button
                key={mood.value}
                type="button"
                className={`mood-option ${formData.mood.includes(mood.value) ? "selected" : ""}`}
                onClick={() => handleMultiSelect("mood", mood.value)}
              >
                <span className="mood-emoji">{getMoodEmoji(mood.value)}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div className="form-group">
          <label>
            <FaBolt className="label-icon" />
            Energy Level
          </label>
          <div className="energy-options">
            {options?.energy_choices?.map((energy) => (
              <button
                key={energy.value}
                type="button"
                className={`energy-option ${formData.energy_level === energy.value ? "selected" : ""}`}
                onClick={() => handleInputChange("energy_level", energy.value)}
              >
                <span className={`energy-indicator ${energy.value}`}></span>
                {energy.label}
              </button>
            ))}
          </div>
        </div>

        {/* Physical Symptoms */}
        <div className="form-group">
          <label>
            <FaHeartbeat className="label-icon" />
            Physical Symptoms
          </label>
          <p className="field-hint">Select all that apply</p>
          <div className="symptoms-grid">
            {options?.physical_symptoms?.map((symptom) => (
              <button
                key={symptom.value}
                type="button"
                className={`symptom-option ${formData.physical_symptoms.includes(symptom.value) ? "selected" : ""}`}
                onClick={() => handleMultiSelect("physical_symptoms", symptom.value)}
              >
                {symptom.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label>Anything else you'd like me to know today?</label>
          <textarea
            value={formData.user_notes}
            onChange={(e) => handleInputChange("user_notes", e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            "Saving..."
          ) : (
            <>
              <FaPaperPlane /> {todayCheckin ? "Update Check-in" : "Save Check-in"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Helper function to get emoji for mood
const getMoodEmoji = (moodValue) => {
  const emojiMap = {
    calm: "😌",
    happy: "😊",
    irritated: "😤",
    anxious: "😰",
    emotional: "🥺",
    low: "😢",
    motivated: "💪",
    overwhelmed: "😵"
  };
  return emojiMap[moodValue] || "😐";
};

export default DailyCheckin;

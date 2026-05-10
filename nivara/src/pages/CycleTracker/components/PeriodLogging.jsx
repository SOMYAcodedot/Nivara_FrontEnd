import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarPlus, FaPaperPlane, FaNotesMedical, FaTint } from "react-icons/fa";
import "./PeriodLogging.css";

const API_BASE_URL = "http://localhost:8000/api";

const PeriodLogging = ({ onPeriodLogged }) => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    period_start_date: new Date().toISOString().split("T")[0],
    period_end_date: "",
    flow_intensity: "",
    severe_pain: false,
    notes: "",
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cycle/options/`);
      setOptions(response.data);
    } catch (err) {
      console.error("Error fetching options:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.period_start_date) {
      setMessage({ text: "Please enter the period start date", type: "error" });
      return;
    }
    if (!formData.flow_intensity) {
      setMessage({ text: "Please select flow intensity", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("access_token");

      const submitData = {
        period_start_date: formData.period_start_date,
        flow_intensity: formData.flow_intensity,
        severe_pain: formData.severe_pain,
        notes: formData.notes,
      };
      if (formData.period_end_date) {
        submitData.period_end_date = formData.period_end_date;
      }

      await axios.post(`${API_BASE_URL}/cycle/period/`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage({ text: "Period logged successfully! 🎉", type: "success" });

      setFormData({
        period_start_date: new Date().toISOString().split("T")[0],
        period_end_date: "",
        flow_intensity: "",
        severe_pain: false,
        notes: "",
      });

      if (onPeriodLogged) onPeriodLogged();
    } catch (err) {
      console.error("Error logging period:", err);
      setMessage({
        text: err.response?.data?.error || "Failed to log period. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="period-logging-card cycle-card">
        <div className="pl-loading">
          <div className="pl-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  const flowOptions =
    options?.flow_intensity_options || options?.flow_choices || [];

  return (
    <div className="period-logging-card cycle-card">
      <div className="cycle-card-header">
        <div className="icon-wrapper">
          <FaCalendarPlus />
        </div>
        <h3>Log New Period</h3>
      </div>

      {message.text && (
        <div className={`pl-message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="period-form">

        {/* ── Row 1: Dates ── */}
        <div className="form-group date-start-group">
          <label>
            <FaCalendarPlus className="label-icon" />
            Period Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            value={formData.period_start_date}
            onChange={(e) => handleInputChange("period_start_date", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="form-group date-end-group">
          <label>
            <FaCalendarPlus className="label-icon" />
            Period End Date
            <span className="optional-tag">Optional</span>
          </label>
          <input
            type="date"
            value={formData.period_end_date}
            onChange={(e) => handleInputChange("period_end_date", e.target.value)}
            min={formData.period_start_date}
            max={new Date().toISOString().split("T")[0]}
          />
          <span className="helper-text">Leave blank if your period is still ongoing</span>
        </div>

        {/* ── Row 2: Flow Intensity (full width) ── */}
        <div className="form-group flow-group">
          <label>
            <FaTint className="label-icon" />
            Flow Intensity <span className="required">*</span>
          </label>
          <div className="flow-options">
            {flowOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`flow-option flow-${option.value}${formData.flow_intensity === option.value ? " selected" : ""}`}
                onClick={() => handleInputChange("flow_intensity", option.value)}
              >
                <span className={`flow-indicator flow-ind-${option.value}`} />
                <span className="flow-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Row 3: Pain toggle + Notes ── */}
        <div className="form-group pain-group">
          <label>😣 Severe Pain?</label>
          <div
            className={`pain-card${formData.severe_pain ? " pain-active" : ""}`}
            onClick={() => handleInputChange("severe_pain", !formData.severe_pain)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && handleInputChange("severe_pain", !formData.severe_pain)}
          >
            <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.severe_pain}
                onChange={(e) => handleInputChange("severe_pain", e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span className="pain-label">
              {formData.severe_pain ? "Yes, experiencing severe pain" : "No severe pain"}
            </span>
          </div>
        </div>

        <div className="form-group notes-group">
          <label>
            <FaNotesMedical className="label-icon" />
            Notes
            <span className="optional-tag">Optional</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Any additional notes about this period…"
            rows={4}
          />
        </div>

        {/* ── Submit ── */}
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? (
            "Logging…"
          ) : (
            <>
              <FaPaperPlane /> Log Period
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PeriodLogging;

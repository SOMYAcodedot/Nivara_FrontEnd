import { useState } from "react";
import axios from "axios";
import {
  FaPaperPlane, FaCalendarAlt, FaSmile, FaBook,
  FaClipboardList, FaBolt, FaRedo,
} from "react-icons/fa";
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

const EMOTION_EMOJIS = {
  happy: "😊", calm: "😌", content: "🙂", hopeful: "🌟", excited: "🎉",
  neutral: "😐", tired: "😴", anxious: "😰", stressed: "😓",
  sad: "😢", irritated: "😤", overwhelmed: "😵",
};

// For positive metrics: high = good (green). For stress/anxiety: high = bad (red).
const LEVEL_COLOR = { high: "#4CAF50", medium: "#FFC107", low: "#EF5350" };
const LEVEL_COLOR_REVERSED = { high: "#EF5350", medium: "#FFC107", low: "#4CAF50" };

const getLevelColor = (level, reversed) =>
  (reversed ? LEVEL_COLOR_REVERSED : LEVEL_COLOR)[level] || "#9E9E9E";

// ─── Assessment Result Card ────────────────────────────────────────────────────

const AssessmentResult = ({ result, getMoodColor, getMoodLabel, onLogAnother }) => {
  const { mood_entry, assessment_breakdown } = result;
  const scoreColor = getMoodColor(mood_entry.mood_score);
  const emoji = EMOTION_EMOJIS[mood_entry.emotion_type] || "😶";

  const breakdownItems = [
    { key: "energy_level", label: "Energy Level", reversed: false },
    { key: "sleep_quality", label: "Sleep Quality", reversed: false },
    { key: "stress_level", label: "Stress Level", reversed: true },
    { key: "anxiety_level", label: "Anxiety Level", reversed: true },
  ];

  return (
    <div className="assessment-result">
      <div className="result-header-banner">
        <span className="result-check">✓</span>
        <span>Assessment complete</span>
      </div>

      <div className="result-emotion-card">
        <span className="result-emoji">{emoji}</span>
        <div className="result-emotion-info">
          <span className="result-emotion-label">{mood_entry.emotion_label}</span>
          <div className="result-score">
            <span className="result-score-number" style={{ color: scoreColor }}>
              {mood_entry.mood_score}
            </span>
            <span className="result-score-sub">/ 10 &nbsp;·&nbsp; {getMoodLabel(mood_entry.mood_score)}</span>
          </div>
        </div>
      </div>

      <div className="result-breakdown">
        <h4 className="breakdown-title">Breakdown</h4>
        <div className="breakdown-grid">
          {breakdownItems.map(({ key, label, reversed }) => {
            const level = assessment_breakdown[key];
            const color = getLevelColor(level, reversed);
            return (
              <div key={key} className="breakdown-item">
                <span className="breakdown-label">{label}</span>
                <span
                  className="breakdown-badge"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button type="button" className="log-another-btn" onClick={onLogAnother}>
        <FaRedo /> Take Another Assessment
      </button>
    </div>
  );
};

// ─── Main MoodForm ─────────────────────────────────────────────────────────────

const MoodForm = ({ onMoodLogged }) => {
  const [mode, setMode] = useState("quick");

  // Quick log state
  const [formData, setFormData] = useState({
    mood_score: 5,
    emotion_type: "",
    journal_text: "",
    entry_date: new Date().toISOString().split("T")[0],
  });

  // Assessment state
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [journalText, setJournalText] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchQuestions = async () => {
    if (questions.length > 0) return;
    setQuestionsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/mood/questions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.questions || []);
    } catch {
      setMessage({ text: "Failed to load assessment questions. Please try again.", type: "error" });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMessage({ text: "", type: "" });
    setAssessmentResult(null);
    if (newMode === "assessment") fetchQuestions();
  };

  // ── Quick log handlers ────────────────────────────────────────────────────

  const handleScoreChange = (score) => setFormData({ ...formData, mood_score: score });
  const handleEmotionSelect = (emotion) => setFormData({ ...formData, emotion_type: emotion });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emotion_type) {
      setMessage({ text: "Please select an emotion type", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("http://localhost:8000/api/mood/log/", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setMessage({ text: "Mood logged successfully! 🎉", type: "success" });
      setFormData({
        mood_score: 5,
        emotion_type: "",
        journal_text: "",
        entry_date: new Date().toISOString().split("T")[0],
      });
      if (onMoodLogged) onMoodLogged();
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to log mood. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Assessment handlers ───────────────────────────────────────────────────

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setMessage({
        text: `Please answer all ${questions.length} questions (${answeredCount} answered so far)`,
        type: "error",
      });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("access_token");
      const payload = { answers, entry_date: entryDate };
      if (journalText.trim()) payload.journal_text = journalText;
      const res = await axios.post("http://localhost:8000/api/mood/assess/", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setAssessmentResult(res.data);
      setAnswers({});
      setJournalText("");
      setEntryDate(new Date().toISOString().split("T")[0]);
      if (onMoodLogged) onMoodLogged();
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to submit assessment. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  const answeredCount = Object.keys(answers).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mood-form-card">
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-btn ${mode === "quick" ? "active" : ""}`}
          onClick={() => handleModeChange("quick")}
        >
          <FaSmile /> Quick Log
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "assessment" ? "active" : ""}`}
          onClick={() => handleModeChange("assessment")}
        >
          <FaClipboardList /> Mood Assessment
        </button>
      </div>

      {/* Header */}
      <div className="mood-form-header">
        {mode === "quick" ? (
          <FaSmile className="form-icon" />
        ) : (
          <FaClipboardList className="form-icon" />
        )}
        <div>
          <h3>{mode === "quick" ? "Log Your Mood" : "Mood Assessment"}</h3>
          <p className="form-subtitle">
            {mode === "quick"
              ? "Quickly capture how you're feeling right now"
              : "Answer 8 questions for a deeper emotional analysis"}
          </p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`form-message ${message.type}`}>{message.text}</div>
      )}

      {/* ── Quick Log Form ── */}
      {mode === "quick" && (
        <form onSubmit={handleQuickSubmit} className="mood-form">
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
              <FaBook className="label-icon" /> Journal Entry{" "}
              <span className="optional-tag">(Optional)</span>
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <><FaPaperPlane /> Log Mood</>
            )}
          </button>
        </form>
      )}

      {/* ── Assessment Mode ── */}
      {mode === "assessment" && (
        <>
          {assessmentResult ? (
            <AssessmentResult
              result={assessmentResult}
              getMoodColor={getMoodColor}
              getMoodLabel={getMoodLabel}
              onLogAnother={() => setAssessmentResult(null)}
            />
          ) : questionsLoading ? (
            <div className="questions-loading">
              <span className="loading-spinner dark"></span>
              <p>Loading your assessment...</p>
            </div>
          ) : questions.length > 0 ? (
            <form onSubmit={handleAssessmentSubmit} className="assessment-form">
              {/* Progress */}
              <div className="assessment-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
                <span className="progress-text">
                  {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Questions */}
              <div className="questions-list">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`question-card ${answers[q.id] !== undefined ? "answered" : ""}`}
                  >
                    <div className="question-header">
                      <span className="question-badge">Q{idx + 1}</span>
                      <span className="question-text">{q.text}</span>
                    </div>
                    <div className="options-row">
                      {q.options.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          className={`option-btn ${answers[q.id] === opt.value ? "selected" : ""}`}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                          title={opt.label}
                        >
                          <span className="option-number">{opt.value}</span>
                          <span className="option-label">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Journal (optional) */}
              <div className="form-group">
                <label>
                  <FaBook className="label-icon" /> Journal Entry{" "}
                  <span className="optional-tag">(Optional)</span>
                </label>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Write about your day, thoughts, or feelings..."
                  rows="3"
                  className="journal-textarea"
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label>
                  <FaCalendarAlt className="label-icon" /> Date
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="date-input"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || answeredCount < questions.length}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <><FaBolt /> Analyze My Mood</>
                )}
              </button>
            </form>
          ) : (
            !questionsLoading && (
              <div className="questions-loading">
                <p>Could not load questions. Please try refreshing.</p>
                <button
                  type="button"
                  className="log-another-btn"
                  onClick={() => { setQuestions([]); fetchQuestions(); }}
                >
                  Retry
                </button>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default MoodForm;

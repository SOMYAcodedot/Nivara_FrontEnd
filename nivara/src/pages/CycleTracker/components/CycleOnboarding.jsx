import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaArrowRight, FaArrowLeft, FaCheck, FaHeart } from "react-icons/fa";
import "./CycleOnboarding.css";

const API_BASE_URL = "http://localhost:8000/api";

// Default fallback options in case API doesn't return them
const DEFAULT_OPTIONS = {
  cycle_length_choices: [
    { value: "21-24", label: "21–24 days" },
    { value: "25-28", label: "25–28 days" },
    { value: "29-32", label: "29–32 days" },
    { value: "33-35", label: "33–35 days" },
    { value: "35+", label: "More than 35 days" },
    { value: "not_sure", label: "Not sure" }
  ],
  period_length_choices: [
    { value: "2-3", label: "2–3 days" },
    { value: "3-4", label: "3–4 days" },
    { value: "5-6", label: "5–6 days" },
    { value: "7+", label: "7+ days" },
    { value: "not_sure", label: "Not sure" }
  ],
  regularity_choices: [
    { value: "mostly_regular", label: "Yes, mostly regular" },
    { value: "sometimes_irregular", label: "Sometimes irregular" },
    { value: "very_unpredictable", label: "Very unpredictable" },
    { value: "not_sure", label: "Not sure" }
  ],
  flow_choices: [
    { value: "light", label: "Light" },
    { value: "moderate", label: "Moderate" },
    { value: "heavy", label: "Heavy" },
    { value: "very_heavy", label: "Very heavy" },
    { value: "not_sure", label: "Not sure" }
  ],
  spotting_choices: [
    { value: "never", label: "Never" },
    { value: "occasionally", label: "Occasionally" },
    { value: "frequently", label: "Frequently" },
    { value: "not_sure", label: "Not sure" }
  ],
  pms_symptoms: [
    { value: "mood_swings", label: "Mood swings" },
    { value: "irritability", label: "Irritability" },
    { value: "anxiety", label: "Anxiety" },
    { value: "low_mood", label: "Low mood" },
    { value: "bloating", label: "Bloating" },
    { value: "breast_tenderness", label: "Breast tenderness" },
    { value: "headache", label: "Headache" },
    { value: "fatigue", label: "Fatigue" },
    { value: "cramps", label: "Cramps" },
    { value: "acne", label: "Acne" },
    { value: "sleep_disturbance", label: "Sleep disturbance" },
    { value: "none", label: "No noticeable symptoms" },
    { value: "not_sure", label: "Not sure" }
  ],
  birth_control_choices: [
    { value: "no", label: "No" },
    { value: "pill", label: "Yes – Pill" },
    { value: "hormonal_iud", label: "Yes – Hormonal IUD" },
    { value: "copper_iud", label: "Yes – Copper IUD" },
    { value: "patch_ring", label: "Yes – Patch / Ring" },
    { value: "prefer_not_say", label: "Prefer not to say" }
  ],
  reproductive_status_choices: [
    { value: "none", label: "None" },
    { value: "trying_to_conceive", label: "Trying to conceive" },
    { value: "pregnant", label: "Pregnant" },
    { value: "postpartum", label: "Postpartum" },
    { value: "prefer_not_say", label: "Prefer not to say" }
  ]
};

const CycleOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    last_period_start_date: "",
    average_cycle_length: "",
    average_period_length: "",
    cycle_regularity: "",
    flow_intensity_last_period: "",
    spotting_between_periods: "",
    typical_pms_symptoms: [],
    birth_control_status: "",
    reproductive_status: ""
  });

  const totalSteps = 9;

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cycle/options/`);
      // Merge API options with defaults, preferring API values
      if (response.data) {
        setOptions(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (err) {
      console.error("Error fetching options:", err);
      // Keep using default options, no need to show error
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
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
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.last_period_start_date !== "";
      case 2:
        return formData.average_cycle_length !== "";
      case 3:
        return formData.average_period_length !== "";
      case 4:
        return formData.cycle_regularity !== "";
      case 5:
        return formData.flow_intensity_last_period !== "";
      case 6:
        return formData.spotting_between_periods !== "";
      case 7:
        return true; // PMS symptoms are optional
      case 8:
        return formData.birth_control_status !== "";
      case 9:
        return formData.reproductive_status !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setError("Please complete this step before continuing.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setError("Please complete this step before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      
      // Prepare submission data
      const submitData = {
        ...formData,
        typical_pms_symptoms: formData.typical_pms_symptoms.length > 0 
          ? formData.typical_pms_symptoms 
          : ["none"]
      };

      await axios.post(`${API_BASE_URL}/cycle/profile/`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      onComplete();
    } catch (err) {
      console.error("Error submitting profile:", err);
      setError(err.response?.data?.error || "Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    // Get options with fallback to defaults
    const cycleOptions = options.cycle_length_choices || DEFAULT_OPTIONS.cycle_length_choices;
    const periodOptions = options.period_length_choices || DEFAULT_OPTIONS.period_length_choices;
    const regularityOptions = options.regularity_choices || DEFAULT_OPTIONS.regularity_choices;
    const flowOptions = options.flow_choices || DEFAULT_OPTIONS.flow_choices;
    const spottingOptions = options.spotting_choices || DEFAULT_OPTIONS.spotting_choices;
    const pmsOptions = options.pms_symptoms || DEFAULT_OPTIONS.pms_symptoms;
    const birthControlOptions = options.birth_control_choices || DEFAULT_OPTIONS.birth_control_choices;
    const reproductiveOptions = options.reproductive_status_choices || DEFAULT_OPTIONS.reproductive_status_choices;

    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <FaCalendarAlt className="step-icon" />
              <h3>When did your last period start?</h3>
              <p>This helps us calculate your current cycle day and predictions.</p>
            </div>
            <div className="form-group">
              <input
                type="date"
                value={formData.last_period_start_date}
                onChange={(e) => handleInputChange("last_period_start_date", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>On average, how many days are there from one period to the next?</h3>
              <p>The cycle length is counted from day 1 of one period to day 1 of the next.</p>
            </div>
            <div className="radio-options">
              {cycleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.average_cycle_length === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="average_cycle_length"
                    value={option.value}
                    checked={formData.average_cycle_length === option.value}
                    onChange={(e) => handleInputChange("average_cycle_length", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>How many days does your period usually last?</h3>
              <p>This is the number of days you experience bleeding.</p>
            </div>
            <div className="radio-options">
              {periodOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.average_period_length === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="average_period_length"
                    value={option.value}
                    checked={formData.average_period_length === option.value}
                    onChange={(e) => handleInputChange("average_period_length", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Are your periods mostly predictable?</h3>
              <p>This helps us provide better predictions and insights.</p>
            </div>
            <div className="radio-options">
              {regularityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.cycle_regularity === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="cycle_regularity"
                    value={option.value}
                    checked={formData.cycle_regularity === option.value}
                    onChange={(e) => handleInputChange("cycle_regularity", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>How was your last period flow?</h3>
              <p>Understanding your flow helps track patterns over time.</p>
            </div>
            <div className="radio-options">
              {flowOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.flow_intensity_last_period === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="flow_intensity_last_period"
                    value={option.value}
                    checked={formData.flow_intensity_last_period === option.value}
                    onChange={(e) => handleInputChange("flow_intensity_last_period", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Do you usually notice spotting between periods?</h3>
              <p>Light bleeding between periods is common but worth tracking.</p>
            </div>
            <div className="radio-options">
              {spottingOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.spotting_between_periods === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="spotting_between_periods"
                    value={option.value}
                    checked={formData.spotting_between_periods === option.value}
                    onChange={(e) => handleInputChange("spotting_between_periods", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Do you usually experience any symptoms before your period?</h3>
              <p>Select all that apply. This helps us connect hormonal and emotional patterns.</p>
            </div>
            <div className="multi-select-grid">
              {pmsOptions.map((symptom) => (
                <button
                  key={symptom.value}
                  type="button"
                  className={`multi-select-option ${formData.typical_pms_symptoms.includes(symptom.value) ? "selected" : ""}`}
                  onClick={() => handleMultiSelect("typical_pms_symptoms", symptom.value)}
                >
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Are you currently using hormonal birth control?</h3>
              <p>Birth control can affect cycle patterns and predictions.</p>
            </div>
            <div className="radio-options">
              {birthControlOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.birth_control_status === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="birth_control_status"
                    value={option.value}
                    checked={formData.birth_control_status === option.value}
                    onChange={(e) => handleInputChange("birth_control_status", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Does any of this apply to you?</h3>
              <p>This helps us personalize your experience.</p>
            </div>
            <div className="radio-options">
              {reproductiveOptions.map((option) => (
                <label
                  key={option.value}
                  className={`radio-option ${formData.reproductive_status === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="reproductive_status"
                    value={option.value}
                    checked={formData.reproductive_status === option.value}
                    onChange={(e) => handleInputChange("reproductive_status", e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cycle-onboarding">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Error Message */}
        {error && (
          <div className="form-message error">{error}</div>
        )}

        {/* Navigation Buttons */}
        <div className="onboarding-nav">
          {currentStep > 1 && (
            <button
              type="button"
              className="nav-btn back-btn"
              onClick={handleBack}
            >
              <FaArrowLeft /> Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={!validateCurrentStep()}
            >
              Next <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className="nav-btn submit-btn"
              onClick={handleSubmit}
              disabled={submitting || !validateCurrentStep()}
            >
              {submitting ? (
                <>Saving...</>
              ) : (
                <>
                  <FaCheck /> Complete Setup
                </>
              )}
            </button>
          )}
        </div>

        {/* Welcome Message */}
        {currentStep === 1 && (
          <div className="welcome-note">
            <FaHeart className="welcome-icon" />
            <p>
              Welcome! Let's set up your cycle tracking. This information helps us
              provide personalized insights about how your cycle affects your emotional wellness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleOnboarding;

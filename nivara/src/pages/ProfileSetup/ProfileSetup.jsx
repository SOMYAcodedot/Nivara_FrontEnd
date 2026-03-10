import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaRulerVertical, FaWeight, FaBed, FaBolt, FaBrain, FaBriefcase, FaArrowRight, FaCheck } from "react-icons/fa";
import "./ProfileSetup.css";

const API_BASE_URL = "http://localhost:8000/api";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lifestyleOptions, setLifestyleOptions] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    sleep_average: 5,
    energy_average: 5,
    anxiety_average: 5,
    lifestyle: ""
  });

  const [errors, setErrors] = useState({});

  const fetchLifestyleOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/lifestyle-options/`);
      setLifestyleOptions(response.data.lifestyle_options);
    } catch (error) {
      console.error("Error fetching lifestyle options:", error);
      // Fallback options
      setLifestyleOptions([
        { value: "student", label: "Student" },
        { value: "working", label: "Working Professional" },
        { value: "homemaker", label: "Homemaker" },
        { value: "retired", label: "Retired" },
        { value: "other", label: "Other" }
      ]);
    }
  }, []);

  const checkProfileStatus = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.is_profile_complete) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Fetch lifestyle options and check profile status on mount
  useEffect(() => {
    fetchLifestyleOptions();
    checkProfileStatus();
  }, [fetchLifestyleOptions, checkProfileStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.age || formData.age < 10 || formData.age > 100) {
        newErrors.age = "Age must be between 10 and 100";
      }
      if (!formData.height || formData.height < 100 || formData.height > 250) {
        newErrors.height = "Height must be between 100 and 250 cm";
      }
      if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
        newErrors.weight = "Weight must be between 30 and 300 kg";
      }
    }
    
    if (step === 2) {
      // Sliders always have valid values (1-10)
    }
    
    if (step === 3) {
      if (!formData.lifestyle) {
        newErrors.lifestyle = "Please select your lifestyle";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("access_token");
    
    try {
      const payload = {
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        sleep_average: formData.sleep_average,
        energy_average: formData.energy_average,
        anxiety_average: formData.anxiety_average,
        lifestyle: formData.lifestyle
      };

      const response = await axios.put(
        `${API_BASE_URL}/user/profile/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage({ type: "success", text: "Profile setup completed successfully! ✅" });
      
      // Update local storage with profile data
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        ...response.data.user_profile,
        is_profile_complete: true
      }));

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Profile setup error:", error.response);
      const errorMsg = error.response?.data?.error || "Failed to complete profile setup";
      setMessage({ type: "error", text: `${errorMsg} ❌` });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
          <div className="step-number">
            {currentStep > step ? <FaCheck /> : step}
          </div>
          <span className="step-label">
            {step === 1 ? "Basic Info" : step === 2 ? "Wellness" : "Lifestyle"}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Tell us about yourself</h3>
      <p className="step-description">This helps us personalize your experience</p>
      
      <div className="form-group">
        <label><FaUser className="input-icon" /> Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Enter your age"
          min="10"
          max="100"
          className={errors.age ? "error" : ""}
        />
        {errors.age && <span className="error-text">{errors.age}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><FaRulerVertical className="input-icon" /> Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="e.g., 165"
            min="100"
            max="250"
            step="0.1"
            className={errors.height ? "error" : ""}
          />
          {errors.height && <span className="error-text">{errors.height}</span>}
        </div>

        <div className="form-group">
          <label><FaWeight className="input-icon" /> Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g., 60"
            min="30"
            max="300"
            step="0.1"
            className={errors.weight ? "error" : ""}
          />
          {errors.weight && <span className="error-text">{errors.weight}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Your Wellness Averages</h3>
      <p className="step-description">Rate your typical weekly averages (1-10)</p>

      <div className="slider-group">
        <label>
          <FaBed className="input-icon" /> Average Sleep Quality
          <span className="slider-value">{formData.sleep_average}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.sleep_average}
          onChange={(e) => handleSliderChange("sleep_average", e.target.value)}
          className="slider"
        />
        <div className="slider-labels">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      <div className="slider-group">
        <label>
          <FaBolt className="input-icon" /> Average Energy Level
          <span className="slider-value">{formData.energy_average}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.energy_average}
          onChange={(e) => handleSliderChange("energy_average", e.target.value)}
          className="slider"
        />
        <div className="slider-labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div className="slider-group">
        <label>
          <FaBrain className="input-icon" /> Average Anxiety Level
          <span className="slider-value">{formData.anxiety_average}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.anxiety_average}
          onChange={(e) => handleSliderChange("anxiety_average", e.target.value)}
          className="slider"
        />
        <div className="slider-labels">
          <span>Calm</span>
          <span>Anxious</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Your Lifestyle</h3>
      <p className="step-description">This helps us tailor recommendations</p>

      <div className="lifestyle-options">
        {lifestyleOptions.map((option) => (
          <label
            key={option.value}
            className={`lifestyle-card ${formData.lifestyle === option.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="lifestyle"
              value={option.value}
              checked={formData.lifestyle === option.value}
              onChange={handleChange}
            />
            <FaBriefcase className="lifestyle-icon" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {errors.lifestyle && <span className="error-text center">{errors.lifestyle}</span>}
    </div>
  );

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <div className="profile-setup-header">
          <h2>Complete Your Profile</h2>
          <p>Help us understand you better for personalized wellness support</p>
        </div>

        {renderStepIndicator()}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Continue <FaArrowRight />
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"} <FaCheck />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

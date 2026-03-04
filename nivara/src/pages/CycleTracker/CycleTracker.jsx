import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFemale, FaCalendarAlt, FaPlusCircle, FaChartLine, FaLightbulb, FaHistory } from "react-icons/fa";
import CycleOnboarding from "./components/CycleOnboarding";
import CycleDashboard from "./components/CycleDashboard";
import PeriodLogging from "./components/PeriodLogging";
import DailyCheckin from "./components/DailyCheckin";
import CycleHistory from "./components/CycleHistory";
import CycleInsights from "./components/CycleInsights";
import "./CycleTracker.css";

const API_BASE_URL = "http://localhost:8000/api";

const CycleTracker = () => {
  const [isOnboarded, setIsOnboarded] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/cycle/onboarding-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsOnboarded(response.data.is_onboarding_complete);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
    { id: "log-period", label: "Log Period", icon: <FaPlusCircle /> },
    { id: "daily-checkin", label: "Daily Check-in", icon: <FaCalendarAlt /> },
    { id: "history", label: "History", icon: <FaHistory /> },
    { id: "insights", label: "Insights", icon: <FaLightbulb /> },
  ];

  if (loading) {
    return (
      <div className="cycle-tracker-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return (
      <div className="cycle-tracker-page">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaFemale className="header-icon" /> Cycle Tracking
            </h1>
            <p>Track your menstrual cycle and connect hormonal patterns with emotional wellness</p>
          </div>
        </div>
        <CycleOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="cycle-tracker-page">
      {/* Page Header */}
      <div className="page-header cycle-header">
        <div className="header-content">
          <h1>
            <FaFemale className="header-icon" /> Cycle Tracking
          </h1>
          <p>Track your menstrual cycle and connect hormonal patterns with emotional wellness</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cycle-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`cycle-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "dashboard" && (
          <CycleDashboard refreshTrigger={refreshTrigger} />
        )}

        {activeTab === "log-period" && (
          <div className="log-period-tab">
            <PeriodLogging onPeriodLogged={handleDataUpdate} />
          </div>
        )}

        {activeTab === "daily-checkin" && (
          <div className="daily-checkin-tab">
            <DailyCheckin onCheckinComplete={handleDataUpdate} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-tab">
            <CycleHistory refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="insights-tab">
            <CycleInsights refreshTrigger={refreshTrigger} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleTracker;

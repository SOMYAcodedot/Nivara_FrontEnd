import React, { useState } from "react";
import { FaChartLine, FaPlusCircle, FaHistory, FaLightbulb } from "react-icons/fa";
import MoodForm from "./components/MoodForm";
import MoodCharts from "./components/MoodCharts";
import MoodInsights from "./components/MoodInsights";
import MoodHistory from "./components/MoodHistory";
import "./MoodTracker.css";

const MoodTracker = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMoodLogged = () => {
    // Trigger refresh of all data components
    setRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartLine /> },
    { id: "log", label: "Log Mood", icon: <FaPlusCircle /> },
    { id: "history", label: "History", icon: <FaHistory /> },
    { id: "insights", label: "Insights", icon: <FaLightbulb /> },
  ];

  return (
    <div className="mood-tracker-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaChartLine className="header-icon" /> Mood Tracking
          </h1>
          <p>Log your daily moods and track your emotional wellness journey</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mood-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mood-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Quick Log Section */}
            <div className="quick-section">
              <MoodForm onMoodLogged={handleMoodLogged} />
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <MoodCharts refreshTrigger={refreshTrigger} />
            </div>

            {/* Insights Summary */}
            <div className="insights-section">
              <MoodInsights refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}

        {activeTab === "log" && (
          <div className="log-tab">
            <div className="form-container">
              <MoodForm onMoodLogged={handleMoodLogged} />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-tab">
            <MoodHistory refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="insights-tab">
            <MoodInsights refreshTrigger={refreshTrigger} />
            <div className="charts-detail">
              <MoodCharts refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;

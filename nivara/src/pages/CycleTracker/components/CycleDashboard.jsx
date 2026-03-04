import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaHeart, 
  FaSeedling, 
  FaMoon, 
  FaSun, 
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaTint,
  FaCircle
} from "react-icons/fa";
import "./CycleDashboard.css";

const API_BASE_URL = "http://localhost:8000/api";

const CycleDashboard = ({ refreshTrigger }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/cycle/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await axios.get(
        `${API_BASE_URL}/cycle/calendar/?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCalendarData(response.data);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case "menstrual": return <FaTint />;
      case "follicular": return <FaSeedling />;
      case "ovulation": return <FaSun />;
      case "luteal": return <FaMoon />;
      default: return <FaCircle />;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "menstrual": return "#E91E63";
      case "follicular": return "#4CAF50";
      case "ovulation": return "#FF9800";
      case "luteal": return "#9C27B0";
      default: return "#666";
    }
  };

  const renderCalendar = () => {
    if (!calendarData) return null;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Day name headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">
          {day}
        </div>
      );
    });

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isPeriod = calendarData.period_days?.includes(dateStr);
      const isPredictedPeriod = calendarData.predicted_period_days?.includes(dateStr);
      const isFertile = calendarData.fertile_days?.includes(dateStr);
      const isOvulation = calendarData.ovulation_days?.includes(dateStr);
      const isPms = calendarData.pms_days?.includes(dateStr);
      const isToday = dateStr === today;

      let dayClass = "calendar-day";
      let phaseLabel = "";
      if (isToday) dayClass += " today";
      if (isPeriod) {
        dayClass += " period";
        phaseLabel = "Period";
      }
      if (isPredictedPeriod) dayClass += " predicted-period";
      if (isFertile) {
        if (!phaseLabel) phaseLabel = "Fertile";
        dayClass += " fertile";
      }
      if (isOvulation) {
        phaseLabel = "Ovulation";
        dayClass += " ovulation";
      }
      if (isPms) {
        if (!phaseLabel) phaseLabel = "PMS";
        dayClass += " pms";
      }

      days.push(
        <div key={day} className={dayClass} title={phaseLabel}>
          <span className="day-number">{day}</span>
          {phaseLabel && <span className="day-phase-label">{phaseLabel}</span>}
          <div className="day-indicators">
            {isPeriod && <span className="indicator period-ind"></span>}
            {isPredictedPeriod && !isPeriod && <span className="indicator predicted-ind"></span>}
            {isOvulation && <span className="indicator ovulation-ind"></span>}
            {isFertile && !isOvulation && <span className="indicator fertile-ind"></span>}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="cycle-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cycle-dashboard">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const status = dashboardData?.current_cycle_status;
  const insights = dashboardData?.personalized_insights;

  return (
    <div className="cycle-dashboard">
      <div className="dashboard-grid">
        {/* Cycle Status Card */}
        <div className="status-card cycle-card">
          <div className="status-header">
            <div 
              className="phase-badge"
              style={{ background: getPhaseColor(status?.cycle_phase) }}
            >
              {getPhaseIcon(status?.cycle_phase)}
              <span>{status?.phase_display || "Loading..."}</span>
            </div>
          </div>

          <div className="cycle-day-display">
            <span className="cycle-day-number">Day {status?.cycle_day || "--"}</span>
            <span className="cycle-day-label">of your cycle</span>
          </div>

          <div className="countdown-section">
            <div className="countdown-box">
              <FaCalendarAlt className="countdown-icon" />
              <div className="countdown-info">
                <span className="countdown-number">{status?.days_until_next_period || "--"}</span>
                <span className="countdown-label">days until period</span>
              </div>
            </div>
            
            {status?.predicted_next_period && (
              <p className="predicted-date">
                Predicted: {new Date(status.predicted_next_period).toLocaleDateString("en-US", { 
                  month: "long", day: "numeric", year: "numeric" 
                })}
              </p>
            )}
          </div>

          {status?.is_fertile_today && (
            <div className="fertile-alert">
              <FaSeedling />
              <span>You're in your fertile window today</span>
            </div>
          )}

          {status?.pms_window && (
            <div className="pms-alert">
              <FaMoon />
              <span>PMS window - be gentle with yourself</span>
            </div>
          )}
        </div>

        {/* Calendar Card */}
        <div className="calendar-card cycle-card">
          <div className="calendar-header">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              <FaChevronLeft />
            </button>
            <h3>
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              <FaChevronRight />
            </button>
          </div>
          
          <div className="calendar-grid">
            {renderCalendar()}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot period"></span>
              <span>Period</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot predicted"></span>
              <span>Predicted</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot fertile"></span>
              <span>Fertile</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot ovulation"></span>
              <span>Ovulation</span>
            </div>
          </div>
        </div>

        {/* Phase Information Card */}
        <div className="phase-info-card cycle-card">
          <div className="cycle-card-header">
            <div className="icon-wrapper" style={{ background: getPhaseColor(status?.cycle_phase) }}>
              {getPhaseIcon(status?.cycle_phase)}
            </div>
            <h3>Current Phase</h3>
          </div>

          <p className="phase-description">{status?.phase_description}</p>

          <div className="phase-details">
            <div className="detail-item">
              <FaBolt className="detail-icon" />
              <div>
                <span className="detail-label">Energy Level</span>
                <span className="detail-value">{status?.energy_level || "Varies"}</span>
              </div>
            </div>
            <div className="detail-item">
              <FaHeart className="detail-icon" />
              <div>
                <span className="detail-label">Hormones</span>
                <span className="detail-value">{status?.hormone_status || "Balanced"}</span>
              </div>
            </div>
          </div>

          {status?.phase_tips && status.phase_tips.length > 0 && (
            <div className="phase-tips">
              <h4><FaInfoCircle /> Tips for this phase:</h4>
              <ul>
                {status.phase_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Insights Card */}
        {insights && (
          <div className="insights-card cycle-card">
            <div className="cycle-card-header">
              <div className="icon-wrapper">
                <FaHeart />
              </div>
              <h3>Today's Insights</h3>
            </div>

            {insights.phase_summary && (
              <div className="insight-section">
                <p className="insight-summary">{insights.phase_summary}</p>
              </div>
            )}

            {insights.hormone_connection && (
              <div className="hormone-connection">
                <h4>Hormonal Connection</h4>
                <p>{insights.hormone_connection}</p>
              </div>
            )}

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {insights.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleDashboard;

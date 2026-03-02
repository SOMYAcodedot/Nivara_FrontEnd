import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-description">Welcome to NeuroBloom.</p>

      <div className="dashboard-buttons">
        {/* ✅ Button to go to Mood Tracker */}
        <Link to="/mood-tracker">
          <button className="dashboard-btn">📝 Mood Tracking</button>
        </Link>

        {/* ✅ Button to go to AI Chatbot */}
        <Link to="/chat">
          <button className="dashboard-btn">🤖 AI Chatbot</button>
        </Link>

        {/* ✅ Button to go to Stress Relief Activities */}
        <Link to="/stress-relief">
          <button className="dashboard-btn">🎮 Stress Relief Activities</button>
        </Link>

        {/* ✅ Button to go to Therapy Booking */}
        <Link to="/therapy-booking">
          <button className="dashboard-btn">💆 Therapy Booking</button>
        </Link>
        
      </div>
    </div>
  );
};

export default Dashboard;

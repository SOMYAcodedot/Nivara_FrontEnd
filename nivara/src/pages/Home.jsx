import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const features = [
  {
    title: "AI-Powered Chatbot",
    info: "Provides real-time emotional support, actionable insights, and mental health guidance using AI-driven conversations.",
    color: "#FFD700",
    icon: "🤖",
  },
  {
    title: "Personalized Therapy Modules",
    info: "Offers AI-generated Cognitive Behavioral Therapy (CBT) exercises tailored to individual needs.",
    color: "#4CAF50",
    icon: "💆",
  },
  {
    title: "Daily Mood Tracking",
    info: "Helps users monitor their mental state over time with interactive mood logs and trend analysis.",
    color: "#FF4500",
    icon: "📊",
  },
  {
    title: "24/7 Multi-Mode Counseling",
    info: "Connect with professionals via chat, call, or video sessions while maintaining privacy and security.",
    color: "#3498db",
    icon: "📞",
  },
  {
    title: "AI-Driven Assessments",
    info: "Guided mental health evaluations with intelligent feedback and personalized action plans.",
    color: "#9B59B6",
    icon: "📝",
  },
];

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="home-container">
      <h1>Welcome to Your Mental Health Companion</h1>
      <p>
        Empowering mental well-being with AI-driven therapy, personalized
        support, and insightful analytics.
      </p>

      {/* Features Section */}
      <section className="card-container">
        {features.map((feature, index) => (
          <div key={index} className="feature-card" style={{ backgroundColor: feature.color }}>
            <div className="feature-icon" style={{ fontSize: '4rem' }}>{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-info">{feature.info}</p>
          </div>
        ))}
      </section>

      {/* Call-to-Action Button */}
      <button className="login-button" onClick={() => setShowModal(true)}>
        Login to Explore
      </button>

      {/* Modal for Login/Signup Options */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Get Started</h2>
            <p>Choose an option to proceed</p>
            <div className="modal-buttons">
              <Link to="/login" className="modal-btn login-btn">
                Login
              </Link>
              <Link to="/signup" className="modal-btn signup-btn">
                Signup
              </Link>
            </div>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

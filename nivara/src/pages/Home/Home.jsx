import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRobot, FaBrain, FaChartLine, FaHeadset, FaClipboardCheck, FaArrowRight, FaPlay } from "react-icons/fa";
import "./Home.css";

const features = [
  {
    title: "AI-Powered Chatbot",
    info: "Get real-time emotional support and mental health guidance through intelligent AI conversations.",
    color: "#667eea",
    icon: <FaRobot />,
  },
  {
    title: "Personalized Therapy",
    info: "AI-generated CBT exercises and therapy modules tailored to your individual needs.",
    color: "#f093fb",
    icon: <FaBrain />,
  },
  {
    title: "Mood Tracking",
    info: "Monitor your mental state with interactive mood logs and trend analysis.",
    color: "#4CAF50",
    icon: <FaChartLine />,
  },
  {
    title: "24/7 Counseling",
    info: "Connect with professionals via chat, call, or video sessions anytime.",
    color: "#FF6B6B",
    icon: <FaHeadset />,
  },
  {
    title: "Smart Assessments",
    info: "Guided mental health evaluations with personalized action plans.",
    color: "#45B7D1",
    icon: <FaClipboardCheck />,
  },
];

const stats = [
  { number: "10K+", label: "Active Users" },
  { number: "95%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Support Available" },
  { number: "500+", label: "Expert Therapists" },
];

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🧠 AI-Powered Holistic Health Systems for Women</div>
          <h1>Your Journey to <span className="gradient-text">Holistic Health</span> Starts Here</h1>
          <p>
            Nivara combines cutting-edge AI technology with compassionate care to support women's health journey. AI-Driven Holistic Health Systems for Women. Supporting your wellness journey with personalized therapy, mood tracking, and compassionate care.
            Get personalized therapy, mood tracking, and 24/7 support.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">
              Get Started Free <FaArrowRight />
            </Link>
            <button className="btn btn-outline" onClick={() => setShowModal(true)}>
              <FaPlay /> Watch Demo
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-card card-1">
            <FaBrain className="card-icon" />
            <span>AI Therapy</span>
          </div>
          <div className="hero-card card-2">
            <FaChartLine className="card-icon" />
            <span>Mood Tracking</span>
          </div>
          <div className="hero-card card-3">
            <FaHeadset className="card-icon" />
            <span>24/7 Support</span>
          </div>
          <div className="hero-circle"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need for <span className="gradient-text">Mental Wellness</span></h2>
          <p>Comprehensive tools and support to help you thrive</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--accent-color': feature.color }}
            >
              <div className="feature-icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.info}</p>
              <Link to="/signup" className="feature-link">
                Learn More <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Wellness Journey?</h2>
          <p>Join thousands of users who have transformed their mental health with Nivara</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-white">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-outline-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2>Welcome to Nivara</h2>
            <p>Experience the future of mental wellness support</p>
            <div className="modal-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/signup" className="btn btn-outline">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

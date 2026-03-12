import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaRobot, FaGamepad, FaCalendarCheck, FaSmile, FaMeh, FaFrown, FaArrowRight, FaBrain, FaHeart, FaFemale, FaLeaf, FaFileAlt } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const dashboardCards = [
    {
      title: "Mood Tracking",
      description: "Log and analyze your daily moods",
      icon: <FaChartLine />,
      color: "#4CAF50",
      link: "/mood-tracker"
    },
    {
      title: "Cycle Tracking",
      description: "Track your menstrual cycle and wellness",
      icon: <FaFemale />,
      color: "#E91E63",
      link: "/cycle-tracker"
    },
    {
      title: "AI Chatbot",
      description: "Talk to our AI mental health assistant",
      icon: <FaRobot />,
      color: "#667eea",
      link: "/chat"
    },
    {
      title: "Stress Relief",
      description: "Games and activities to relax",
      icon: <FaGamepad />,
      color: "#FF6B6B",
      link: "/stress-relief"
    },
    {
      title: "Doctor Consultation",
      description: "Book consultations with women's health specialists",
      icon: <FaCalendarCheck />,
      color: "#f093fb",
      link: "/doctor-consultation"
    },
    {
      title: "Lifestyle Intelligence",
      description: "Personalized yoga, diet, sleep & emotional tips",
      icon: <FaLeaf />,
      color: "#26a69a",
      link: "/lifestyle-intelligence"
    }
  ];

  const moodOptions = [
    { icon: <FaSmile />, label: "Happy", color: "#4CAF50" },
    { icon: <FaMeh />, label: "Neutral", color: "#FFC107" },
    { icon: <FaFrown />, label: "Sad", color: "#FF6B6B" }
  ];

  const wellnessTips = [
    "Take a 5-minute breathing break",
    "Stay hydrated throughout the day",
    "Practice gratitude - write 3 things you're thankful for",
    "Take a short walk outside",
    "Reach out to a friend or family member"
  ];

  const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="dashboard-header">
        <div className="welcome-content">
          <h1>{greeting}, {user?.username || "User"} 👋</h1>
          <p>Welcome to your mental wellness dashboard. How are you feeling today?</p>
        </div>
        <div className="quick-mood">
          <span>Quick Mood Check:</span>
          <div className="mood-buttons">
            {moodOptions.map((mood, index) => (
              <button 
                key={index} 
                className="mood-btn"
                style={{ '--mood-color': mood.color }}
              >
                {mood.icon}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Wellness Tip card - left: tip, right: AI Health Report */}
      <section className="wellness-tip">
        <div className="wellness-tip-left">
          <div className="tip-icon">
            <FaHeart />
          </div>
          <div className="tip-content">
            <h4>Daily Wellness Tip</h4>
            <p>{randomTip}</p>
          </div>
        </div>
        <Link to="/health-report" className="wellness-tip-right" title="Open AI Health Report">
          <div className="tip-right-icon">
            <FaFileAlt />
          </div>
          <div className="tip-right-text">
            <span className="tip-right-title">AI Health Report</span>
            <span className="tip-right-desc">Generate & download your wellness report</span>
          </div>
          <FaArrowRight className="tip-right-arrow" />
        </Link>
      </section>

      {/* Main Cards Grid */}
      <section className="dashboard-grid">
        {dashboardCards.map((card, index) => (
          <Link 
            to={card.link} 
            key={index} 
            className="dashboard-card"
            style={{ '--card-color': card.color }}
          >
            <div className="card-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <div className="card-arrow">
              <FaArrowRight />
            </div>
          </Link>
        ))}
      </section>

      {/* Stats Section */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <FaBrain className="stat-icon" />
          <div className="stat-info">
            <h3>7</h3>
            <p>Day Streak</p>
          </div>
        </div>
        <div className="stat-card">
          <FaSmile className="stat-icon" />
          <div className="stat-info">
            <h3>85%</h3>
            <p>Positive Moods</p>
          </div>
        </div>
        <div className="stat-card">
          <FaCalendarCheck className="stat-icon" />
          <div className="stat-info">
            <h3>12</h3>
            <p>Sessions Completed</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

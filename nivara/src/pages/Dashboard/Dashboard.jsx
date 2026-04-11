import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChartLine, FaRobot, FaGamepad, FaCalendarCheck,
  FaSmile, FaMeh, FaFrown, FaArrowRight, FaHeart,
  FaFemale, FaLeaf, FaFileAlt,
} from "react-icons/fa";
import NivaraButterflyMark from "../../components/NivaraButterflyMark/NivaraButterflyMark";
import AnimatedStatNumber from "../../components/AnimatedStatNumber";
import "./Dashboard.css";
import { ensureMinElapsed, MIN_AWARE_LOADING_MS } from "../../utils/minLoadingDelay";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [healthReportNavLoading, setHealthReportNavLoading] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const cardsRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const cardsObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCardsVisible(true); },
      { threshold: 0.05 }
    );
    const statsObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );

    if (cardsRef.current) cardsObs.observe(cardsRef.current);
    if (statsRef.current) statsObs.observe(statsRef.current);

    return () => { cardsObs.disconnect(); statsObs.disconnect(); };
  }, []);

  const openHealthReport = useCallback(async () => {
    if (healthReportNavLoading) return;
    setHealthReportNavLoading(true);
    const started = Date.now();
    await ensureMinElapsed(started, MIN_AWARE_LOADING_MS);
    navigate("/health-report", { state: { fromHealthReportBanner: true } });
  }, [healthReportNavLoading, navigate]);

  const dashboardCards = [
    { title: "Mood Tracking",       description: "Log and analyze your daily moods",                       icon: <FaChartLine />,    color: "#4CAF50", gradient: "linear-gradient(135deg,#43a047,#66bb6a)", link: "/mood-tracker" },
    { title: "Cycle Tracking",      description: "Track your menstrual cycle and wellness",               icon: <FaFemale />,       color: "#E91E63", gradient: "linear-gradient(135deg,#e91e63,#f06292)", link: "/cycle-tracker" },
    { title: "AI Chatbot",          description: "Talk to our AI mental health assistant",                icon: <FaRobot />,        color: "#667eea", gradient: "linear-gradient(135deg,#667eea,#764ba2)", link: "/chat", pulse: true },
    { title: "Stress Relief",       description: "Games and activities to relax",                         icon: <FaGamepad />,      color: "#FF6B6B", gradient: "linear-gradient(135deg,#ff6b6b,#ff8e53)", link: "/stress-relief" },
    { title: "Doctor Consultation", description: "Book consultations with women's health specialists",    icon: <FaCalendarCheck />, color: "#f093fb", gradient: "linear-gradient(135deg,#f093fb,#f5576c)", link: "/doctor-consultation" },
    { title: "Lifestyle Intelligence", description: "Personalized yoga, diet, sleep & emotional tips",   icon: <FaLeaf />,         color: "#26a69a", gradient: "linear-gradient(135deg,#26a69a,#42b3d5)", link: "/lifestyle-intelligence" },
  ];

  const moodOptions = [
    { icon: <FaSmile />,  label: "Happy",   color: "#4CAF50" },
    { icon: <FaMeh />,    label: "Neutral", color: "#FFC107" },
    { icon: <FaFrown />,  label: "Sad",     color: "#FF6B6B" },
  ];

  const wellnessTips = [
    "Take a 5-minute breathing break",
    "Stay hydrated throughout the day",
    "Practice gratitude — write 3 things you're thankful for",
    "Take a short walk outside",
    "Reach out to a friend or family member",
  ];
  const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];

  const stats = [
    { icon: <NivaraButterflyMark className="stat-butterfly" decorative />, value: "7",   label: "Day Streak",           gradient: "linear-gradient(135deg,#667eea,#764ba2)", progress: 70 },
    { icon: <FaSmile />,                                                    value: "85%", label: "Positive Moods",       gradient: "linear-gradient(135deg,#f093fb,#f5576c)", progress: 85 },
    { icon: <FaCalendarCheck />,                                            value: "12",  label: "Sessions Completed",   gradient: "linear-gradient(135deg,#26a69a,#42b3d5)", progress: 60 },
  ];

  return (
    <div className="dashboard">
      {healthReportNavLoading && createPortal(
        <div className="dashboard-health-report-loader-overlay" aria-busy="true" aria-live="polite">
          <div className="dashboard-health-report-loader-inner">
            <div className="dashboard-health-report-loader-spinner" />
            <p className="dashboard-health-report-loader-title">Preparing your health report</p>
            <p className="dashboard-health-report-loader-sub">
              Compiling mood, stress, cycle, and lifestyle signals into your summary…
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Ambient background blobs */}
      <div className="db-blob db-blob-1" aria-hidden="true" />
      <div className="db-blob db-blob-2" aria-hidden="true" />
      <div className="db-blob db-blob-3" aria-hidden="true" />

      {/* Welcome Section */}
      <section className="dashboard-header">
        <div className="welcome-content">
          <h1>
            {greeting}, <span className="welcome-name">{user?.username || "User"}</span> 👋
          </h1>
          <p>Welcome to your mental wellness dashboard. How are you feeling today?</p>
        </div>
        <div className="quick-mood">
          <span>Quick Mood Check:</span>
          <div className="mood-buttons">
            {moodOptions.map((mood, i) => (
              <button
                key={i}
                className="mood-btn"
                style={{ "--mood-color": mood.color }}
                aria-label={mood.label}
              >
                {mood.icon}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Wellness Tip */}
      <section className="wellness-tip">
        <div className="wellness-tip-left">
          <div className="tip-icon"><FaHeart /></div>
          <div className="tip-content">
            <h4>Daily Wellness Tip</h4>
            <p>{randomTip}</p>
          </div>
        </div>
        <button
          type="button"
          className="wellness-tip-right"
          title="Open AI Health Report"
          onClick={openHealthReport}
          disabled={healthReportNavLoading}
        >
          <div className="tip-right-icon"><FaFileAlt /></div>
          <div className="tip-right-text">
            <span className="tip-right-title">AI Health Report</span>
            <span className="tip-right-desc">Generate & download your wellness report</span>
          </div>
          <FaArrowRight className="tip-right-arrow" />
        </button>
      </section>

      {/* Main Cards Grid */}
      <section
        ref={cardsRef}
        className={`dashboard-grid${cardsVisible ? " cards-visible" : ""}`}
      >
        {dashboardCards.map((card, index) => (
          <Link
            to={card.link}
            key={index}
            className={`dashboard-card${card.pulse ? " card-pulse" : ""}`}
            style={{
              "--card-color": card.color,
              "--card-gradient": card.gradient,
              "--card-index": index,
            }}
          >
            <div className="card-icon" style={{ background: card.gradient }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <div className="card-arrow"><FaArrowRight /></div>
          </Link>
        ))}
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className={`dashboard-stats${statsVisible ? " stats-visible" : ""}`}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              "--stat-gradient": stat.gradient,
              "--stat-progress": `${stat.progress}%`,
              "--stat-index": index,
            }}
          >
            <div className="stat-icon-wrap">
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-info">
              <h3><AnimatedStatNumber value={stat.value} duration={1800} /></h3>
              <p>{stat.label}</p>
              <div className="stat-progress-bar" aria-hidden="true">
                <div className="stat-progress-fill" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;

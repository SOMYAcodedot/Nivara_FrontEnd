import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FaRobot, FaChartLine, FaHeadset, FaClipboardCheck, FaArrowRight, FaPlay } from "react-icons/fa";
import NivaraButterflyMark from "../../components/NivaraButterflyMark/NivaraButterflyMark";
import AnimatedStatNumber from "../../components/AnimatedStatNumber";
import Carousel from "../../components/Carousel/Carousel";
import HeroOrbit from "./components/HeroOrbit";
import { isAuthenticated } from "../../auth";
import "./Home.css";

const features = [
  {
    title: "AI-Powered Chatbot",
    info: "Get real-time emotional support and mental health guidance through intelligent AI conversations.",
    color: "#667eea",
    icon: <FaRobot />,
    route: "/chat",
  },
  {
    title: "Personalized Therapy",
    info: "AI-generated CBT exercises and therapy modules tailored to your individual needs.",
    color: "#f093fb",
    icon: <NivaraButterflyMark variant="mono" decorative />,
    route: "/lifestyle-intelligence",
  },
  {
    title: "Mood Tracking",
    info: "Monitor your mental state with interactive mood logs and trend analysis.",
    color: "#4CAF50",
    icon: <FaChartLine />,
    route: "/mood-tracker",
  },
  {
    title: "24/7 Counseling",
    info: "Connect with professionals via chat, call, or video sessions anytime.",
    color: "#FF6B6B",
    icon: <FaHeadset />,
    route: "/doctor-consultation",
  },
  {
    title: "Smart Assessments",
    info: "Guided mental health evaluations with personalized action plans.",
    color: "#45B7D1",
    icon: <FaClipboardCheck />,
    route: "/health-report",
  },
];

const stats = [
  { number: "95%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Support Available" },
  { number: "10+", label: "Expert Therapists" },
];

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const reduceMotion = useReducedMotion();

  const heroContainerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.09,
          delayChildren: reduceMotion ? 0 : 0.05,
        },
      },
    }),
    [reduceMotion]
  );

  const heroItemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 22 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] },
      },
    }),
    [reduceMotion]
  );

  /** Opacity-only so CSS `heroBadgeFloat` can animate `transform` without fighting Framer. */
  const heroBadgeVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: reduceMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] },
      },
    }),
    [reduceMotion]
  );

  const heroVisualProps = reduceMotion
    ? { className: "hero-visual-wrap" }
    : {
        className: "hero-visual-wrap",
        initial: { opacity: 0, scale: 0.9, filter: "blur(12px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        transition: { duration: 0.92, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={heroBadgeVariants} className="hero-badge">
            <NivaraButterflyMark className="hero-badge-icon" decorative />
            <span>AI-Powered Holistic Health Systems for Women</span>
          </motion.div>
          <motion.h1 variants={heroItemVariants}>
            Your Journey to <span className="gradient-text">Holistic Health</span> Starts Here
          </motion.h1>
          <motion.p variants={heroItemVariants}>
            Nivara combines cutting-edge AI technology with compassionate care to support women's health journey. AI-Driven Holistic Health Systems for Women. Supporting your wellness journey with personalized therapy, mood tracking, and compassionate care.
            Get personalized therapy, mood tracking, and 24/7 support.
          </motion.p>
          <motion.div variants={heroItemVariants} className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">
              Get Started Free <FaArrowRight />
            </Link>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(true)}>
              <FaPlay /> Watch Demo
            </button>
          </motion.div>
        </motion.div>
        <motion.div {...heroVisualProps}>
          <HeroOrbit />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <h3>
                <AnimatedStatNumber value={stat.number} />
              </h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carousel Section */}
      <Carousel />

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
              <Link to={isAuthenticated() ? feature.route : "/signup"} className="feature-link">
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

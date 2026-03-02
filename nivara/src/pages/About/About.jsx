import React from "react";
import { FaBrain, FaRobot, FaSmile, FaHandsHelping, FaShieldAlt, FaUsers, FaLightbulb, FaHeart } from "react-icons/fa";
import "./About.css";

const About = () => {
  const features = [
    {
      icon: <FaRobot />,
      title: "AI-Powered Therapy",
      description: "Chat with our AI therapist for instant support, guided exercises, and mental health insights."
    },
    {
      icon: <FaBrain />,
      title: "Cognitive Behavioral Therapy",
      description: "Use CBT techniques to reframe negative thoughts and build positive mental habits."
    },
    {
      icon: <FaSmile />,
      title: "Daily Mood Tracking",
      description: "Track your daily emotions and gain insights to improve your emotional well-being."
    },
    {
      icon: <FaHandsHelping />,
      title: "Support Groups",
      description: "Join community sessions, talk to counselors, and get help from women's health professionals."
    }
  ];

  const values = [
    {
      icon: <FaShieldAlt />,
      title: "Privacy First",
      description: "Your women's health data is always secure and confidential."
    },
    {
      icon: <FaUsers />,
      title: "Community Driven",
      description: "Built with input from women's health professionals and users."
    },
    {
      icon: <FaLightbulb />,
      title: "Evidence-Based",
      description: "Our approaches are grounded in scientific research."
    },
    {
      icon: <FaHeart />,
      title: "Compassionate Care",
      description: "We believe in treating everyone with empathy and understanding."
    }
  ];

  const team = [
    { name: "Dr. Somya", role: "Chief Medical Officer", avatar: "👩‍⚕️" },
    { name: "Prajwal", role: "AI Lead", avatar: "👨‍💻" },
    { name: "Dr. Aparna", role: "Clinical Psychologist", avatar: "👩‍🔬" },
    { name: "Ganesh", role: "Product Designer", avatar: "👨‍🎨" }
  ];

  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About <span className="gradient-text">Nivara</span></h1>
          <p>
            Nivara combines cutting-edge AI technology with compassionate care to support women's health journey. AI-Driven Holistic Health Systems for Women. Supporting your wellness journey with personalized therapy, mood tracking, and compassionate care. Get personalized therapy, mood tracking, and 24/7 support.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              We believe everyone deserves access to quality women's health support. 
              Nivara combines cutting-edge AI technology with evidence-based therapeutic 
              approaches to create a safe, supportive environment for holistic health.
            </p>
            <p>
              Whether you're dealing with everyday stress or more significant challenges, 
              we're here to help you on your journey to better women's health.
            </p>
          </div>
          <div className="mission-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Users Helped</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Expert Therapists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <h2>What We Offer</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-subtitle">Dedicated professionals committed to your women's health</p>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="member-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of users who have transformed their women's health with Nivara</p>
        <a href="/signup" className="btn btn-white">Get Started Free</a>
      </section>
    </div>
  );
};

export default About;

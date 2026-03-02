import React from 'react';
import '../App.css';
import { FaBrain, FaRobot, FaSmile, FaHandsHelping } from 'react-icons/fa'; 

const About = () => {
  return (
    <div className="about-container">
      <h1>About NeuroBloom</h1>
      <p>
        NeuroBloom is an AI-driven mental health platform designed to provide **personalized therapy, mood tracking, and emotional support**. 
        Our goal is to help individuals manage stress, anxiety, and emotional well-being through **AI-powered assistance and expert-guided therapy**.
      </p>

      <div className="features-section">
        {/* Feature Cards */}
        <div className="card-row">
          
          {/* AI Therapy Feature */}
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <FaRobot className="icon" style={{ fontSize: '4rem', color: '#667eea' }} />
                <h3>AI-Powered Therapy</h3>
              </div>
              <div className="flip-card-back">
                <FaRobot className="icon" />
                <h3>AI-Powered Therapy</h3>
                <p>Chat with our AI therapist for instant support, guided exercises, and mental health insights.</p>
              </div>
            </div>
          </div>

          {/* CBT Feature */}
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <FaBrain className="icon" style={{ fontSize: '4rem', color: '#f093fb' }} />
                <h3>Cognitive Behavioral Therapy</h3>
              </div>
              <div className="flip-card-back">
                <FaBrain className="icon" />
                <h3>Cognitive Behavioral Therapy</h3>
                <p>Use CBT techniques to **reframe negative thoughts** and build positive mental habits.</p>
              </div>
            </div>
          </div>

          {/* Mood Tracking Feature */}
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <FaSmile className="icon" style={{ fontSize: '4rem', color: '#4CAF50' }} />
                <h3>Daily Mood Tracking</h3>
              </div>
              <div className="flip-card-back">
                <FaSmile className="icon" />
                <h3>Daily Mood Tracking</h3>
                <p>Track your daily emotions and gain insights to improve your **emotional well-being**.</p>
              </div>
            </div>
          </div>

          {/* Community Support Feature */}
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <FaHandsHelping className="icon" style={{ fontSize: '4rem', color: '#FF4500' }} />
                <h3>Support Groups</h3>
              </div>
              <div className="flip-card-back">
                <FaHandsHelping className="icon" />
                <h3>Support Groups</h3>
                <p>Join community sessions, **talk to counselors**, and get help from **mental health professionals**.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <p className="closing-statement">
        At **NeuroBloom**, we believe in **empowering mental health** through AI, technology, and **human connection**.  
        Join us in creating a **healthier, happier future** for everyone! 💙
      </p>
    </div>
  );
};

export default About;

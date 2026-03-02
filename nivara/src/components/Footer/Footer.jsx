import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C150,100 350,0 500,50 C650,100 800,0 1000,50 C1200,100 1350,0 1440,50 L1440,100 L0,100 Z" fill="currentColor"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <div className="footer-logo">
            <FaBrain className="logo-icon" />
            <span>Nivara</span>
          </div>
          <p>
            AI-Driven Holistic Health Systems for Women. Supporting your wellness journey with personalized therapy, mood tracking, and compassionate care.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/support">Support</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-contact">
          <h4>Contact Us</h4>
          <ul>
            <li>
              <FaEnvelope />
              <span>support@nivara.com</span>
            </li>
            <li>
              <FaPhone />
              <span>+91 12345 67890</span>
            </li>
            <li>
              <FaMapMarkerAlt />
              <span>Pune, Maharashtra, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Nivara. All rights reserved. Made with ❤️ for women's health and wellness.</p>
      </div>
    </footer>
  );
};

export default Footer;

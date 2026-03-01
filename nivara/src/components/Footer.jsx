import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left Section */}
        <div className="footer-left">
          <h4>Mental Health Companion</h4>
          <p>
            Supporting mental wellness with AI-powered therapy, self-assessments, and personalized care.
          </p>
        </div>

        {/* Center Section */}
        <div className="footer-center">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            {/* <li><Link to="/contact">Contact Us</Link></li> Linked Contact Page */}
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h4>Contact Us</h4>
          <p>Email: support@mentalwellness.com</p>
          <p>Phone: +91 7378570635</p>
          <p><Link to="/contact" className="footer-contact-link">Get in Touch</Link></p> {/* Added Contact Us Link */}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Mental Health Companion. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

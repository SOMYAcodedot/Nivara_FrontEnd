import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import "../App.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log("Form submitted:", formData);
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>We are here to help. Reach out to us for support, inquiries, or feedback.</p>
      
      {submitted ? (
        <div className="submitted-message">
          <FaCheckCircle size={50} color="#4CAF50" />
          <h3>Thank You!</h3>
          <p>Your message has been received. Our team will get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Your Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Let us know how we can assist you..."
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit <FaCheckCircle />
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;

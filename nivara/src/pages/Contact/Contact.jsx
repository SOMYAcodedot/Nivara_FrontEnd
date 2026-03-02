import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: 'Email Us',
      detail: 'support@nivara.com',
      subDetail: 'We reply within 24 hours'
    },
    {
      icon: <FaPhone />,
      title: 'Call Us',
      detail: '+91 12345 67890',
      subDetail: 'Mon-Fri 9AM-6PM IST'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Visit Us',
      detail: 'Department of Technology, University of Pune',
      subDetail: 'Pune, Maharashtra, India'
    }
  ];

  const faqs = [
    {
      question: 'Is Nivara free to use?',
      answer: 'Yes! Basic features are completely free. Premium features are available with our subscription plans.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use end-to-end encryption and never share your personal information with third parties.'
    },
    {
      question: 'Can I talk to a real therapist?',
      answer: 'Yes, Nivara connects you with licensed mental health professionals for video or chat sessions.'
    },
    {
      question: 'How does AI therapy work?',
      answer: 'Our AI uses evidence-based CBT techniques to provide supportive conversations and coping strategies 24/7.'
    }
  ];

  return (
    <div className="contact">
      {/* Hero Section */}
      <section className="contact-hero">
        <h1>Get in <span className="gradient-text">Touch</span></h1>
        <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info">
        <div className="info-cards">
          {contactInfo.map((info, index) => (
            <div key={index} className="info-card">
              <div className="info-icon">{info.icon}</div>
              <h3>{info.title}</h3>
              <p className="info-detail">{info.detail}</p>
              <p className="info-sub">{info.subDetail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="contact-main">
        <div className="contact-content">
          {/* Form */}
          <div className="form-container">
            <h2>Send us a Message</h2>
            {submitted ? (
              <div className="success-message">
                <FaCheckCircle className="success-icon" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-submit">
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div className="faq-container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="map-section">
        <div className="map-placeholder">
          <span>🗺️</span>
          <p>Interactive Map Coming Soon</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;

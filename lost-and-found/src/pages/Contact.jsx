import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import Navbar from "../components/Navbar";
import "../assets/about-contact.css";

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    topic: "lost",
    message: ""
  });

  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        topic: formData.topic,
        message: formData.message,
        to_name: "UMBC Lost & Found",
        title: formData.topic
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_483bu2i',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_5aanyi3',
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'IeLpp7S3HoyNwXsmE'
      );

      setShowPopup(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        topic: "lost",
        message: ""
      });

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError(err.text || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="about-contact-container">
        <div className="contact-left">
          <h1 className="contact-title">Need support?</h1>
          <p className="contact-subtitle">Have questions or need assistance? We're here to help! Fill out the form, and our team will get back to you as soon as possible.</p>
        </div>
        
        <div className="contact-right">
          <form onSubmit={handleSubmit} className="contact-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>FIRST NAME</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                  required
                />
              </div>
              <div className="form-group">
                <label>LAST NAME</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Your last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>

            <div className="form-group">
              <label>SUBJECT</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a subject</option>
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>MESSAGE</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your inquiry in detail..."
                required
              ></textarea>
            </div>

            <button type="submit" className="send-message-button" disabled={sending}>
              {sending ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <div className="popup-icon">✓</div>
              <h3>Submitted Successfully!</h3>
              <p>Thank you for contacting us. We'll get back to you soon.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;

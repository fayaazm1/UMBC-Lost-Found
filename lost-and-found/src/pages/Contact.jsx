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
      // Prepare template parameters
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        topic: formData.topic,
        message: formData.message,
        to_name: "UMBC Lost & Found",
        title: formData.topic // For backward compatibility with your template
      };

      await emailjs.send(
        'service_483bu2i', // Your service ID
        'template_5aanyi3', // Correct template ID
        templateParams,
        'IeLpp7S3HoyNwXsmE' // Your public key
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
      setError("Failed to send message. Please try again.");
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-container">
        <div className="contact-container">
          <div className="contact-content">
            <div className="contact-left">
              <h2>Need support?</h2>
              <p>Fill in the form to get in touch.</p>
            </div>
            
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form" ref={form}>
                {error && <div className="error-message">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                      disabled={sending}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    disabled={sending}
                  />
                </div>

                <div className="form-group">
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    disabled={sending}
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    required
                    disabled={sending}
                  ></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={sending}>
                  {sending ? "Sending..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {showPopup && (
          <div className="popup">
            <p>Message sent successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;

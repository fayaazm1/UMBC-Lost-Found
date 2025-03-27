import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../assets/about-contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    topic: "lost",
    message: ""
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
    setShowPopup(true);
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      topic: "lost",
      message: ""
    });
    // Hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
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
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
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
                  />
                </div>

                <div className="form-group">
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
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
                    placeholder="How can we help?"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </form>
            </div>
          </div>
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
    </div>
  );
};

export default Contact;

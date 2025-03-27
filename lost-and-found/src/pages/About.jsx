import React from "react";
import Navbar from "../components/Navbar";
import umbcLogo from '../assets/images/umbc.png';
import "../assets/about-contact.css";

const About = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-container">
        <div className="about-container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Us</h2>
              <p className="welcome-text">
                Welcome to the UMBC Lost & Found Portal - your go-to platform for reuniting lost belongings with their rightful owners!
              </p>
              
              <p className="description">
                At the University of Maryland, Baltimore County (UMBC), we understand how frustrating it can be to misplace an important item or find something that belongs to someone else. This platform is designed to create a centralized, easy-to-use system for students, faculty, and staff to report and recover lost items efficiently.
              </p>

              <div className="features">
                <h3>Why Use UMBC Lost & Found?</h3>
                <ul>
                  <li>
                    <span className="feature-label">Convenient & Organized</span>
                    <span className="feature-desc">- No more scattered bulletin board posts or unanswered emails</span>
                  </li>
                  <li>
                    <span className="feature-label">Fast & Reliable</span>
                    <span className="feature-desc">- Our system connects lost items with their owners in a structured way</span>
                  </li>
                  <li>
                    <span className="feature-label">Community-Driven</span>
                    <span className="feature-desc">- Together, we can make UMBC a better place by helping one another</span>
                  </li>
                </ul>
              </div>

              <p className="contact-info">
                If you have any questions, feel free to reach out to us by clicking on contact us page.
              </p>
            </div>

            <div className="about-visual">
              <div className="logo-box">
                <img src={umbcLogo} alt="myUMBC Logo" />
              </div>
              <div className="quote-box">
                <p>"Let's work together to keep our campus connected and belongings returned!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

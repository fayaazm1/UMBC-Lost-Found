import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import Navbar from "../components/Navbar";
import "../assets/about-contact.css";

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form.current, 'YOUR_PUBLIC_KEY')
      .then((result) => {
        console.log(result.text);
      }, (error) => {
        console.log(error.text);
      });
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
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" placeholder="Your first name" required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" placeholder="Your last name" required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Your email address" required />
            </div>
            
            <div className="form-group">
              <label>Subject</label>
              <select name="subject" required defaultValue="">
                <option value="" disabled>Select a subject</option>
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Message</label>
              <textarea 
                name="message" 
                placeholder="Please describe your inquiry in detail..." 
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-button">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;

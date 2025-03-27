import React from "react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h3 className="navbar-title">UMBC Lost & Found</h3>
      </div>

      <div className="navbar-center">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/lost">Lost</Link></li>
          <li><Link to="/found">Found</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li className="messages-with-bell">
            <Link to="/messages">Messages</Link>
            <NotificationBell />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

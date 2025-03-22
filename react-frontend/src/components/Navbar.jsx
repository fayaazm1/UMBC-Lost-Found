import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './navbar.css';
import NotificationBell from './NotificationBell';


const CustomNavbar = () => {
  return (
    <Navbar expand="lg" className="navbar-dark" style={{ backgroundColor: "#02577a", padding: "12px 24px", transition: "0.3s ease" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="glow-text fw-bold">
          UMBC Lost & Found
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link text-light">Home</Nav.Link>
            <Nav.Link as={Link} to="/lost" className="nav-link text-light">Lost</Nav.Link>
            <Nav.Link as={Link} to="/found" className="nav-link text-light">Found</Nav.Link>
            <Nav.Link as={Link} to="/profile" className="nav-link text-light">Profile</Nav.Link>
            <Nav.Link as={Link} to="/message" className="nav-link text-light">Messages</Nav.Link>
            <div className="d-flex align-items-center ms-auto">
  <NotificationBell />
</div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;

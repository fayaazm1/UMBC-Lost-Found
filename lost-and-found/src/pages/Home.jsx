// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Decorative elements */}
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>
            <div className="decorative-dot dot-1"></div>
            <div className="decorative-dot dot-2"></div>
            <div className="decorative-dot dot-3"></div>
            <div className="decorative-dot dot-4"></div>

            <div className="home-content">
                <div className="left-section">
                    <h1 className="main-title">LOST & FOUND</h1>
                    <div className="subtitle-container">
                        <p className="subtitle">"Lost Something?</p>
                        <p className="subtitle">Found Something?</p>
                        <p className="subtitle">We've Got You Covered!"</p>
                    </div>
                    <p className="description">
                    Because even lost things deserve a second chance.
                    </p>
                    <button className="post-here-btn" onClick={() => navigate('/post')}>
                        POST HERE
                    </button>
                </div>

                <div className="right-section">
                    <div className="phone-mockup">
                        {/* Phone frame */}
                        <div className="phone-frame">
                            {/* Content inside phone */}
                            <div className="phone-content">
                                <div className="mock-header">
                                    <div className="mock-title">Recent Items</div>
                                    <div className="mock-stats">+12 new today</div>
                                </div>
                                <div className="mock-items">
                                    <div className="mock-item">
                                        <div className="mock-item-dot"></div>
                                        <div className="mock-item-line"></div>
                                    </div>
                                    <div className="mock-item">
                                        <div className="mock-item-dot"></div>
                                        <div className="mock-item-line"></div>
                                    </div>
                                    <div className="mock-item">
                                        <div className="mock-item-dot"></div>
                                        <div className="mock-item-line"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements around phone */}
                        <div className="floating-element elem-1"></div>
                        <div className="floating-element elem-2"></div>
                        <div className="floating-element elem-3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

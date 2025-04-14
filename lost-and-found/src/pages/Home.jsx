// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/home.css';

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, dbUser } = useAuth();

    useEffect(() => {
        const createWelcomeNotification = async () => {
            if (!currentUser?.uid || !dbUser?.display_name) return;

            try {
                // Check if user already has a welcome notification
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${currentUser.uid}/welcome-exists`);
                const { exists } = await response.json();

                if (!exists) {
                    // Create welcome notification if it doesn't exist
                    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: currentUser.uid,
                            title: 'Welcome to UMBC Lost & Found!',
                            message: `Welcome ${dbUser.display_name}! Thank you for being part of our community. Start by exploring lost items or reporting a found item.`,
                            type: 'welcome'
                        })
                    });
                }
            } catch (error) {
                console.error('Error creating welcome notification:', error);
            }
        };

        createWelcomeNotification();
    }, [currentUser?.uid, dbUser?.display_name]);

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

import React, { useState, useEffect } from 'react';
import { FaUniversalAccess, FaFont, FaAdjust, FaVolumeUp, FaTimes } from 'react-icons/fa';
import { useHighContrast, useFontSize } from '../utils/accessibility.jsx';
import { speak } from '../utils/speechSynthesis.jsx';
import '../assets/accessibility.css';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { highContrast, toggleHighContrast } = useHighContrast();
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();
  const [screenReaderActive, setScreenReaderActive] = useState(
    localStorage.getItem('screen-reader-active') === 'true'
  );
  
  // Handle screen reader toggle
  const toggleScreenReader = () => {
    const newState = !screenReaderActive;
    setScreenReaderActive(newState);
    localStorage.setItem('screen-reader-active', newState.toString());
    
    // Announce the change
    if (newState) {
      speak('Screen reader assistance enabled');
    } else {
      speak('Screen reader assistance disabled');
    }
  };
  
  // Apply screen reader on initial load and when toggled
  useEffect(() => {
    if (screenReaderActive) {
      document.body.classList.add('screen-reader-active');
    } else {
      document.body.classList.remove('screen-reader-active');
    }
  }, [screenReaderActive]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen && screenReaderActive) {
      speak('Accessibility options panel opened');
    } else if (screenReaderActive) {
      speak('Accessibility options panel closed');
    }
  };
  
  // Speak when hovering over buttons
  const handleButtonHover = (text) => {
    if (screenReaderActive) {
      speak(text);
    }
  };

  return (
    <>
      <button 
        className="accessibility-toggle" 
        onClick={togglePanel}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        onMouseEnter={() => handleButtonHover('Accessibility settings')}
      >
        <FaUniversalAccess className="accessibility-icon" />
        <span className="accessibility-text">Accessibility</span>
      </button>
      
      {isOpen && (
        <div className="accessibility-panel" role="dialog" aria-label="Accessibility Options">
          <div className="accessibility-header">
            <h2>Accessibility Options</h2>
            <button 
              className="close-panel" 
              onClick={togglePanel}
              aria-label="Close accessibility panel"
              onMouseEnter={() => handleButtonHover('Close accessibility panel')}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="accessibility-options">
            <div className="option">
              <div className="option-label">
                <FaFont /> <span>Text Size</span>
              </div>
              <div className="option-controls">
                <button 
                  onClick={decreaseFontSize} 
                  aria-label="Decrease font size"
                  disabled={fontSize <= 80}
                  onMouseEnter={() => handleButtonHover('Decrease font size')}
                >
                  A-
                </button>
                <button 
                  onClick={resetFontSize} 
                  aria-label="Reset font size"
                  onMouseEnter={() => handleButtonHover('Reset font size')}
                >
                  Reset
                </button>
                <button 
                  onClick={increaseFontSize} 
                  aria-label="Increase font size"
                  disabled={fontSize >= 200}
                  onMouseEnter={() => handleButtonHover('Increase font size')}
                >
                  A+
                </button>
              </div>
            </div>
            
            <div className="option">
              <div className="option-label">
                <FaAdjust /> <span>High Contrast</span>
              </div>
              <div className="option-controls">
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={highContrast} 
                    onChange={toggleHighContrast}
                    aria-label="Toggle high contrast mode"
                    onMouseEnter={() => handleButtonHover('Toggle high contrast mode')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="option">
              <div className="option-label">
                <FaVolumeUp /> <span>Screen Reader Assistance</span>
              </div>
              <div className="option-controls">
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={screenReaderActive} 
                    onChange={toggleScreenReader}
                    aria-label="Enable screen reader assistance"
                    onMouseEnter={() => handleButtonHover('Enable screen reader assistance')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="accessibility-footer">
            <p>These settings help make our site more accessible to users with disabilities.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;

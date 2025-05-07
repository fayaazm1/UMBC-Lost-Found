import React from 'react';

// Utility to speak text using the Web Speech API
export const speak = (text) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error using speech synthesis:', error);
  }
};

// React component to make any element speak its content on hover
export const SpeakableText = ({ children, text, ...props }) => {
  const handleMouseEnter = () => {
    speak(text || (typeof children === 'string' ? children : ''));
  };
  
  return (
    <span 
      onMouseEnter={handleMouseEnter}
      className="speech-enabled"
      data-speech={text || (typeof children === 'string' ? children : '')}
      {...props}
    >
      {children}
    </span>
  );
};

// Component to add a screen reader announcement
export const ScreenReaderAnnouncement = ({ text, priority = 'polite' }) => {
  React.useEffect(() => {
    if (text) {
      speak(text);
    }
  }, [text]);
  
  return (
    <div 
      aria-live={priority} 
      aria-atomic="true" 
      className="sr-only"
    >
      {text}
    </div>
  );
};

// Helper function to add speech to an element
export const addSpeechToElement = (element, text) => {
  if (!element) return;
  
  // Skip if already speech-enabled
  if (element.getAttribute('data-speech-enabled')) return;
  
  // Get text to speak if not provided
  let textToSpeak = text;
  
  if (!textToSpeak) {
    // For buttons and links, use their text content
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      textToSpeak = element.textContent.trim();
    }
    
    // For inputs, use their placeholder or label
    if (element.tagName === 'INPUT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      textToSpeak = label ? label.textContent.trim() : element.placeholder || `${element.type} field`;
    }
    
    // For selects, use their label
    if (element.tagName === 'SELECT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      textToSpeak = label ? label.textContent.trim() : 'Selection dropdown';
    }
  }
  
  // Add aria-label if not present and we have text
  if (!element.getAttribute('aria-label') && textToSpeak) {
    element.setAttribute('aria-label', textToSpeak);
  }
  
  // Add event listener for mouse enter
  element.addEventListener('mouseenter', () => {
    // Only speak if screen reader is active
    if (document.body.classList.contains('screen-reader-active')) {
      speak(element.getAttribute('aria-label') || textToSpeak);
    }
  });
  
  // Mark as speech-enabled
  element.setAttribute('data-speech-enabled', 'true');
  element.classList.add('speech-enabled');
  element.setAttribute('data-speech', element.getAttribute('aria-label') || textToSpeak);
};

// Function to initialize speech on all interactive elements
// This should be called directly, not as a hook
export const initializeSpeech = () => {
  // Get all interactive elements
  const elements = document.querySelectorAll('button, a, input, select, [role="button"]');
  elements.forEach(element => addSpeechToElement(element));
  
  // Set up a mutation observer to handle dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.matches('button, a, input, select, [role="button"]')) {
              addSpeechToElement(node);
            }
            const childElements = node.querySelectorAll('button, a, input, select, [role="button"]');
            childElements.forEach(element => addSpeechToElement(element));
          }
        });
      }
    });
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  return observer; // Return observer so it can be disconnected if needed
};

export default {
  speak,
  SpeakableText,
  ScreenReaderAnnouncement,
  initializeSpeech
};

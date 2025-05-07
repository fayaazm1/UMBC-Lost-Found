// Accessibility configuration and utilities for UMBC Lost & Found
import React from 'react';

// Focus trap for modal dialogs
export const useFocusTrap = (ref) => {
  React.useEffect(() => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = ref.current;
    
    if (!modal) return;
    
    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Close modal logic would go here
      }
    };
    
    modal.addEventListener('keydown', handleTabKey);
    modal.addEventListener('keydown', handleEscapeKey);
    
    // Set focus on first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
    
    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      modal.removeEventListener('keydown', handleEscapeKey);
    };
  }, [ref]);
};

// Skip to content link functionality
export const SkipToContent = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999
      }}
      onFocus={(e) => {
        e.target.style.position = 'fixed';
        e.target.style.left = '10px';
        e.target.style.top = '10px';
        e.target.style.width = 'auto';
        e.target.style.height = 'auto';
      }}
      onBlur={(e) => {
        e.target.style.position = 'absolute';
        e.target.style.left = '-9999px';
        e.target.style.width = '1px';
        e.target.style.height = '1px';
      }}
    >
      Skip to main content
    </a>
  );
};

// Announce dynamic content changes to screen readers
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = React.useState('');
  
  const announce = (message, priority = 'polite') => {
    setAnnouncement({ message, priority });
  };
  
  const Announcer = React.useCallback(() => {
    return (
      <div 
        aria-live={announcement.priority || 'polite'} 
        aria-atomic="true" 
        className="sr-only"
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          padding: '0', 
          margin: '-1px', 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          whiteSpace: 'nowrap', 
          border: '0' 
        }}
      >
        {announcement.message}
      </div>
    );
  }, [announcement]);
  
  return { announce, Announcer };
};

// High contrast theme toggle
export const useHighContrast = () => {
  const [highContrast, setHighContrast] = React.useState(
    localStorage.getItem('high-contrast') === 'true'
  );
  
  React.useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
    }
  }, [highContrast]);
  
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };
  
  return { highContrast, toggleHighContrast };
};

// Font size adjustment
export const useFontSize = () => {
  const [fontSize, setFontSize] = React.useState(
    parseInt(localStorage.getItem('font-size')) || 100
  );
  
  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('font-size', fontSize.toString());
  }, [fontSize]);
  
  const increaseFontSize = () => {
    if (fontSize < 200) {
      setFontSize(fontSize + 10);
    }
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 80) {
      setFontSize(fontSize - 10);
    }
  };
  
  const resetFontSize = () => {
    setFontSize(100);
  };
  
  return { fontSize, increaseFontSize, decreaseFontSize, resetFontSize };
};

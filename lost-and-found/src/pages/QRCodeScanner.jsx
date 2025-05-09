import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// We'll load the Html5QrcodeScanner from a CDN instead of npm package
let Html5QrcodeScanner;

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scanner, setScanner] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const navigate = useNavigate();
  const scannerContainerRef = useRef(null);
  
  // Define styles for the component
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem'
    },
    heading: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem'
    },
    subheading: {
      fontSize: '1.25rem',
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#666'
    },
    errorContainer: {
      padding: '1rem',
      marginBottom: '1.5rem',
      backgroundColor: '#ffebee',
      border: '1px solid #f44336',
      borderRadius: '4px'
    },
    errorText: {
      color: '#d32f2f'
    },
    button: {
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      marginTop: '1rem'
    },
    outlinedButton: {
      backgroundColor: 'transparent',
      color: '#1976d2',
      border: '1px solid #1976d2',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      marginLeft: '0.5rem'
    },
    scannerContainer: {
      padding: '1.5rem',
      marginBottom: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    resultContainer: {
      padding: '1.5rem',
      marginTop: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    resultHeading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    card: {
      marginBottom: '1rem',
      border: '1px solid #eee',
      borderRadius: '4px',
      padding: '1rem'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    infoIcon: {
      marginRight: '0.5rem',
      color: '#1976d2'
    },
    infoLabel: {
      fontWeight: 'bold',
      marginRight: '0.5rem'
    },
    divider: {
      margin: '1rem 0',
      height: '1px',
      backgroundColor: '#eee',
      border: 'none'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    additionalInfo: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    timestamp: {
      fontSize: '0.75rem',
      color: '#666',
      marginTop: '1rem',
      display: 'block'
    },
    actionContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1.5rem'
    }
  };

  // Load the html5-qrcode library from CDN
  useEffect(() => {
    setIsLoading(true);
    
    // Load the html5-qrcode library from CDN
    const loadScanner = async () => {
      try {
        // Check if script is already loaded
        if (!document.getElementById('html5-qrcode-script')) {
          // Create script element
          const script = document.createElement('script');
          script.id = 'html5-qrcode-script';
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
          script.async = true;
          
          // Create a promise to wait for script to load
          const scriptLoadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load QR scanner script'));
          });
          
          // Add script to document
          document.head.appendChild(script);
          
          // Wait for script to load
          await scriptLoadPromise;
        }
        
        // After script is loaded, Html5QrcodeScanner should be available in window
        Html5QrcodeScanner = window.Html5QrcodeScanner;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load QR scanner library:', err);
        setError('Failed to load QR code scanner. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadScanner();
    
    // Cleanup function
    return () => {
      if (scanner && cameraStarted) {
        try {
          scanner.clear();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    };
  }, []);
  
  // Function to handle contacting the owner
  const handleContactOwner = (method, value) => {
    if (method === 'email' && value) {
      window.location.href = `mailto:${value}?subject=Found%20Your%20Item%20-%20UMBC%20Lost%20and%20Found`;
    } else if (method === 'phone' && value) {
      window.location.href = `tel:${value}`;
    }
  };

  // Reset the scanner state and restart scanning
  const resetScanner = () => {
    setScanResult(null);
    setError('');
    
    // Clear the previous scanner if it exists
    if (scanner && cameraStarted) {
      try {
        scanner.clear();
        setCameraStarted(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };
  
  // Start the QR code scanner
  const startScanner = () => {
    if (!Html5QrcodeScanner) {
      setError('QR code scanner library not loaded. Please refresh the page and try again.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Make sure the scanner-container element exists
      if (!document.getElementById('qr-reader')) {
        // Create the element if it doesn't exist
        const scannerDiv = document.createElement('div');
        scannerDiv.id = 'qr-reader';
        scannerDiv.style.width = '100%';
        scannerDiv.style.minHeight = '300px';
        
        // Find the container where we want to append this element
        const container = scannerContainerRef.current;
        if (container) {
          // Clear any existing content
          container.innerHTML = '';
          // Append the new element
          container.appendChild(scannerDiv);
        } else {
          throw new Error('Scanner container reference not found');
        }
      }
      
      // Initialize the scanner
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false // Do not start scanning immediately
      );
      
      // Set callbacks
      qrScanner.render(onScanSuccess, onScanError);
      
      setScanner(qrScanner);
      setCameraStarted(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Error starting QR scanner: ' + err.message);
      setIsLoading(false);
    }
  };
  
  // Handle successful QR code scan
  const onScanSuccess = (decodedText) => {
    try {
      // Try to parse as JSON first
      try {
        const parsedData = JSON.parse(decodedText);
        setScanResult({
          name: parsedData.name,
          email: parsedData.email,
          deviceName: parsedData.deviceName,
          timestamp: parsedData.timestamp,
          isTextFormat: false
        });
      } catch (jsonError) {
        // If not JSON, treat as plain text format
        setScanResult({
          rawText: decodedText,
          isTextFormat: true
        });
      }
      
      // Stop the scanner after successful scan
      if (scanner) {
        try {
          scanner.clear();
          setCameraStarted(false);
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    } catch (error) {
      console.error('Error processing QR code data:', error);
      setError('Error processing QR code data: ' + error.message);
    }
  };
  
  // Handle QR code scanning errors
  const onScanError = (errorMessage) => {
    console.error('QR Scan error:', errorMessage);
    // Don't set error for every scan failure, only for critical errors
    if (typeof errorMessage === 'string' && errorMessage.includes('Camera access denied')) {
      setError('Camera access denied. Please allow camera access to scan QR codes.');
      setHasPermission(false);
    }
  };
  
  // Handle manual QR code data input
  const handleManualInput = (event) => {
    event.preventDefault();
    const inputData = event.target.qrData.value.trim();
    
    if (!inputData) {
      setError('Please enter QR code data');
      return;
    }
    
    try {
      // Try to parse as JSON first
      try {
        const parsedData = JSON.parse(inputData);
        setScanResult({
          name: parsedData.name,
          email: parsedData.email,
          deviceName: parsedData.deviceName,
          timestamp: parsedData.timestamp,
          isTextFormat: false
        });
      } catch (jsonError) {
        // If not JSON, treat as plain text format
        setScanResult({
          rawText: inputData,
          isTextFormat: true
        });
      }
    } catch (error) {
      console.error('Error processing QR code data:', error);
      setError('Error processing QR code data: ' + error.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>QR Code Scanner</h1>
      
      <p style={styles.subheading}>
        Scan a QR code from a lost item to view the owner's contact information.
      </p>

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.button}
            onClick={resetScanner}
          >
            Try Again
          </button>
        </div>
      )}

      {!scanResult ? (
        <div style={styles.scannerContainer}>
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Loading...</h2>
              <p style={{color: '#666', fontSize: '0.875rem'}}>
                Please wait while we initialize the QR code scanner.
              </p>
            </div>
          ) : !cameraStarted && Html5QrcodeScanner ? (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>QR Code Scanner</h2>
              <p style={{color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
                Click the button below to start scanning QR codes with your camera.
              </p>
              
              <div style={{marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem'}}>
                <p style={{marginBottom: '1rem'}}>
                  You will be asked to allow camera access when you start scanning.
                </p>
                <button 
                  style={styles.button}
                  onClick={startScanner}
                >
                  Start Camera & Scan QR Code
                </button>
              </div>
              
              <div style={{marginTop: '1.5rem'}}>
                <button 
                  style={styles.outlinedButton}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : cameraStarted ? (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Scanning QR Code</h2>
              <div ref={scannerContainerRef} style={{width: '100%', minHeight: '300px', marginBottom: '1.5rem'}}></div>
              <p style={{color: '#666', fontSize: '0.875rem', marginBottom: '1rem'}}>
                Point your camera at a QR code to scan it.
              </p>
              <button 
                style={styles.outlinedButton}
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>QR Code Scanner</h2>
              <p style={{color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
                The QR code scanner failed to load. Please try refreshing the page.
              </p>
              
              <div style={{marginTop: '1.5rem'}}>
                <button 
                  style={styles.button}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                <button 
                  style={{...styles.outlinedButton, marginLeft: '0.5rem'}}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.resultContainer}>
          <h2 style={styles.resultHeading}>
            Contact Information
          </h2>
          
          {scanResult.isTextFormat ? (
            // Display text format QR code content
            <div style={styles.card}>
              <div style={{padding: '0.5rem'}}>
                <p style={{whiteSpace: 'pre-line'}}>
                  {scanResult.rawText}
                </p>
              </div>
            </div>
          ) : (
            // Display JSON format QR code content
            <div style={styles.card}>
              <div style={{padding: '0.5rem'}}>
                <div style={styles.infoRow}>
                  <span style={styles.infoIcon}>👤</span>
                  <span style={styles.infoLabel}>Name:</span>
                  <span>{scanResult.name}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoIcon}>📧</span>
                  <span style={styles.infoLabel}>Email:</span>
                  <span>{scanResult.email}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoIcon}>📱</span>
                  <span style={styles.infoLabel}>Device:</span>
                  <span>{scanResult.deviceName}</span>
                </div>
                
                {scanResult.timestamp && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>📅</span>
                    <span style={styles.infoLabel}>Generated:</span>
                    <span style={{color: '#666'}}>{formatDate(scanResult.timestamp)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <hr style={styles.divider} />
          
          {!scanResult.isTextFormat && scanResult.email && (
            <>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                Contact Options
              </h3>
              
              <div style={styles.buttonContainer}>
                <button 
                  style={{...styles.button, width: '100%'}}
                  onClick={() => handleContactOwner('email', scanResult.email)}
                  disabled={!scanResult.email}
                >
                  📧 Email Owner
                </button>
              </div>
            </>
          )}
          
          <div style={styles.actionContainer}>
            <button 
              style={styles.button}
              onClick={resetScanner}
            >
              Scan Another QR Code
            </button>
            <button 
              style={styles.outlinedButton}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null);
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

  // Initialize QR code scanner and handle camera permissions
  useEffect(() => {
    setIsLoading(true);
    
    // Initialize the scanner
    const initializeScanner = async () => {
      try {
        // Check if camera is available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length === 0) {
          setError('No camera found on your device.');
          setIsLoading(false);
          return;
        }
        
        // Initialize the scanner
        if (!scannerRef.current && scannerContainerRef.current) {
          scannerRef.current = new Html5Qrcode('scanner-container');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing scanner:', err);
        setError('Error initializing QR scanner: ' + err.message);
        setIsLoading(false);
      }
    };
    
    initializeScanner();
    
    // Cleanup function
    return () => {
      if (scannerRef.current && cameraStarted) {
        scannerRef.current.stop().catch(err => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
  }, []);
  
  // Function to request camera permission and start scanning
  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      
      // Start the scanner
      await scannerRef.current.start(
        { facingMode: 'environment' },  // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );
      
      setCameraStarted(true);
      setError('');
    } catch (err) {
      console.error('Error starting scanner:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
        setHasPermission(false);
      } else {
        setError('Error starting QR scanner: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful QR code scan
  const onScanSuccess = (decodedText) => {
    try {
      // Try to parse as JSON first (for backward compatibility)
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
      if (scannerRef.current && cameraStarted) {
        scannerRef.current.stop().catch(err => {
          console.error('Error stopping scanner:', err);
        });
        setCameraStarted(false);
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
      setError(errorMessage);
      setHasPermission(false);
    }
  };
  
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
    
    // If scanner was previously started, restart it
    if (scannerRef.current) {
      startScanner();
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
          {hasPermission === false && (
            <p style={{marginTop: '0.5rem', fontSize: '0.875rem'}}>
              You need to allow camera access in your browser settings to scan QR codes.
            </p>
          )}
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
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Loading QR Scanner...</h2>
              <p style={{color: '#666', fontSize: '0.875rem'}}>
                Please wait while we initialize the QR code scanner.
              </p>
            </div>
          ) : !cameraStarted ? (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <div id="scanner-container" ref={scannerContainerRef} style={{width: '100%', height: '300px', marginBottom: '1rem'}}></div>
              <p style={{color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
                Click the button below to start scanning QR codes. You will be asked to allow camera access.
              </p>
              <button 
                style={styles.button}
                onClick={startScanner}
              >
                Start Camera & Scan QR Code
              </button>
              <div style={{marginTop: '1.5rem'}}>
                <button 
                  style={styles.outlinedButton}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <div id="scanner-container" style={{width: '100%', height: '300px', marginBottom: '1rem'}}></div>
              <p style={{color: '#666', fontSize: '0.875rem'}}>
                Point your camera at a QR code to scan it.
              </p>
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

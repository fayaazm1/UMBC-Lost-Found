import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create a fallback scanner component in case the library fails to load
const FallbackScanner = ({ onScan }) => {
  const styles = {
    container: {
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      textAlign: 'center',
      backgroundColor: '#f8f8f8',
      maxWidth: '600px',
      margin: '0 auto'
    },
    heading: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    paragraph: {
      fontSize: '0.875rem',
      color: '#666',
      marginBottom: '1.5rem'
    },
    button: {
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.875rem'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>QR Scanner Unavailable</h2>
      <p style={styles.paragraph}>
        The QR code scanner could not be loaded. Please try again later or use a different browser.
      </p>
      <button 
        style={styles.button}
        onClick={() => window.location.reload()}
      >
        Retry Loading Scanner
      </button>
    </div>
  );
};

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState(null);
  const [Html5QrcodeScanner, setHtml5QrcodeScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
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

  // Dynamically import the Html5QrcodeScanner library
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const html5QrModule = await import('html5-qrcode')
          .catch(() => ({ Html5QrcodeScanner: null }));
        
        setHtml5QrcodeScanner(() => html5QrModule.Html5QrcodeScanner);
      } catch (error) {
        console.error('Failed to load Html5QrcodeScanner:', error);
        setError('Failed to load QR code scanner. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDependencies();
  }, []);

  useEffect(() => {
    // Initialize the scanner when Html5QrcodeScanner is loaded
    if (Html5QrcodeScanner && !scanner && !scanResult) {
      try {
        const qrScanner = new Html5QrcodeScanner('reader', {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: true,
        });

        setScanner(qrScanner);
      } catch (error) {
        console.error('Error initializing scanner:', error);
        setError('Failed to initialize QR code scanner. Please try again later.');
      }
    }
  }, [Html5QrcodeScanner, scanner, scanResult]);

  useEffect(() => {
    // Start the scanner after it's initialized and when no result is present
    if (scanner && !scanResult) {
      scanner.render(onScanSuccess, onScanError);
    }
  }, [scanner, scanResult]);

  // Cleanup function to stop scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }
      }
    };
  }, [scanner]);

  const onScanSuccess = (decodedText) => {
    try {
      // First try to parse as JSON for backward compatibility
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
        console.log('Not JSON format, treating as text');
        setScanResult({
          rawText: decodedText,
          isTextFormat: true
        });
      }
      
      // Stop the scanner after successful scan
      if (scanner) {
        scanner.clear();
      }
    } catch (error) {
      setError('Error processing QR code data.');
      console.error('Error processing QR code data:', error);
    }
  };

  const onScanError = (err) => {
    console.warn(`QR Code scan error: ${err}`);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    
    // Re-initialize the scanner
    if (scanner) {
      scanner.render(onScanSuccess, onScanError);
    }
  };

  const handleContactOwner = (method, value) => {
    if (method === 'email' && value) {
      window.location.href = `mailto:${value}?subject=Found%20Your%20Item%20-%20UMBC%20Lost%20and%20Found`;
    } else if (method === 'phone' && value) {
      window.location.href = `tel:${value}`;
    }
  };

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
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Loading QR Scanner...</h2>
              <p style={{color: '#666', fontSize: '0.875rem'}}>
                Please wait while we initialize the QR code scanner.
              </p>
            </div>
          ) : Html5QrcodeScanner ? (
            <div id="reader" style={{ width: '100%' }}></div>
          ) : (
            <FallbackScanner />
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
            // Display JSON format QR code content (backward compatibility)
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
                
                <div style={styles.infoRow}>
                  <span style={styles.infoIcon}>📅</span>
                  <span style={styles.infoLabel}>Generated:</span>
                  <span style={{color: '#666'}}>{formatDate(scanResult.timestamp)}</span>
                </div>
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
          
          {scanResult.additionalInfo && (
            <>
              <hr style={styles.divider} />
              <div style={styles.additionalInfo}>
                <span style={{...styles.infoIcon, marginTop: '0.25rem'}}>ℹ️</span>
                <p>
                  {scanResult.additionalInfo}
                </p>
              </div>
            </>
          )}
          
          {scanResult.timestamp && !scanResult.isTextFormat && (
            <span style={styles.timestamp}>
              QR Code generated on: {formatDate(scanResult.timestamp)}
            </span>
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

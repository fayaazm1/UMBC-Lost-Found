import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
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

  // Set loading state with a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to handle contacting the owner
  const handleContactOwner = (method, value) => {
    if (method === 'email' && value) {
      window.location.href = `mailto:${value}?subject=Found%20Your%20Item%20-%20UMBC%20Lost%20and%20Found`;
    } else if (method === 'phone' && value) {
      window.location.href = `tel:${value}`;
    }
  };

  // Reset the scanner state
  const resetScanner = () => {
    setScanResult(null);
    setError('');
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
                Please wait while we initialize.
              </p>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <div style={{marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>QR Code Scanner</h2>
                <p style={{color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
                  You can either use your device's camera app to scan a QR code, or manually enter the QR code data below.
                </p>
                
                <div style={{marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem'}}>
                  <h3 style={{fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem'}}>Option 1: Use your device camera</h3>
                  <ol style={{textAlign: 'left', paddingLeft: '2rem'}}>
                    <li style={{marginBottom: '0.5rem'}}>Open your device's camera app</li>
                    <li style={{marginBottom: '0.5rem'}}>Point it at a QR code from a lost item</li>
                    <li style={{marginBottom: '0.5rem'}}>Tap the notification that appears</li>
                    <li style={{marginBottom: '0.5rem'}}>Contact the owner using the provided information</li>
                  </ol>
                </div>
                
                <div style={{marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem'}}>
                  <h3 style={{fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem'}}>Option 2: Enter QR code data manually</h3>
                  <form onSubmit={handleManualInput}>
                    <textarea 
                      name="qrData"
                      placeholder="Paste QR code data here..."
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginBottom: '1rem'
                      }}
                    />
                    <button 
                      type="submit"
                      style={styles.button}
                    >
                      Process QR Data
                    </button>
                  </form>
                </div>
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

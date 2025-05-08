import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Box, Card, CardContent, Divider, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';

// Create a fallback scanner component in case the library fails to load
const FallbackScanner = ({ onScan }) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      textAlign: 'center',
      backgroundColor: '#f8f8f8'
    }}>
      <Typography variant="h6" gutterBottom>QR Scanner Unavailable</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        The QR code scanner could not be loaded. Please try again later or use a different browser.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => window.location.reload()}
      >
        Retry Loading Scanner
      </Button>
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        QR Code Scanner
      </Typography>
      
      <Typography variant="body1" paragraph align="center">
        Scan a QR code from a lost item to view the owner's contact information.
      </Typography>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={resetScanner}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      )}

      {!scanResult ? (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Loading QR Scanner...</Typography>
              <Typography variant="body2" color="textSecondary">
                Please wait while we initialize the QR code scanner.
              </Typography>
            </Box>
          ) : Html5QrcodeScanner ? (
            <div id="reader" style={{ width: '100%' }}></div>
          ) : (
            <FallbackScanner />
          )}
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Contact Information
          </Typography>
          
          {scanResult.isTextFormat ? (
            // Display text format QR code content
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  {scanResult.rawText}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            // Display JSON format QR code content (backward compatibility)
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" component="div">
                    <strong>Name:</strong> {scanResult.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" component="div">
                    <strong>Email:</strong> {scanResult.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" component="div">
                    <strong>Device:</strong> {scanResult.deviceName}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Generated:</strong> {formatDate(scanResult.timestamp)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {!scanResult.isTextFormat && scanResult.email && (
            <>
              <Typography variant="h6" component="h3" gutterBottom>
                Contact Options
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<EmailIcon />}
                  onClick={() => handleContactOwner('email', scanResult.email)}
                  disabled={!scanResult.email}
                  fullWidth
                >
                  Email Owner
                </Button>
              </Box>
            </>
          )}
          
          {scanResult.additionalInfo && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <InfoIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                <Typography variant="body1">
                  {scanResult.additionalInfo}
                </Typography>
              </Box>
            </>
          )}
          
          {scanResult.timestamp && !scanResult.isTextFormat && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
              QR Code generated on: {formatDate(scanResult.timestamp)}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={resetScanner}
              sx={{ mr: 2 }}
            >
              Scan Another QR Code
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/found')}
            >
              Report Found Item
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default QRCodeScanner;

import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Container, Typography, Paper, Button, Box, Card, CardContent, Divider, Link } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize the scanner when component mounts
    const qrScanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
    });

    setScanner(qrScanner);

    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Start the scanner after it's initialized and when no result is present
    if (scanner && !scanResult) {
      scanner.render(onScanSuccess, onScanError);
    }
  }, [scanner, scanResult]);

  const onScanSuccess = (decodedText) => {
    try {
      // Try to parse the QR code content as JSON
      const parsedData = JSON.parse(decodedText);
      setScanResult(parsedData);
      
      // Stop the scanner after successful scan
      if (scanner) {
        scanner.clear();
      }
    } catch (error) {
      setError('Invalid QR code format. Expected JSON data.');
      console.error('Error parsing QR code data:', error);
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
          <div id="reader" style={{ width: '100%' }}></div>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Owner Information
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  {scanResult.name || 'Name not provided'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {scanResult.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {scanResult.email}
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={() => handleContactOwner('email', scanResult.email)}
                      sx={{ ml: 2 }}
                    >
                      Send Email
                    </Button>
                  </Typography>
                </Box>
              )}
              
              {scanResult.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {scanResult.phone}
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={() => handleContactOwner('phone', scanResult.phone)}
                      sx={{ ml: 2 }}
                    >
                      Call
                    </Button>
                  </Typography>
                </Box>
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
              
              {scanResult.timestamp && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                  QR Code generated on: {formatDate(scanResult.timestamp)}
                </Typography>
              )}
            </CardContent>
          </Card>
          
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

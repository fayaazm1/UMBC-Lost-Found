import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { Container, Typography, TextField, Button, Paper, Grid, Box, FormControlLabel, Checkbox } from '@mui/material';
import { useReactToPrint } from 'react-to-print';

const QRCodeGenerator = () => {
  const { currentUser } = useAuth();
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: currentUser?.email || '',
    phone: '',
    additionalInfo: '',
    includeEmail: true,
    includePhone: true
  });
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrCodeRef = useRef();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate QR code data as JSON string
  const generateQRData = () => {
    const qrData = {
      name: contactInfo.name,
      email: contactInfo.includeEmail ? contactInfo.email : '',
      phone: contactInfo.includePhone ? contactInfo.phone : '',
      additionalInfo: contactInfo.additionalInfo,
      appUrl: window.location.origin,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  // Handle QR code generation
  const handleGenerateQR = () => {
    if (!contactInfo.name) {
      alert('Please enter your name');
      return;
    }
    setQrGenerated(true);
  };

  // Handle printing the QR code
  const handlePrint = useReactToPrint({
    content: () => qrCodeRef.current,
    documentTitle: 'UMBC Lost & Found - Contact QR Code',
    onAfterPrint: () => console.log('QR code printed successfully')
  });

  // Reset the form
  const handleReset = () => {
    setContactInfo({
      name: '',
      email: currentUser?.email || '',
      phone: '',
      additionalInfo: '',
      includeEmail: true,
      includePhone: true
    });
    setQrGenerated(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Contact QR Code Generator
      </Typography>
      
      <Typography variant="body1" paragraph align="center">
        Generate a QR code with your contact information that you can attach to your valuable items.
        If someone finds your lost item, they can scan the QR code to get your contact details.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Your Name"
              name="name"
              value={contactInfo.name}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={contactInfo.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              disabled={!contactInfo.includeEmail}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={contactInfo.includeEmail}
                  onChange={handleChange}
                  name="includeEmail"
                />
              }
              label="Include email in QR code"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={contactInfo.phone}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              disabled={!contactInfo.includePhone}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={contactInfo.includePhone}
                  onChange={handleChange}
                  name="includePhone"
                />
              }
              label="Include phone in QR code"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Information"
              name="additionalInfo"
              value={contactInfo.additionalInfo}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
              placeholder="Add any additional information you want to include (e.g., reward offered)"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGenerateQR}
              sx={{ mr: 2 }}
              disabled={!contactInfo.name}
            >
              Generate QR Code
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleReset}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {qrGenerated && (
        <Paper 
          elevation={3} 
          sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          ref={qrCodeRef}
        >
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Your Contact QR Code
          </Typography>
          
          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 1, mb: 3 }}>
            <QRCode 
              value={generateQRData()} 
              size={256}
              level="H"
            />
          </Box>
          
          <Typography variant="body1" paragraph align="center">
            Print this QR code and attach it to your valuable items.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handlePrint}
              sx={{ mr: 2 }}
            >
              Print QR Code
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                const qrData = generateQRData();
                const blob = new Blob([qrData], { type: 'application/json' });
                const href = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.download = "contact-info.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download Data
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default QRCodeGenerator;

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import the CSS with an absolute path to avoid build issues
import '/src/assets/qrcode.css';

// Simple QR code component that doesn't rely on external libraries
const SimpleQRCode = ({ value, size = 256, ...props }) => {
  // Create a text representation of the QR code data
  const displayValue = value.substring(0, 100) + (value.length > 100 ? '...' : '');
  
  return (
    <div 
      className="simple-qr-code"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: '#f5f5f5', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      {...props}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Contact Information</div>
      <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{displayValue}</div>
    </div>
  );
};

const QRCodeGenerator = () => {
  const { currentUser } = useAuth();
  const [deviceName, setDeviceName] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrCodeRef = useRef(null);
  
  // Basic user info
  const contactInfo = {
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    deviceName: deviceName
  };

  // Generate QR code data as a simple text message
  const generateQRData = () => {
    // Format date in a readable way
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a simple formatted text message
    const textMessage = 
`UMBC LOST & FOUND

This ${deviceName} belongs to:
Name: ${contactInfo.name}
Email: ${contactInfo.email}

If found, please either:
1. Contact the owner via email, or
2. Hand over the item to the UMBC Lost & Found department located in The Commons building (1st floor).

Thank you for helping return this lost item!

Generated: ${formattedDate}`;
    
    return textMessage;
  };

  // Handle generating QR code
  const handleGenerateQR = () => {
    if (deviceName.trim()) {
      setQrGenerated(true);
    }
  };

  // Reset the form
  const handleReset = () => {
    setDeviceName('');
    setQrGenerated(false);
  };

  return (
    <div className="qr-container">
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      <div className="decorative-dot dot-1"></div>
      <div className="decorative-dot dot-2"></div>
      <div className="decorative-dot dot-3"></div>
      
      <div className="qr-content">
        <div className="qr-header">
          <h1>📱 Generate Your QR Code</h1>
          <p className="qr-subtitle">
            Create a QR code for your devices to help return them if lost
          </p>
        </div>

      {!qrGenerated && (
        <div className="qr-form-container">
          <div className="qr-profile-info">
            <h3>Your Profile Information</h3>
            <div className="profile-detail">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{contactInfo.name}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{contactInfo.email || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="qr-input-group">
            <label htmlFor="deviceName">
              Device Name
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., MacBook Pro, iPhone 15, AirPods"
              className="qr-input"
            />
            <small className="input-helper">
              Enter the name of your device
            </small>
          </div>
          
          <button 
            onClick={handleGenerateQR}
            disabled={!deviceName.trim()}
            className={`qr-button ${!deviceName.trim() ? 'disabled' : ''}`}
          >
            Create QR Code
          </button>
        </div>
      )}

      {qrGenerated && (
        <div className="qr-result-container">
          <h2 className="qr-result-title">
            QR Code for {deviceName}
          </h2>
          
          <div className="qr-code-display" ref={qrCodeRef}>
            <SimpleQRCode 
              value={generateQRData()} 
              size={250}
              className="qr-code"
            />
          </div>
          
          <div className="qr-info-summary">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{contactInfo.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{contactInfo.email || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Device:</span>
              <span className="info-value">{deviceName}</span>
            </div>
          </div>
          
          <div className="qr-actions">
            <button
              onClick={() => {
                // Simple print approach that doesn't rely on html2canvas
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Print QR Code - ${deviceName}</title>
                      <style>
                        body {
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          padding: 20px;
                          font-family: Arial, sans-serif;
                        }
                        .qr-container {
                          text-align: center;
                          max-width: 500px;
                          padding: 20px;
                          border: 1px solid #ddd;
                          border-radius: 8px;
                          background-color: #f5f5f5;
                        }
                        .qr-title {
                          font-size: 18px;
                          font-weight: bold;
                          margin-bottom: 12px;
                        }
                        .qr-content {
                          white-space: pre-wrap;
                          text-align: left;
                          line-height: 1.5;
                        }
                        .info-section {
                          margin-top: 20px;
                          text-align: left;
                          border-top: 1px solid #eee;
                          padding-top: 10px;
                        }
                        @media print {
                          .no-print {
                            display: none;
                          }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="qr-container">
                        <div class="qr-title">Contact Information</div>
                        <div class="qr-content">${generateQRData()}</div>
                      </div>
                      <div class="info-section">
                        <p>This QR code was generated on ${new Date().toLocaleDateString()}.</p>
                        <p>Please attach this to your ${deviceName}.</p>
                      </div>
                      <script>
                        // Automatically open print dialog when page loads
                        window.onload = function() {
                          window.print();
                        }
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }}
              className="qr-button print"
            >
              Print QR Code
            </button>
            
            <button
              onClick={handleReset}
              className="qr-button reset"
            >
              Create New QR Code
            </button>
          </div>
          
          <div className="qr-instructions">
            <h3>How to use this QR code:</h3>
            <ol>
              <li>Download the QR code image</li>
              <li>Print it on a sticker or label</li>
              <li>Attach it to your device in a visible location</li>
              <li>If someone finds your device, they can scan the code to contact you</li>
            </ol>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;

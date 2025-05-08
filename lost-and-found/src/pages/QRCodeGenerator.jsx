import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import the CSS with an absolute path to avoid build issues
import '/src/assets/qrcode.css';

// Create a fallback QR code component in case the library fails to load
const FallbackQRCode = ({ value, size = 256, level = 'L', ...props }) => {
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px'
      }}
      {...props}
    >
      <div style={{ textAlign: 'center' }}>
        <div>QR Code</div>
        <div style={{ fontSize: '10px', marginTop: '5px' }}>{value.substring(0, 30)}...</div>
      </div>
    </div>
  );
};

const QRCodeGenerator = () => {
  const { currentUser } = useAuth();
  const [deviceName, setDeviceName] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrCodeRef = useRef(null);
  const [QRCode, setQRCode] = useState(null);
  const [html2canvas, setHtml2canvas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamically import the QR code and html2canvas libraries
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        // Try to import the libraries
        const [qrCodeModule, html2canvasModule] = await Promise.all([
          import('react-qr-code').catch(() => ({ default: FallbackQRCode })),
          import('html2canvas').catch(() => ({ default: () => Promise.resolve(null) }))
        ]);
        
        setQRCode(() => qrCodeModule.default);
        setHtml2canvas(() => html2canvasModule.default);
      } catch (error) {
        console.error('Failed to load dependencies:', error);
        // Use fallbacks
        setQRCode(() => FallbackQRCode);
        setHtml2canvas(() => () => Promise.resolve(null));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDependencies();
  }, []);
  
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
            {isLoading ? (
              <div className="loading-indicator">Loading QR Code...</div>
            ) : QRCode ? (
              <QRCode 
                value={generateQRData()} 
                size={250}
                level="H"
                className="qr-code"
              />
            ) : (
              <FallbackQRCode 
                value={generateQRData()} 
                size={250}
                className="qr-code"
              />
            )}
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
                if (qrCodeRef.current && html2canvas) {
                  html2canvas(qrCodeRef.current)
                    .then(canvas => {
                      if (canvas) {
                        const win = window.open('');
                        win.document.write(`
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
                            img {
                              max-width: 100%;
                              height: auto;
                            }
                            .print-container {
                              text-align: center;
                              max-width: 500px;
                            }
                            .info {
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
                          <div class="print-container">
                            <img src="${canvas.toDataURL('image/png')}" alt="QR Code" style="width: 100%; max-width: 350px;" />
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
                        win.document.close();
                      }
                    })
                    .catch(error => {
                      console.error('Error generating printable QR code:', error);
                      alert('Failed to generate printable QR code. Please try again.');
                    });
                } else {
                  alert('QR Code printing is not available. Please try downloading instead.');
                }
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

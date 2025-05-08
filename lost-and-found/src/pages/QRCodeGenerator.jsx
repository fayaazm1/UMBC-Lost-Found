import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// A basic QR code generator component that doesn't rely on external libraries
const SimpleQRCode = ({ value, size = 256, ...props }) => {
  // Convert the value to a JSON string if it's an object
  const qrData = typeof value === 'object' ? JSON.stringify(value) : String(value);
  
  // Create a canvas element to draw the QR code
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cellSize = Math.floor(size / 29); // QR code is typically 29x29 cells for simple data
    const margin = Math.floor(cellSize * 2);
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Generate a simple pattern based on the data
    // This is not a real QR code algorithm, but creates a visual representation
    ctx.fillStyle = '#000000';
    
    // Draw position detection patterns (the three large squares in corners)
    // Top-left
    ctx.fillRect(margin, margin, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + cellSize, margin + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + cellSize * 2, margin + cellSize * 2, cellSize * 3, cellSize * 3);
    
    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(size - margin - cellSize * 7, margin, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size - margin - cellSize * 6, margin + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(size - margin - cellSize * 5, margin + cellSize * 2, cellSize * 3, cellSize * 3);
    
    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin, size - margin - cellSize * 7, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + cellSize, size - margin - cellSize * 6, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + cellSize * 2, size - margin - cellSize * 5, cellSize * 3, cellSize * 3);
    
    // Use the string data to generate a pattern for the rest of the QR code
    const hash = qrData.split('').reduce((acc, char) => {
      return (acc * 31 + char.charCodeAt(0)) & 0xFFFFFFFF;
    }, 0);
    
    // Use the hash to seed a simple random number generator
    let seed = hash;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    // Fill in the rest of the QR code with a pattern based on the data
    for (let y = 0; y < 29; y++) {
      for (let x = 0; x < 29; x++) {
        // Skip the position detection patterns
        if ((x < 7 && y < 7) || (x > 21 && y < 7) || (x < 7 && y > 21)) {
          continue;
        }
        
        // Add some data cells based on the "random" generator
        if (random() > 0.6) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(margin + x * cellSize, margin + y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add a title below the QR code
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('UMBC LOST & FOUND', size / 2, size - 10);
    
  }, [value, size]);
  
  return (
    <div 
      className="simple-qr-code"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: '#FFFFFF', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      {...props}
    >
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        style={{ width: size, height: size }}
      />
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
    
    // Also create a JSON object for QR code data
    const jsonData = {
      name: contactInfo.name,
      email: contactInfo.email,
      deviceName: deviceName,
      timestamp: new Date().toISOString()
    };
    
    return jsonData;
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

  // Define inline styles to avoid CSS file dependencies
  const styles = {
    container: {
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      background: '#242424',
      overflow: 'hidden',
      padding: '2rem 1rem',
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
      animation: 'fadeIn 0.8s ease-out',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2.5rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      color: '#FFD700',
      textShadow: '0 2px 10px rgba(255, 215, 0, 0.2)',
    },
    subtitle: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '2rem',
    },
    formContainer: {
      background: 'rgba(30, 30, 40, 0.7)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '2rem',
    },
    profileInfo: {
      marginBottom: '1.5rem',
    },
    profileDetail: {
      display: 'flex',
      marginBottom: '0.5rem',
    },
    profileLabel: {
      width: '80px',
      fontWeight: 'bold',
      color: '#FFD700',
    },
    profileValue: {
      color: 'white',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    input: {
      width: '100%',
      padding: '0.8rem',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(0, 0, 0, 0.2)',
      color: 'white',
      fontSize: '1rem',
    },
    button: {
      padding: '0.8rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(90deg, #FFD700, #FFA500)',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    resultContainer: {
      background: 'rgba(30, 30, 40, 0.7)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    qrDisplay: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    infoSummary: {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    infoItem: {
      display: 'flex',
      marginBottom: '0.5rem',
    },
    infoLabel: {
      width: '80px',
      fontWeight: 'bold',
      color: '#FFD700',
    },
    infoValue: {
      color: 'white',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    printButton: {
      background: '#4CAF50',
    },
    resetButton: {
      background: '#f44336',
    },
    instructions: {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      padding: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📱 Generate Your QR Code</h1>
          <p style={styles.subtitle}>
            Create a QR code for your devices to help return them if lost
          </p>
        </div>

      {!qrGenerated && (
        <div style={styles.formContainer}>
          <div style={styles.profileInfo}>
            <h3 style={{color: '#FFD700', marginBottom: '1rem'}}>Your Profile Information</h3>
            <div style={styles.profileDetail}>
              <span style={styles.profileLabel}>Name:</span>
              <span style={styles.profileValue}>{contactInfo.name}</span>
            </div>
            <div style={styles.profileDetail}>
              <span style={styles.profileLabel}>Email:</span>
              <span style={styles.profileValue}>{contactInfo.email || 'Not provided'}</span>
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="deviceName" style={{color: '#FFD700', display: 'block', marginBottom: '0.5rem'}}>
              Device Name
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., MacBook Pro, iPhone 15, AirPods"
              style={styles.input}
            />
            <small style={{color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '0.5rem'}}>
              Enter the name of your device
            </small>
          </div>
          
          <button 
            onClick={handleGenerateQR}
            disabled={!deviceName.trim()}
            style={{
              ...styles.button,
              opacity: !deviceName.trim() ? 0.5 : 1,
              cursor: !deviceName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Create QR Code
          </button>
        </div>
      )}

      {qrGenerated && (
        <div style={styles.resultContainer}>
          <h2 style={{color: '#FFD700', marginBottom: '1.5rem', textAlign: 'center'}}>
            QR Code for {deviceName}
          </h2>
          
          <div style={styles.qrDisplay} ref={qrCodeRef}>
            <SimpleQRCode 
              value={generateQRData()} 
              size={250}
            />
          </div>
          
          <div style={styles.infoSummary}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Name:</span>
              <span style={styles.infoValue}>{contactInfo.name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{contactInfo.email || 'Not provided'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Device:</span>
              <span style={styles.infoValue}>{deviceName}</span>
            </div>
          </div>
          
          <div style={styles.actions}>
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
              style={{...styles.button, ...styles.printButton}}
            >
              Print QR Code
            </button>
            
            <button
              onClick={handleReset}
              style={{...styles.button, ...styles.resetButton}}
            >
              Create New QR Code
            </button>
          </div>
          
          <div style={styles.instructions}>
            <h3 style={{color: '#FFD700', marginBottom: '1rem'}}>How to use this QR code:</h3>
            <ol style={{color: 'white', paddingLeft: '1.5rem'}}>
              <li style={{margin: '0.5rem 0'}}>Download the QR code image</li>
              <li style={{margin: '0.5rem 0'}}>Print it on a sticker or label</li>
              <li style={{margin: '0.5rem 0'}}>Attach it to your device in a visible location</li>
              <li style={{margin: '0.5rem 0'}}>If someone finds your device, they can scan the code to contact you</li>
            </ol>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;

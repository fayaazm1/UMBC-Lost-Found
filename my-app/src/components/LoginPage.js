// src/components/LoginPage.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { RecaptchaVerifier, PhoneAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const navigate = useNavigate();

  // Step 1: Login with email and password
  const handleEmailPasswordLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        setIsLoginSuccess(true);  // Mark login as successful
      })
      .catch((error) => {
        console.error('Error logging in:', error.message);
        alert('Invalid credentials, please try again.');
      });
  };

  // Step 2: Send phone number for verification after email login
  const handlePhoneNumberSubmit = (e) => {
    e.preventDefault();

    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log('Recaptcha solved:', response);
      },
    }, auth);

    recaptchaVerifier.render();

    const phoneProvider = new PhoneAuthProvider(auth);
    phoneProvider.verifyPhoneNumber(phone, recaptchaVerifier)
      .then((verificationId) => {
        setVerificationId(verificationId);
        setIsPhoneVerified(true);
        alert('Verification code sent to phone');
      })
      .catch((error) => {
        console.error('Error sending verification code:', error);
        alert('Error sending verification code');
      });
  };

  // Step 3: Verify the code entered by the user
  const handleCodeSubmit = (e) => {
    e.preventDefault();

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    auth.signInWithCredential(credential)
      .then(() => {
        alert('Phone number verified');
        navigate('/home');  // Navigate to home page after successful 2FA
      })
      .catch((error) => {
        console.error('Error verifying phone:', error);
        alert('Verification failed');
      });
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Login Form: Email & Password */}
      {!isLoginSuccess ? (
        <form onSubmit={handleEmailPasswordLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        // Phone Verification Form after successful login
        <form onSubmit={handlePhoneNumberSubmit}>
          <h3>Phone Number Verification</h3>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
          />
          <button type="submit">Send Verification Code</button>
        </form>
      )}

      {/* Verification Code Form */}
      {isPhoneVerified && (
        <form onSubmit={handleCodeSubmit}>
          <h3>Enter Verification Code</h3>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}

      {/* Invisible Recaptcha container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginPage;

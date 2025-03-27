import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';
import { getUserByEmail, createDbUser } from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user in our database
    const dbUserData = await createDbUser({
      email: user.email,
      username: displayName,
      firebase_uid: user.uid
    });
    setDbUser(dbUserData);
    
    // Send verification email
    await sendEmailVerification(user);
    
    return user;
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch database user
    const dbUserData = await getUserByEmail(email);
    setDbUser(dbUserData);
    return userCredential;
  }

  async function logout() {
    setDbUser(null);
    return signOut(auth);
  }

  async function resendVerificationEmail() {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const dbUserData = await getUserByEmail(user.email);
        setDbUser(dbUserData);
      } else {
        setDbUser(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    dbUser,
    signup,
    login,
    logout,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

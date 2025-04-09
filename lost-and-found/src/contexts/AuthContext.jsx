import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  deleteUser,
  reload
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
    console.log("SIGNUP:", email, password, displayName);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const dbUserData = await createDbUser({
      email: user.email.toLowerCase(),
      username: displayName,
      firebase_uid: user.uid
    });

    if (!dbUserData) {
      await deleteUser(user);
      throw new Error("Signup failed. Please try again.");
    }

    setDbUser(dbUserData);
    await sendEmailVerification(user);
    return user;
  }

  async function login(email, password) {
    console.log("LOGIN:", email, password);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await reload(firebaseUser);

      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in.');
      }

      let dbUserData = await getUserByEmail(email.toLowerCase());

      if (!dbUserData) {
        console.warn("⚠️ User not found in database, attempting to create...");

        try {
          dbUserData = await createDbUser({
            email: firebaseUser.email.toLowerCase(),
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            firebase_uid: firebaseUser.uid
          });
        } catch (err) {
          if (err.message.includes("Email already registered")) {
            console.warn("✅ Email already exists in DB, fetching existing record...");
            dbUserData = await getUserByEmail(email.toLowerCase());
          } else {
            throw err;
          }
        }
      }

      setDbUser(dbUserData);
      return userCredential;

    } catch (error) {
      console.error("❌ Login error in AuthContext:", error);
      throw error;
    }
  }

  async function logout() {
    setDbUser(null);
    await signOut(auth);
  }

  async function resendVerificationEmail() {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("🔥 Firebase onAuthStateChanged:", user);
        if (user && isMounted) {
          await reload(user);
          if (!user.emailVerified) {
            setCurrentUser(null);
            setDbUser(null);
            return;
          }

          const dbUserData = await getUserByEmail(user.email.toLowerCase());
          if (dbUserData && isMounted) {
            setDbUser(dbUserData);
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
            setDbUser(null);
          }
        } else if (isMounted) {
          setDbUser(null);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (isMounted) {
          setCurrentUser(null);
          setDbUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    dbUser,
    loading,
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

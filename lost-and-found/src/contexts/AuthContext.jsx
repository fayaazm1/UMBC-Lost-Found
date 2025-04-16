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
    let firebaseUser = null;
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // Update profile with display name
      await updateProfile(firebaseUser, { displayName });

      try {
        // Try to create database user
        const dbUserData = await createDbUser({
          email: firebaseUser.email.toLowerCase(),
          username: displayName,
          firebase_uid: firebaseUser.uid
        });

        if (!dbUserData) {
          throw new Error("Failed to create database user");
        }

        setDbUser(dbUserData);
        await sendEmailVerification(firebaseUser);
        return firebaseUser;

      } catch (dbError) {
        // If database creation fails, delete the Firebase user
        console.error("Database error during signup:", dbError);
        if (firebaseUser) {
          await deleteUser(firebaseUser);
        }
        throw new Error(dbError.message || "Failed to create user in database. Please try again with a different username.");
      }
    } catch (error) {
      // If Firebase user creation fails or we caught a database error
      console.error("Error during signup:", error);
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch (deleteError) {
          console.error("Error deleting Firebase user after failed signup:", deleteError);
        }
      }
      throw error;
    }
  }

  /**
   * Log in a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  async function login(email, password) {
    setLoading(true);
    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Force-refresh the user object to ensure we have the latest data
      await firebaseUser.reload();
      
      // Email verification check
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        setLoading(false);
        throw new Error('Please verify your email before logging in.');
      }

      // Get or create database user
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
      setLoading(false);
      return userCredential;
    } catch (error) {
      console.error("Error during login:", error);
      setLoading(false);
      throw error;
    }
  }

  async function logout() {
    setDbUser(null);
    return signOut(auth);
  }

  async function resendVerificationEmail() {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    } else {
      throw new Error('No user is currently signed in');
    }
  }

  async function updateUserProfile(profileData) {
    try {
      // Step 1: Update Firebase profile
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      // Update Firebase profile first
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
      
      // Step 2: Only update Firebase for now since the backend API isn't ready yet
      // When you deploy the updated backend, you can uncomment the code below
      /*
      if (dbUser) {
        const updatedDbUser = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUser.email}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            displayName: profileData.displayName,
            photoURL: profileData.photoURL,
            bio: profileData.bio,
            phoneNumber: profileData.phoneNumber
          })
        });
        
        if (!updatedDbUser.ok) {
          throw new Error('Failed to update user in database');
        }
        
        const updatedUserData = await updatedDbUser.json();
        setDbUser(updatedUserData);
      }
      */
      
      // Reload the user to get updated profile
      await reload(currentUser);
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 Firebase onAuthStateChanged:", user);
      try {
        if (user) {
          if (isMounted) {
            setCurrentUser(user);
            const dbUserData = await getUserByEmail(user.email.toLowerCase());
            setDbUser(dbUserData);
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
    updateUserProfile,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

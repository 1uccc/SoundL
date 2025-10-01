import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { signOut as firebaseSignOut, getCurrentUser } from '../services/firebase';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid); // Debug log
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.displayName || 'Anonymous',
              avatar: userData.avatar || firebaseUser.photoURL || '',
              playlists: userData.playlists || [],
              role: userData.role || 'user'
            };
            console.log('User loaded:', user.displayName); // Debug log
            setUser(user);
          } else {
            console.log('User document not found, creating...'); // Debug log
            
            // Create user document if it doesn't exist (for social login)
            const newUserData = {
              displayName: firebaseUser.displayName || 'Anonymous',
              avatar: firebaseUser.photoURL || '',
              playlists: [],
              role: 'user', // Default role for new users
              createdAt: new Date()
            };
            
            try {
              await setDoc(userDocRef, newUserData);
              
              const user: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: newUserData.displayName,
                avatar: newUserData.avatar,
                playlists: [],
                role: 'user'
              };
              
              console.log('New user created:', user.displayName); // Debug log
              setUser(user);
            } catch (createError) {
              console.error('Error creating user document:', createError);
              await firebaseSignOut();
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Don't sign out on permission errors, just set user to null
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
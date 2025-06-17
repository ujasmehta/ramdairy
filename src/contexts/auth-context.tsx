
'use client';

import type { User } from 'firebase/auth';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  uid: 'dev-admin-bypass',
  email: 'dev@admin.local',
  displayName: 'Dev Admin (Auth Bypassed)',
  photoURL: '',
  providerId: 'firebase',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({
    token: '',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAdminAuthEnabled = process.env.NEXT_PUBLIC_ADMIN_AUTH_ENABLED !== 'false';

  useEffect(() => {
    if (!isAdminAuthEnabled) {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAdminAuthEnabled]);

  const signInWithGoogle = async () => {
    if (!isAdminAuthEnabled) {
      toast({ title: 'Auth Disabled', description: 'Admin authentication is currently bypassed for development.', variant: 'default' });
      setUser(mockUser); // Ensure mock user is set if called
      setLoading(false);
      return;
    }

    setLoading(true);
    setUser(null); 
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Sign-in attempt successful', description: 'Checking authentication status...' });
    } catch (error) {
      console.error("Error signing in with Google", error);
      let message = 'Failed to sign in with Google.';
      if (error instanceof Error && 'code' in error) {
        // FirebaseError type guard
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          message = 'Sign-in popup was closed before completing. Please try again.';
        } else if (firebaseError.code === 'auth/cancelled-popup-request') {
          message = 'Sign-in request was cancelled. Please try again.';
        } else if (firebaseError.code === 'auth/popup-blocked') {
            message = 'Sign-in popup was blocked by the browser. Please disable your popup blocker and try again.';
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
            message = 'Sign-in with Google is not enabled for this project. Please contact support.';
        } else if (firebaseError.code === 'auth/network-request-failed') {
            message = 'A network error occurred. Please check your internet connection and try again.';
        } else if (firebaseError.code === 'auth/configuration-not-found') {
            message = 'Firebase configuration not found. Ensure your app is configured correctly and the domain is authorized.';
        }
      }
      toast({ title: 'Sign-in Issue', description: message, variant: 'destructive' });
      setLoading(false); 
    }
  };

  const signOutUser = async () => {
    if (!isAdminAuthEnabled) {
      toast({ title: 'Auth Disabled', description: 'Admin authentication is currently bypassed. Sign out is a no-op.', variant: 'default' });
      setUser(mockUser); // Or setUser(null) if you want to clear the mock user, but AdminLayout would still grant access.
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Signed out successfully.' });
      setUser(null); 
    } catch (error) {
      console.error("Error signing out", error);
      toast({ title: 'Sign-out Error', description: 'Failed to sign out.', variant: 'destructive' });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser, isAuthEnabled: isAdminAuthEnabled }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

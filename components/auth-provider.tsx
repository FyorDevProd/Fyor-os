'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '@/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'developer' | 'demo' | null;
  isDemo: boolean;
  loading: boolean;
  login: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isDemo: false,
  loading: true,
  login: async () => {},
  loginAsDemo: () => {},
  logout: async () => {},
});

const DEMO_USER = {
  uid: 'demo-user-id',
  email: 'demo@fyor.os',
  displayName: 'Demo User',
  photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo',
  emailVerified: true,
  isAnonymous: false,
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'developer' | 'demo' | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo mode is active in localStorage
    const demoMode = typeof window !== 'undefined' ? localStorage.getItem('fyor_demo_mode') === 'true' : false;
    
    if (demoMode) {
      // Use setTimeout to avoid synchronous setState in effect warning
      setTimeout(() => {
        setIsDemo(true);
        setUser(DEMO_USER);
        setRole('demo');
        setLoading(false);
      }, 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (localStorage.getItem('fyor_demo_mode') === 'true') return;
      
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // Check if it's the default admin
            const isDefaultAdmin = currentUser.email === 'asadese171020@gmail.com' && currentUser.emailVerified;
            const newRole = isDefaultAdmin ? 'admin' : 'developer';
            await setDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              role: newRole,
              createdAt: new Date().toISOString(),
            });
            setRole(newRole);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      localStorage.removeItem('fyor_demo_mode');
      setIsDemo(false);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem('fyor_demo_mode', 'true');
    setIsDemo(true);
    setUser(DEMO_USER);
    setRole('demo');
    setLoading(false);
    
    import('sonner').then(({ toast }) => {
      toast.success('Demo Mode Activated', {
        description: 'You are now exploring FYOR OS in read-only mode.'
      });
    });
  };

  const logout = async () => {
    try {
      if (isDemo) {
        localStorage.removeItem('fyor_demo_mode');
        setIsDemo(false);
        setUser(null);
        setRole(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isDemo, loading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

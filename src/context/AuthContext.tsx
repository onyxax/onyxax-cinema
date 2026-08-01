import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, updateProfile as updateProfileService } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRPCEnabled: boolean;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string, avatarUrl: string) => Promise<void>;
  toggleRPC: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isRPCEnabled: true,
  signOut: async () => {},
  updateProfile: async () => {},
  toggleRPC: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRPCEnabled, setIsRPCEnabled] = useState(() => {
    const saved = localStorage.getItem('onyxax_rpc_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleRPC = () => {
    setIsRPCEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('onyxax_rpc_enabled', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    // Initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Supabase Error:', error);
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
      clearTimeout(timeout);
    }).catch(() => {
      setLoading(false);
      clearTimeout(timeout);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (displayName: string, avatarUrl: string) => {
    if (!user || !user.email) return;
    
    try {
      const { error } = await updateProfileService(user.id, user.email, displayName, avatarUrl);
      if (error) throw error;
      
      // Refresh local user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isRPCEnabled, 
      signOut: handleSignOut, 
      updateProfile, 
      toggleRPC
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook consumed across the app
export const useAuth = () => useContext(AuthContext);

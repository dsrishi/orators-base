"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);

        // Listen for changes on auth state (sign in, sign out, etc.)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

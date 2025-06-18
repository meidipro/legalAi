// Filename: contexts/auth-context.tsx (NEW AND IMPROVED)

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService } from "@/lib/auth-service"
import type { AuthState, LoginCredentials, SignupCredentials, ProfileUpdateData, User } from "@/types/auth"

// This defines what our AuthContext will provide to the components.
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  // These functions are placeholders for now, we will make them real later.
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true, // Start in a loading state.
    isAuthenticated: false,
  });
  
  const authService = AuthService.getInstance();

  // This is the most important part.
  // It runs once when the app loads and listens for any authentication changes.
  useEffect(() => {
    // Check if there's already a logged-in user.
    authService.getCurrentUser().then(user => {
      if (user) {
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    // This listener automatically updates the app state when a user logs in,
    // logs out, or comes back to the app after signing in with Google.
    const subscription = authService.onAuthStateChange(user => {
      setAuthState({ user, isAuthenticated: !!user, isLoading: false });
    });
    
    // This cleans up the listener when the component is no longer on the screen.
    return () => {
      subscription?.unsubscribe();
    };
  }, [authService]);


  // These are the functions that our components will call.
  // They now use the real AuthService and let the listener above handle the state updates.
  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.loginWithEmail(credentials);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error; // Let the component show the error message.
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.signupWithEmail(credentials);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }

  const loginWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.loginWithGoogle();
      // Supabase handles the redirect, so we just wait.
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await authService.logout();
    // The listener will automatically set the user to null.
  }
  
  // These functions are just placeholders for now. We will implement them later.
  const updateProfile = async (data: ProfileUpdateData) => { 
    console.log("updateProfile called, but not implemented yet.", data);
  }
  const requestPasswordReset = async (email: string) => { 
    console.log("requestPasswordReset called, but not implemented yet.", email);
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// This is a custom hook that components will use to access the auth functions.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
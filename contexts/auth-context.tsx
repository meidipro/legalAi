"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService } from "@/lib/auth-service"
import type { AuthState, LoginCredentials, SignupCredentials, ProfileUpdateData } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  refreshUser: () => void
  requestPasswordReset: (email: string) => Promise<void>
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const authService = AuthService.getInstance()

  useEffect(() => {
    // Check for existing user on mount
    const user = authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }, [authService])

  const login = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.loginWithEmail(credentials)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.signupWithEmail(credentials)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const loginWithGoogle = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.loginWithGoogle()
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authService.logout()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!authState.user) throw new Error("No user logged in")

    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const updatedUser = await authService.updateProfile(authState.user.id, data)
      setAuthState({
        user: updatedUser,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const refreshUser = () => {
    const user = authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }

  const requestPasswordReset = async (email: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authService.requestPasswordReset(email)
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authService.confirmPasswordReset(token, newPassword)
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
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
        refreshUser,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

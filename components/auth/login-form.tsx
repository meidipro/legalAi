// Filename: components/auth/login-form.tsx (UPDATED TO REMOVE DEMO TEXT)

"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { translations } from "@/lib/translations"
import type { LoginCredentials } from "@/types/auth";
import type { Language } from "@/types/chat"; 
import { ForgotPasswordForm } from "./forgot-password-form"

interface LoginFormProps {
  language: Language
  onSwitchToSignup: () => void
  onClose: () => void
}

export function LoginForm({ language, onSwitchToSignup, onClose }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const { login, loginWithGoogle, isLoading } = useAuth()
  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(credentials)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  const handleSocialLogin = async () => {
    setError(null)
    try {
      await loginWithGoogle()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social login failed")
    }
  }

  if (showForgotPassword) {
    return <ForgotPasswordForm language={language} onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {language === "en" ? "Welcome Back" : "স্বাগতম"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === "en" ? "Sign in to your account" : "আপনার অ্যাকাউন্টে সাইন ইন করুন"}
        </p>
      </div>

      {/* The "Demo Mode Active" block has been deleted from here */}

      {/* Social Login Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleSocialLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {/* CHANGE: Removed "(Demo)" */}
          {language === "en" ? "Continue with Google" : "Google দিয়ে চালিয়ে যান"}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {language === "en" ? "Or continue with email" : "অথবা ইমেইল দিয়ে চালিয়ে যান"}
          </span>
        </div>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... rest of the form is unchanged ... */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === "en" ? "Email" : "ইমেইল"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === "en" ? "Enter your email" : "আপনার ইমেইল লিখুন"}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === "en" ? "Password" : "পাসওয়ার্ড"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === "en" ? "Enter your password" : "আপনার পাসওয়ার্ড লিখুন"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {language === "en" ? "Forgot password?" : "পাসওয়ার্ড ভুলে গেছেন?"}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {language === "en" ? "Sign In" : "সাইন ইন"}
        </button>
      </form>
      
      {/* I am leaving the demo credentials box for your convenience during testing */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {language === "en" ? "Demo: test@example.com / password" : "ডেমো: test@example.com / password"}
        </p>
      </div>

       <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === "en" ? "Don't have an account? " : "অ্যাকাউন্ট নেই? "}
          <button onClick={onSwitchToSignup} className="text-blue-500 hover:text-blue-600 font-medium">
            {language === "en" ? "Sign up" : "সাইন আপ করুন"}
          </button>
        </p>
      </div>
    </div>
  )
}
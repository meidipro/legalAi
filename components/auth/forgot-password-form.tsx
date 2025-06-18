"use client"

import type React from "react"
import { useState } from "react"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Language } from "@/types/chat"

interface ForgotPasswordFormProps {
  language: Language
  onBack: () => void
}

export function ForgotPasswordForm({ language, onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { requestPasswordReset, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await requestPasswordReset(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {language === "en" ? "Check Your Email" : "আপনার ইমেইল চেক করুন"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === "en"
              ? `We've sent a password reset link to ${email}`
              : `আমরা ${email} এ একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠিয়েছি`}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {language === "en"
              ? "Didn't receive the email? Check your spam folder or try again."
              : "ইমেইল পাননি? আপনার স্প্যাম ফোল্ডার চেক করুন বা আবার চেষ্টা করুন।"}
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "en" ? "Back to Sign In" : "সাইন ইনে ফিরে যান"}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {language === "en" ? "Reset Password" : "পাসওয়ার্ড রিসেট করুন"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === "en"
            ? "Enter your email address and we'll send you a link to reset your password"
            : "আপনার ইমেইল ঠিকানা লিখুন এবং আমরা আপনাকে পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাব"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === "en" ? "Email Address" : "ইমেইল ঠিকানা"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === "en" ? "Enter your email" : "আপনার ইমেইল লিখুন"}
              required
            />
          </div>
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
          {language === "en" ? "Send Reset Link" : "রিসেট লিঙ্ক পাঠান"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={onBack} className="text-blue-500 hover:text-blue-600 font-medium text-sm">
          {language === "en" ? "← Back to Sign In" : "← সাইন ইনে ফিরে যান"}
        </button>
      </div>
    </div>
  )
}

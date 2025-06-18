"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Language } from "@/types/chat"

interface ResetPasswordFormProps {
  language: Language
  token: string
  onSuccess: () => void
}

export function ResetPasswordForm({ language, token, onSuccess }: ResetPasswordFormProps) {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { confirmPasswordReset, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(language === "en" ? "Passwords do not match" : "পাসওয়ার্ড মিলছে না")
      return
    }

    if (passwords.newPassword.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters" : "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      return
    }

    try {
      await confirmPasswordReset(token, passwords.newPassword)
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {language === "en" ? "Password Reset Successful" : "পাসওয়ার্ড রিসেট সফল"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === "en"
            ? "Your password has been successfully reset. You can now sign in with your new password."
            : "আপনার পাসওয়ার্ড সফলভাবে রিসেট হয়েছে। এখন আপনি আপনার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করতে পারেন।"}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {language === "en" ? "Set New Password" : "নতুন পাসওয়ার্ড সেট করুন"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === "en" ? "Enter your new password below" : "নিচে আপনার নতুন পাসওয়ার্ড লিখুন"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === "en" ? "New Password" : "নতুন পাসওয়ার্ড"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPasswords.newPassword ? "text" : "password"}
              value={passwords.newPassword}
              onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === "en" ? "Enter new password" : "নতুন পাসওয়ার্ড লিখুন"}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === "en" ? "Confirm New Password" : "নতুন পাসওয়ার্ড নিশ্চিত করুন"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === "en" ? "Confirm new password" : "নতুন পাসওয়ার্ড নিশ্চিত করুন"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
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
          {language === "en" ? "Reset Password" : "পাসওয়ার্ড রিসেট করুন"}
        </button>
      </form>
    </div>
  )
}

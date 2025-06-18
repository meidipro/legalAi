"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import type { Language } from "@/types/chat"
import { ResetPasswordForm } from "./reset-password-form"

interface AuthModalProps {
  language: Language
  onClose: () => void
  initialMode?: "login" | "signup"
}

export function AuthModal({ language, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetToken, setResetToken] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("reset_token")
      if (token) {
        setResetToken(token)
        setShowPasswordReset(true)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {language === "en" ? "LegalAI BD" : "লিগ্যালএআই বিডি"}
          </h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {showPasswordReset ? (
            <ResetPasswordForm
              language={language}
              token={resetToken}
              onSuccess={() => {
                setShowPasswordReset(false)
                setMode("login")
              }}
            />
          ) : mode === "login" ? (
            <LoginForm language={language} onSwitchToSignup={() => setMode("signup")} onClose={onClose} />
          ) : (
            <SignupForm language={language} onSwitchToLogin={() => setMode("login")} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

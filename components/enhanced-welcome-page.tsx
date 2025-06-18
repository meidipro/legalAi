"use client"

import { useState } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { AuthModal } from "./auth/auth-modal"
import { ProfileModal } from "./auth/profile-modal"
import { useAuth } from "@/contexts/auth-context"
import { translations } from "@/lib/translations"
import { User, LogIn, UserPlus } from "lucide-react"
import type { Language } from "@/types/chat"

interface EnhancedWelcomePageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onGetStarted: () => void
}

export function EnhancedWelcomePage({ language, onLanguageChange, onGetStarted }: EnhancedWelcomePageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const { user, isAuthenticated } = useAuth()
  const t = translations[language]

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onGetStarted()
    } else {
      setAuthMode("signup")
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="w-full p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{t.welcomeLogo}</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />

          {isAuthenticated && user ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              {user.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{user.name}</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleAuthClick("login")}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors w-full sm:w-auto"
              >
                <LogIn className="w-4 h-4" />
                {language === "en" ? "Sign In" : "সাইন ইন"}
              </button>
              <button
                onClick={() => handleAuthClick("signup")}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
              >
                <UserPlus className="w-4 h-4" />
                {language === "en" ? "Sign Up" : "সাইন আপ"}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 max-w-6xl mx-auto py-8 sm:py-0">
        <div className="mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
            <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
              />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 leading-tight max-w-4xl mx-auto">
            {t.welcomeTitle}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Features Grid - Mobile responsive with better alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
              {language === "en" ? "Legal Guidance" : "আইনি নির্দেশনা"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
              {language === "en"
                ? "Get instant answers to your legal questions with AI-powered assistance"
                : "AI-চালিত সহায়তার মাধ্যমে আপনার আইনি প্রশ্নের তাৎক্ষণিক উত্তর পান"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
              {language === "en" ? "Bangladesh Laws" : "বাংলাদেশের আইন"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
              {language === "en"
                ? "Access comprehensive database of Bangladesh legal documents and acts"
                : "বাংলাদেশের আইনি নথি এবং আইনের বিস্তৃত ডাটাবেস অ্যাক্সেস করুন"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
              {language === "en" ? "Multilingual Support" : "বহুভাষিক সহায়তা"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
              {language === "en"
                ? "Communicate in both English and Bengali for better understanding"
                : "ভাল বোঝার জন্য ইংরেজি এবং বাংলা উভয় ভাষায় যোগাযোগ করুন"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleGetStarted}
            className="bg-blue-500 hover:bg-blue-600 text-white text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto max-w-sm font-semibold"
          >
            {isAuthenticated ? (language === "en" ? "Continue to Chat" : "চ্যাটে চালিয়ে যান") : t.getStartedBtn}
          </button>

          {!isAuthenticated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-4 text-center max-w-md">
              {language === "en"
                ? "Sign up to save your conversations and preferences"
                : "আপনার কথোপকথন এবং পছন্দ সংরক্ষণ করতে সাইন আপ করুন"}
            </p>
          )}
        </div>
      </main>

      <footer className="p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t.welcomeDisclaimer}</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal language={language} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
      )}

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal language={language} onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}

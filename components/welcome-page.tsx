"use client"

import { LanguageSwitcher } from "./language-switcher"
import { translations } from "@/lib/translations"
import type { Language } from "@/types/chat"

interface WelcomePageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onGetStarted: () => void
}

export function WelcomePage({ language, onLanguageChange, onGetStarted }: WelcomePageProps) {
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t.welcomeLogo}</h1>
        <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">{t.welcomeTitle}</h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">{t.welcomeSubtitle}</p>
        <button
          onClick={onGetStarted}
          className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-lg transition-colors"
        >
          {t.getStartedBtn}
        </button>
      </main>

      <footer className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500">{t.welcomeDisclaimer}</p>
      </footer>
    </div>
  )
}

"use client"

import type { Language } from "@/types/chat"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex gap-2">
      <button
        className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
          currentLanguage === "en" ? "bg-blue-500 text-white border-blue-500" : "bg-transparent hover:bg-gray-100"
        }`}
        onClick={() => onLanguageChange("en")}
      >
        EN
      </button>
      <button
        className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
          currentLanguage === "bn" ? "bg-blue-500 text-white border-blue-500" : "bg-transparent hover:bg-gray-100"
        }`}
        onClick={() => onLanguageChange("bn")}
      >
        BN
      </button>
    </div>
  )
}

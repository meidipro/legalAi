"use client"

import { LanguageSwitcher } from "./language-switcher"
import { translations } from "@/lib/translations"
import type { Language } from "@/types/chat"

interface ChatSidebarProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onNewChat: () => void
}

export function ChatSidebar({ language, onLanguageChange, onNewChat }: ChatSidebarProps) {
  const t = translations[language]

  return (
    <aside className="w-64 bg-gray-100 flex flex-col p-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-xl font-semibold">{t.chatLogo}</h1>
        <button
          onClick={onNewChat}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors"
        >
          {t.newChatBtn}
        </button>
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-4">{t.conversationsTitle}</p>
        {/* Conversation history can be added here later */}
      </div>

      <div className="mt-auto">
        <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>
    </aside>
  )
}

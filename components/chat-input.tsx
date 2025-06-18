"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { translations } from "@/lib/translations"
import type { Language, Persona } from "@/types/chat"

interface ChatInputProps {
  language: Language
  persona: Persona
  onPersonaChange: (persona: Persona) => void
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ language, persona, onPersonaChange, onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const t = translations[language]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="p-6 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200">
        <select
          value={persona}
          onChange={(e) => onPersonaChange(e.target.value as Persona)}
          className="bg-transparent border-none text-gray-600 px-2 focus:outline-none"
          disabled={disabled}
        >
          <option value="General Public">{t.personaPublic}</option>
          <option value="Law Student">{t.personaStudent}</option>
          <option value="Lawyer">{t.personaLawyer}</option>
        </select>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
          className="flex-1 bg-transparent border-none text-gray-900 px-2 focus:outline-none"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-2">{t.chatDisclaimer}</p>
    </div>
  )
}

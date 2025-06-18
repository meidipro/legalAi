"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Paperclip, X } from "lucide-react"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { useFileUpload } from "@/hooks/use-file-upload"
import { translations } from "@/lib/translations"
import type { Language, Persona, FileAttachment } from "@/types/chat"

interface EnhancedChatInputProps {
  language: Language
  persona: Persona
  onPersonaChange: (persona: Persona) => void
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
}

export function EnhancedChatInput({
  language,
  persona,
  onPersonaChange,
  onSendMessage,
  disabled = false,
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  const { uploadFile, uploading } = useFileUpload()
  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    language: language === "en" ? "en-US" : "bn-BD",
    continuous: false,
    interimResults: false,
  })

  useEffect(() => {
    if (transcript) {
      setMessage((prev) => prev + (prev ? " " : "") + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim(), attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("File size must be less than 10MB")
        continue
      }
      const attachment = await uploadFile(file)
      if (attachment) {
        setAttachments((prev) => [...prev, attachment])
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="p-4 lg:p-6">
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg max-w-full"
            >
              <Paperclip className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate max-w-24 sm:max-w-32">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="text-gray-500 hover:text-red-500 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input container - wider for web */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Mobile: Persona selector on top */}
          <div className="lg:hidden border-b border-gray-200 dark:border-gray-600 px-4 py-2">
            <select
              value={persona}
              onChange={(e) => onPersonaChange(e.target.value as Persona)}
              className="w-full bg-transparent border-none text-gray-600 dark:text-gray-300 focus:outline-none text-sm"
              disabled={disabled}
            >
              <option value="General Public">{t.personaPublic}</option>
              <option value="Law Student">{t.personaStudent}</option>
              <option value="Lawyer">{t.personaLawyer}</option>
            </select>
          </div>

          {/* Main input row */}
          <div className="flex items-end gap-2 p-3 lg:p-4">
            {/* Desktop: Persona selector inline */}
            <div className="hidden lg:block">
              <select
                value={persona}
                onChange={(e) => onPersonaChange(e.target.value as Persona)}
                className="bg-transparent border-none text-gray-600 dark:text-gray-300 px-2 focus:outline-none text-sm"
                disabled={disabled}
              >
                <option value="General Public">{t.personaPublic}</option>
                <option value="Law Student">{t.personaStudent}</option>
                <option value="Lawyer">{t.personaLawyer}</option>
              </select>
            </div>

            {/* Text input - much wider on desktop */}
            <div className="flex-1 min-w-0">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder={isListening ? t.recordingStarted : t.messagePlaceholder}
                className="w-full bg-transparent border-none text-gray-900 dark:text-gray-100 px-2 py-2 focus:outline-none resize-none text-sm lg:text-base min-h-[40px] max-h-32"
                disabled={disabled || isListening}
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "40px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = Math.min(target.scrollHeight, 128) + "px"
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-1 lg:gap-2 flex-shrink-0">
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t.uploadFile}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Voice input button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={disabled}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={isListening ? t.stopRecording : t.voiceInput}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <button
                type="submit"
                disabled={(!message.trim() && attachments.length === 0) || disabled}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 px-2">{t.chatDisclaimer}</p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

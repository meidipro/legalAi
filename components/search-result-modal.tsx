"use client"

import { X, ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"
import { translations } from "@/lib/translations"
import type { Language, SearchResult } from "@/types/chat"

interface SearchResultModalProps {
  result: SearchResult
  language: Language
  onClose: () => void
  onNavigateToConversation?: (conversationId: string, messageId?: string) => void
}

export function SearchResultModal({ result, language, onClose, onNavigateToConversation }: SearchResultModalProps) {
  const [copied, setCopied] = useState(false)
  const t = translations[language]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleNavigate = () => {
    if (result.conversationId && onNavigateToConversation) {
      onNavigateToConversation(result.conversationId, result.messageId)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{result.title}</h2>
            {result.legalReference && (
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  {result.legalReference.actName}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  Section {result.legalReference.section}
                  {result.legalReference.subsection && `(${result.legalReference.subsection})`}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">{result.content}</div>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                  {result.type.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.relevanceScore}:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{result.relevanceScore}</span>
              </div>
              {result.source && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Source:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{result.source}</span>
                </div>
              )}
              {result.timestamp && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {result.timestamp.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {result.conversationId && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Go to Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

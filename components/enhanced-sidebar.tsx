"use client"

import type React from "react"

import { useState } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { Moon, Sun, Search, BarChart3, Plus, MessageSquare, Trash2 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { translations } from "@/lib/translations"
import type { Language, SavedConversation, SearchResult } from "@/types/chat"
import { SearchComponent } from "./search-component"
import { SearchAnalyticsDashboard } from "./search-analytics-dashboard"

interface EnhancedSidebarProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onNewChat: () => void
  conversations: SavedConversation[]
  currentConversationId?: string
  onLoadConversation: (conversation: SavedConversation) => void
  onDeleteConversation: (id: string) => void
  onNavigateToMessage?: (conversationId: string, messageId?: string) => void
  onCloseMobile?: () => void
}

export function EnhancedSidebar({
  language,
  onLanguageChange,
  onNewChat,
  conversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onNavigateToMessage,
  onCloseMobile,
}: EnhancedSidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const t = translations[language]
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [showSearch, setShowSearch] = useState(false)
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const menuItems = [
    {
      icon: Plus,
      label: t.newChatBtn,
      onClick: () => {
        onNewChat()
        onCloseMobile?.()
      },
    },
    {
      icon: Search,
      label: t.search,
      onClick: () => setShowSearch(true),
    },
    {
      icon: BarChart3,
      label: "Search Analytics",
      onClick: () => setShowAnalytics(true),
    },
  ]

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(id)
  }

  const confirmDelete = (id: string) => {
    onDeleteConversation(id)
    setShowDeleteConfirm(null)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t.chatLogo}</h1>
      </div>

      {/* Menu Items */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.conversationsTitle}</p>
        </div>

        <div className="space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              {language === "en" ? "No conversations yet" : "এখনো কোনো কথোপকথন নেই"}
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id
                    ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  onLoadConversation(conversation)
                  onCloseMobile?.()
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(conversation.lastUpdated)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteClick(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    title={t.deleteConversation}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {showDeleteConfirm === conversation.id && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col justify-center items-center border border-red-300 dark:border-red-700 z-10">
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 text-center">
                      {language === "en" ? "Delete this conversation?" : "এই কথোপকথন মুছবেন?"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(conversation.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        {language === "en" ? "Delete" : "মুছুন"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        {language === "en" ? "Cancel" : "বাতিল"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {theme === "light" ? t.lightMode : t.darkMode}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchComponent
          language={language}
          conversations={conversations}
          onResultClick={(result) => {
            setSelectedSearchResult(result)
            setShowSearch(false)
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showAnalytics && <SearchAnalyticsDashboard language={language} onClose={() => setShowAnalytics(false)} />}
    </aside>
  )
}

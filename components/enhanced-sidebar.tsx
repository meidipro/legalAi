// Filename: components/enhanced-sidebar.tsx (UPDATED)

"use client";

import type React from "react";
import { useState } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { Moon, Sun, Search, BarChart3, Plus, MessageSquare, Trash2, User, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { translations } from "@/lib/translations";
import type { Language, SavedConversation } from "@/types/chat";
import { Skeleton } from "./ui/skeleton"; // <-- Import the Skeleton component

interface EnhancedSidebarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNewChat: () => void;
  conversations: SavedConversation[];
  currentConversationId?: string;
  isLoadingHistory: boolean; // <-- This new prop will tell us when to show the loading animation
  onLoadConversation: (conversation: SavedConversation) => void;
  onDeleteConversation: (id: string) => void;
  onCloseMobile?: () => void;
}

export function EnhancedSidebar({
  language,
  onLanguageChange,
  onNewChat,
  conversations,
  currentConversationId,
  isLoadingHistory, // <-- We will now use this prop
  onLoadConversation,
  onDeleteConversation,
  onCloseMobile,
}: EnhancedSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const t = translations[language];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };

  const confirmDelete = (id: string) => {
    onDeleteConversation(id);
    setShowDeleteConfirm(null);
  };
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    try {
      const diff = now.getTime() - dateObj.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      return dateObj.toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t.chatLogo}</h1>
      </div>
      
      <div className="p-4 space-y-2">
          <button onClick={() => { onNewChat(); onCloseMobile?.(); }} className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Plus className="w-5 h-5" /> <span>{t.newChatBtn}</span>
          </button>
          {/* Search and Analytics can be re-enabled later */}
          {/* <button ... /> */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.conversationsTitle}</p>
        </div>

        <div className="space-y-1">
          {/* --- NEW: This is the loading logic --- */}
          {isLoadingHistory ? (
            <>
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`} onClick={() => { onLoadConversation(conversation); onCloseMobile?.(); }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{conversation.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(conversation.lastUpdated)}</p>
                  </div>
                  <button onClick={(e) => handleDeleteClick(conversation.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {showDeleteConfirm === conversation.id && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col justify-center items-center border border-red-300 z-10">
                    <p className="text-xs text-center mb-2">Delete this?</p>
                    <div className="flex gap-2">
                        <button onClick={() => confirmDelete(conversation.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded">Delete</button>
                        <button onClick={() => setShowDeleteConfirm(null)} className="px-2 py-1 bg-gray-300 text-xs rounded">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {user && (
          <div className="flex items-center gap-3">
            {user.avatar ? ( <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" /> ) :
             (<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><User className="w-4 h-4" /></div>)}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <button onClick={() => logout()} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <LogOut className="w-3 h-3"/> Sign Out
                </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
        <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>
    </aside>
  );
}
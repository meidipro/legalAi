"use client"

import { useState, useRef, useEffect } from "react"
import { EnhancedSidebar } from "./enhanced-sidebar"
import { EnhancedMessage } from "./enhanced-message"
import { EnhancedChatInput } from "./enhanced-chat-input"
import { ProfileModal } from "./auth/profile-modal"
import { useAuth } from "@/contexts/auth-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { sendMessageToDify } from "@/lib/dify-api"
import { translations } from "@/lib/translations"
import type { Language, Persona, Message, ChatState, SavedConversation, FileAttachment } from "@/types/chat"
import { Menu, User, MoreHorizontal, Edit3, Save, Share2 } from "lucide-react"

interface EnhancedChatPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function EnhancedChatPage({ language, onLanguageChange }: EnhancedChatPageProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationId: null,
    isTyping: false,
  })
  const [persona, setPersona] = useState<Persona>("General Public")
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useLocalStorage<SavedConversation[]>("legal-ai-conversations", [])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showChatActions, setShowChatActions] = useState(false)
  const [chatTitle, setChatTitle] = useState("New Chat")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuth()
  const t = translations[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages])

  const generateConversationTitle = (firstMessage: string) => {
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage
  }

  const saveConversation = (messages: Message[], conversationId: string) => {
    if (messages.length === 0) return

    const title = chatTitle === "New Chat" ? generateConversationTitle(messages[0].content) : chatTitle
    const conversation: SavedConversation = {
      id: conversationId,
      title,
      messages,
      lastUpdated: new Date(),
      persona,
    }

    setConversations((prev) => {
      const existing = prev.find((c) => c.id === conversationId)
      if (existing) {
        return prev.map((c) => (c.id === conversationId ? conversation : c))
      }
      return [conversation, ...prev]
    })
  }

  const handleNewChat = () => {
    if (chatState.messages.length > 0 && currentConversationId) {
      saveConversation(chatState.messages, currentConversationId)
    }

    setChatState({
      messages: [],
      conversationId: null,
      isTyping: false,
    })
    setCurrentConversationId(null)
    setChatTitle("New Chat")
    setShowChatActions(false)
  }

  const handleLoadConversation = (conversation: SavedConversation) => {
    // Save current conversation first
    if (chatState.messages.length > 0 && currentConversationId) {
      saveConversation(chatState.messages, currentConversationId)
    }

    setChatState({
      messages: conversation.messages,
      conversationId: conversation.id,
      isTyping: false,
    })
    setCurrentConversationId(conversation.id)
    setChatTitle(conversation.title)
    setPersona(conversation.persona)
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      handleNewChat()
    }
  }

  const handleRenameChat = () => {
    setTempTitle(chatTitle)
    setIsEditingTitle(true)
    setShowChatActions(false)
  }

  const handleSaveTitle = () => {
    setChatTitle(tempTitle)
    setIsEditingTitle(false)
    if (currentConversationId && chatState.messages.length > 0) {
      saveConversation(chatState.messages, currentConversationId)
    }
  }

  const handleSaveChat = () => {
    if (currentConversationId && chatState.messages.length > 0) {
      saveConversation(chatState.messages, currentConversationId)
      setShowChatActions(false)
      // Show success message
      alert(language === "en" ? "Chat saved successfully!" : "চ্যাট সফলভাবে সংরক্ষিত হয়েছে!")
    }
  }

  const handleShareChat = (platform: string) => {
    if (chatState.messages.length === 0) return

    const chatContent = chatState.messages.map((msg) => `${msg.isUser ? "You" : "AI"}: ${msg.content}`).join("\n\n")

    const shareText = `Check out this legal AI conversation:\n\n${chatContent.substring(0, 500)}...`

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
        "_blank",
      )
    }
    setShowChatActions(false)
  }

  const handleSendMessage = async (messageContent: string, attachments?: FileAttachment[]) => {
    const newConversationId = currentConversationId || Date.now().toString()
    setCurrentConversationId(newConversationId)

    // Update chat title if it's the first message
    if (chatState.messages.length === 0) {
      setChatTitle(generateConversationTitle(messageContent))
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      attachments,
    }

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }))

    try {
      let fullMessage = messageContent
      if (attachments && attachments.length > 0) {
        const fileInfo = attachments.map((att) => `[File: ${att.name} (${att.type})]`).join(" ")
        fullMessage = `${messageContent} ${fileInfo}`
      }

      const stream = await sendMessageToDify(fullMessage, persona, language, chatState.conversationId || undefined)

      if (!stream) {
        throw new Error("No response stream received")
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""
      let newDifyConversationId = chatState.conversationId

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        isUser: false,
        timestamp: new Date(),
      }

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isTyping: false,
      }))

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.substring(6))
              if (jsonData.event === "agent_message" || jsonData.event === "message") {
                fullResponse += jsonData.answer || ""
                setChatState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === aiMessage.id ? { ...msg, content: fullResponse } : msg,
                  ),
                }))
              }
              if (jsonData.event === "message_end") {
                newDifyConversationId = jsonData.conversation_id
              }
            } catch (e) {
              // Ignore non-JSON lines
            }
          }
        }
      }

      if (fullResponse.trim() === "") {
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, content: "I received an empty response. Please try again." } : msg,
          ),
        }))
      }

      setChatState((prev) => ({
        ...prev,
        conversationId: newDifyConversationId,
      }))

      // Auto-save conversation after each exchange
      setTimeout(() => {
        setChatState((currentState) => {
          saveConversation(currentState.messages, newConversationId)
          return currentState
        })
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Sorry, there was an error connecting to the AI: ${error instanceof Error ? error.message : "Unknown error"}`,
        isUser: false,
        timestamp: new Date(),
      }

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false,
      }))
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden ${showMobileSidebar ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowMobileSidebar(false)} />
        <div className="fixed inset-y-0 left-0 w-64">
          <EnhancedSidebar
            language={language}
            onLanguageChange={onLanguageChange}
            onNewChat={handleNewChat}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            onCloseMobile={() => setShowMobileSidebar(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <EnhancedSidebar
          language={language}
          onLanguageChange={onLanguageChange}
          onNewChat={handleNewChat}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          {/* Left side - Mobile menu + Chat title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Chat Title */}
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">{chatTitle}</h1>
                  {chatState.messages.length > 0 && (
                    <button
                      onClick={() => setShowChatActions(!showChatActions)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - User profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ) : (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Actions Dropdown */}
        {showChatActions && (
          <div className="absolute top-16 left-4 lg:left-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 py-2 min-w-48">
            <button
              onClick={handleRenameChat}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              {language === "en" ? "Rename Chat" : "চ্যাট নাম পরিবর্তন"}
            </button>
            <button
              onClick={handleSaveChat}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Save className="w-4 h-4" />
              {language === "en" ? "Save Chat" : "চ্যাট সংরক্ষণ"}
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              onClick={() => handleShareChat("whatsapp")}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Share2 className="w-4 h-4" />
              {language === "en" ? "Share via WhatsApp" : "WhatsApp এ শেয়ার"}
            </button>
            <button
              onClick={() => handleShareChat("facebook")}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Share2 className="w-4 h-4" />
              {language === "en" ? "Share via Messenger" : "Messenger এ শেয়ার"}
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {chatState.messages.map((message) => (
                <EnhancedMessage key={message.id} message={message} messageId={message.id} />
              ))}
              {chatState.isTyping && (
                <EnhancedMessage
                  message={{
                    id: "typing",
                    content: t.typing,
                    isUser: false,
                    timestamp: new Date(),
                  }}
                  isTyping
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Chat Input - Made wider for web */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <EnhancedChatInput
              language={language}
              persona={persona}
              onPersonaChange={setPersona}
              onSendMessage={handleSendMessage}
              disabled={chatState.isTyping}
            />
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal language={language} onClose={() => setShowProfileModal(false)} />}

      {/* Click outside to close chat actions */}
      {showChatActions && <div className="fixed inset-0 z-20" onClick={() => setShowChatActions(false)} />}
    </div>
  )
}

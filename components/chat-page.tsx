"use client"

import { useState, useRef, useEffect } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { MessageComponent } from "./message"
import { ChatInput } from "./chat-input"
import { sendMessageToDify } from "@/lib/dify-api"
import { translations } from "@/lib/translations"
import type { Language, Persona, Message, ChatState } from "@/types/chat"

interface ChatPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function ChatPage({ language, onLanguageChange }: ChatPageProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationId: null,
    isTyping: false,
  })
  const [persona, setPersona] = useState<Persona>("General Public")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = translations[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages])

  const handleNewChat = () => {
    setChatState({
      messages: [],
      conversationId: null,
      isTyping: false,
    })
  }

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
    }

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }))

    try {
      const stream = await sendMessageToDify(messageContent, persona, language, chatState.conversationId || undefined)

      if (!stream) {
        throw new Error("No response stream received")
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""
      let newConversationId = chatState.conversationId

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
                newConversationId = jsonData.conversation_id
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
        conversationId: newConversationId,
      }))
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
    <div className="flex h-screen bg-white">
      <ChatSidebar language={language} onLanguageChange={onLanguageChange} onNewChat={handleNewChat} />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {chatState.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
            {chatState.isTyping && (
              <MessageComponent
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

        <ChatInput
          language={language}
          persona={persona}
          onPersonaChange={setPersona}
          onSendMessage={handleSendMessage}
          disabled={chatState.isTyping}
        />
      </main>
    </div>
  )
}

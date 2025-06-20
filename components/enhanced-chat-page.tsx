// Filename: components/enhanced-chat-page.tsx (UPDATED FOR DATABASE)

"use client"

import { useState, useRef, useEffect } from "react"
import { EnhancedSidebar } from "./enhanced-sidebar"
import { EnhancedMessage } from "./enhanced-message"
import { EnhancedChatInput } from "./enhanced-chat-input"
import { ProfileModal } from "./auth/profile-modal"
import { useAuth } from "@/contexts/auth-context"
import { sendMessageToDify } from "@/lib/dify-api"
import { translations } from "@/lib/translations"
import type { Language, Persona, Message, ChatState, SavedConversation, FileAttachment } from "@/types/chat"
import { Menu, User, MoreHorizontal, Edit3, Save, Share2 } from "lucide-react"

interface EnhancedChatPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function EnhancedChatPage({ language, onLanguageChange }: EnhancedChatPageProps) {
  // --- STATE MANAGEMENT ---
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationId: null,
    isTyping: false,
  });
  const [persona, setPersona] = useState<Persona>("General Public");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // NEW: State for conversations loaded from the database
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // UI State
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatActions, setShowChatActions] = useState(false);
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const t = translations[language];

  // --- EFFECTS ---

  // NEW: Fetch conversation history from the database when the user logs in
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated) return;
      setIsLoadingHistory(true);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          throw new Error('Failed to fetch conversation history');
        }
        const data = await response.json();
        // Rehydrate dates from strings to Date objects to prevent crashes
        const conversationsWithDates = data.map((conv: any) => ({
          ...conv,
          lastUpdated: new Date(conv.created_at),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchConversations();
  }, [isAuthenticated]); // Reruns when the user's login state changes

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // --- CORE FUNCTIONS ---

  const generateConversationTitle = (firstMessage: string) => {
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage;
  };

  // UPDATED: Saves the conversation to the database via your API
  const saveConversation = async (messages: Message[], conversationId: string) => {
    if (messages.length === 0 || !conversationId) return;

    const title = chatTitle === "New Chat" ? generateConversationTitle(messages[0].content) : chatTitle;
    const conversationToSave = {
      id: conversationId,
      title,
      messages,
      persona,
    };

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationToSave),
      });

      if (!response.ok) throw new Error('Failed to save conversation');
      const savedConv = await response.json();

      // Update the local state with the saved conversation from the server
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === savedConv.id);
        if (existingIndex !== -1) {
          const updatedConvs = [...prev];
          updatedConvs[existingIndex] = { ...savedConv, lastUpdated: new Date(savedConv.created_at) };
          return updatedConvs;
        } else {
          return [{ ...savedConv, lastUpdated: new Date(savedConv.created_at) }, ...prev];
        }
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleNewChat = async () => {
    if (chatState.messages.length > 0 && currentConversationId) {
      await saveConversation(chatState.messages, currentConversationId);
    }
    setChatState({ messages: [], conversationId: null, isTyping: false });
    setCurrentConversationId(null);
    setChatTitle("New Chat");
    setShowChatActions(false);
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    if (chatState.messages.length > 0 && currentConversationId) {
      saveConversation(chatState.messages, currentConversationId);
    }
    const messagesWithDates = conversation.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    setChatState({ messages: messagesWithDates, conversationId: conversation.id, isTyping: false });
    setCurrentConversationId(conversation.id);
    setChatTitle(conversation.title);
    setPersona(conversation.persona);
  };

  const handleDeleteConversation = async (id: string) => {
  // Optimistically remove from UI
  const originalConversations = conversations;
  setConversations(prev => prev.filter(c => c.id !== id));
  if (currentConversationId === id) {
    handleNewChat();
  }

  try {
    const response = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      // If API fails, revert the UI change
      setConversations(originalConversations);
      throw new Error("Failed to delete conversation");
    }
  } catch (error) {
    console.error(error);
    setConversations(originalConversations);
  }
};

  const handleRenameChat = () => {
    setTempTitle(chatTitle);
    setIsEditingTitle(true);
    setShowChatActions(false);
  };

  const handleSaveTitle = async () => {
  if (!currentConversationId || tempTitle === chatTitle) {
    setIsEditingTitle(false);
    return;
  }
  
  const originalTitle = chatTitle;
  setChatTitle(tempTitle); // Optimistic update
  setIsEditingTitle(false);

  try {
    const response = await fetch(`/api/conversations/${currentConversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: tempTitle }),
    });
    if (!response.ok) {
      setChatTitle(originalTitle); // Revert on failure
      throw new Error("Failed to rename conversation");
    }
    // Also update the title in the main conversation list
    setConversations(prev => prev.map(c => c.id === currentConversationId ? {...c, title: tempTitle} : c));
  } catch (error) {
    console.error(error);
    setChatTitle(originalTitle);
  }
};
  
  const handleSendMessage = async (messageContent: string, attachments?: FileAttachment[]) => {
    const newConvId = currentConversationId || crypto.randomUUID();
    if (!currentConversationId) {
      setCurrentConversationId(newConvId);
    }
    
    if (chatState.messages.length === 0) {
      setChatTitle(generateConversationTitle(messageContent));
    }

    const userMessage: Message = { id: crypto.randomUUID(), content: messageContent, isUser: true, timestamp: new Date(), attachments };
    const aiMessagePlaceholder: Message = { id: crypto.randomUUID(), content: "", isUser: false, timestamp: new Date() };
    
    // Immediately update UI with user message and AI typing placeholder
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage, aiMessagePlaceholder], isTyping: true }));

    try {
      const stream = await sendMessageToDify(messageContent, persona, language, chatState.conversationId || undefined);
      if (!stream) throw new Error("No response stream received");

      setChatState(prev => ({ ...prev, isTyping: false })); // Stop typing indicator once stream starts
      
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let finalDifyConvId = chatState.conversationId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.substring(6));
              if (jsonData.event === "agent_message" || jsonData.event === "message") {
                fullResponse += jsonData.answer || "";
                setChatState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg => msg.id === aiMessagePlaceholder.id ? { ...msg, content: fullResponse } : msg),
                }));
              }
              if (jsonData.event === "message_end") {
                finalDifyConvId = jsonData.conversation_id;
              }
            } catch (e) { /* Ignore parsing errors */ }
          }
        }
      }
      
      // Final state update with Dify conversation ID
      setChatState(prev => ({ ...prev, conversationId: finalDifyConvId }));

      // Save the complete conversation to the database
      const finalMessages = [...chatState.messages.filter(m => m.id !== aiMessagePlaceholder.id), { ...aiMessagePlaceholder, content: fullResponse }];
      await saveConversation(finalMessages, newConvId);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessageContent = `Sorry, there was an error connecting to the AI: ${error instanceof Error ? error.message : "Unknown error"}`;
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        messages: prev.messages.map(msg => msg.id === aiMessagePlaceholder.id ? { ...msg, content: errorMessageContent } : msg),
      }));
    }
  };

  // --- JSX RENDER ---
  
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
            currentConversationId={currentConversationId ?? undefined}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            onCloseMobile={() => setShowMobileSidebar(false)}
            isLoadingHistory={isLoadingHistory}
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
          currentConversationId={currentConversationId ?? undefined}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoadingHistory={isLoadingHistory}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">{chatTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
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
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {chatState.messages.map((message) => (
                <EnhancedMessage key={message.id} message={message} messageId={message.id} />
              ))}
              {chatState.isTyping && (
                <EnhancedMessage
                  message={{ id: "typing", content: t.typing, isUser: false, timestamp: new Date() }}
                  isTyping
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Chat Input */}
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

      {showProfileModal && <ProfileModal language={language} onClose={() => setShowProfileModal(false)} />}
    </div>
  );
}
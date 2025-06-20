// Filename: components/enhanced-chat-page.tsx (REFACTORED AND CORRECTED)

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { EnhancedMessage } from "./enhanced-message";
import { EnhancedChatInput } from "./enhanced-chat-input";
import { ProfileModal } from "./auth/profile-modal";
import { useAuth } from "@/contexts/auth-context";
import { sendMessageToDify } from "@/lib/dify-api";
import { translations } from "@/lib/translations";
import type { Language, Persona, Message, ChatState, SavedConversation, FileAttachment } from "@/types/chat";
import { Menu, User, MoreHorizontal, Edit3, Save, Share2, Trash2 } from "lucide-react";

interface EnhancedChatPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function EnhancedChatPage({ language, onLanguageChange }: EnhancedChatPageProps) {
  // --- STATE MANAGEMENT ---
  const [chatState, setChatState] = useState<ChatState>({ messages: [], conversationId: null, isTyping: false });
  const [persona, setPersona] = useState<Persona>("General Public");
  const [currentConversation, setCurrentConversation] = useState<SavedConversation | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const t = translations[language];

  // --- DATA FETCHING AND EFFECTS ---

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]); // Clear conversations if user logs out
      return;
    }
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversation history');
      const data = await response.json();
      const conversationsWithDates = data.map((conv: any) => ({
        ...conv,
        id: conv.id,
        lastUpdated: new Date(conv.created_at),
        messages: conv.messages.map((msg: any) => ({...msg, timestamp: new Date(msg.timestamp)}))
      }));
      setConversations(conversationsWithDates);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // --- CORE CONVERSATION HANDLERS ---
  
  const handleNewChat = () => {
    setCurrentConversation(null);
    setChatState({ messages: [], conversationId: null, isTyping: false });
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    setCurrentConversation(conversation);
    const messagesWithDates = conversation.messages.map(msg => ({...msg, timestamp: new Date(msg.timestamp)}));
    setChatState({ messages: messagesWithDates, conversationId: conversation.id, isTyping: false });
  };

  const handleDeleteConversation = async (id: string) => {
    const originalConversations = [...conversations];
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      handleNewChat();
    }
    try {
      const response = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!response.ok) setConversations(originalConversations); // Revert on failure
    } catch (error) {
      console.error(error);
      setConversations(originalConversations);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    const originalConversations = [...conversations];
    const updatedConversations = conversations.map(c => c.id === id ? { ...c, title: newTitle } : c);
    setConversations(updatedConversations);
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
    }
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!response.ok) setConversations(originalConversations); // Revert on failure
    } catch (error) {
      console.error(error);
      setConversations(originalConversations);
    }
  };
  
  const handleSendMessage = async (messageContent: string, attachments?: FileAttachment[]) => {
    const userMessage: Message = { id: crypto.randomUUID(), content: messageContent, isUser: true, timestamp: new Date(), attachments };
    
    // Optimistically update the UI with the user's message
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], isTyping: true }));

    try {
      const stream = await sendMessageToDify(messageContent, persona, language, chatState.conversationId || undefined);
      if (!stream) throw new Error("No response stream received");
      
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let finalDifyConvId = chatState.conversationId;

      const aiMessagePlaceholderId = crypto.randomUUID();
      // Add AI placeholder and stop the "typing" indicator
      setChatState(prev => ({ ...prev, messages: [...prev.messages, { id: aiMessagePlaceholderId, content: "", isUser: false, timestamp: new Date() }], isTyping: false }));
      
      // Read the stream from the API
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.substring(6));
              if (jsonData.event === 'agent_message' || jsonData.event === 'message') {
                fullResponse += jsonData.answer || "";
                setChatState(prev => ({...prev, messages: prev.messages.map(msg => msg.id === aiMessagePlaceholderId ? { ...msg, content: fullResponse } : msg)}));
              }
              if (jsonData.event === 'message_end') {
                finalDifyConvId = jsonData.conversation_id;
              }
            } catch (e) { /* Ignore parsing errors */ }
          }
        }
      }
      
      const finalMessages = [...chatState.messages.filter(m => m.id !== aiMessagePlaceholderId), { id: aiMessagePlaceholderId, content: fullResponse, isUser: false, timestamp: new Date() }];
      const title = !currentConversation ? (messageContent.length > 40 ? messageContent.substring(0, 40) + "..." : messageContent) : currentConversation.title;
      const conversationIdToSave = currentConversation?.id; // Will be undefined for a new chat
      
      // Save the complete conversation to the database
      const saveResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: conversationIdToSave, title, messages: finalMessages, persona }),
      });
      if (!saveResponse.ok) throw new Error("Failed to save conversation");
      
      const savedConv = await saveResponse.json();
      
      // Update the state with the final data from the server
      setConversations(prev => {
          const existing = prev.find(c => c.id === savedConv.id);
          if (existing) {
              return prev.map(c => c.id === savedConv.id ? { ...savedConv, lastUpdated: new Date(savedConv.created_at) } : c);
          }
          return [{ ...savedConv, lastUpdated: new Date(savedConv.created_at) }, ...prev];
      });

      if (!currentConversation) {
          setCurrentConversation({ ...savedConv, lastUpdated: new Date(savedConv.created_at) });
      }
      setChatState(prev => ({...prev, conversationId: finalDifyConvId}));

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = `Sorry, an error occurred: ${error instanceof Error ? error.message : "Please try again."}`;
      setChatState(prev => ({...prev, isTyping: false, messages: [...prev.messages, {id: crypto.randomUUID(), content: errorMessage, isUser: false, timestamp: new Date()}]}));
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <div className={`fixed inset-0 z-40 lg:hidden ${showMobileSidebar ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowMobileSidebar(false)} />
        <div className="fixed inset-y-0 left-0 w-64">
          <EnhancedSidebar
            language={language}
            onLanguageChange={onLanguageChange}
            onNewChat={handleNewChat}
            conversations={conversations}
            currentConversationId={currentConversation?.id}
            isLoadingHistory={isLoadingHistory}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            onCloseMobile={() => setShowMobileSidebar(false)}
          />
        </div>
      </div>

      <div className="hidden lg:block">
        <EnhancedSidebar
          language={language}
          onLanguageChange={onLanguageChange}
          onNewChat={handleNewChat}
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          isLoadingHistory={isLoadingHistory}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden p-2 text-gray-600 dark:text-gray-400">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {currentConversation?.title || "New Chat"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
              <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {chatState.messages.map((message) => (
                <EnhancedMessage key={message.id} message={message} messageId={message.id} />
              ))}
              {chatState.isTyping && <EnhancedMessage message={{ id: "typing", content: t.typing, isUser: false, timestamp: new Date()}} isTyping />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <EnhancedChatInput language={language} persona={persona} onPersonaChange={setPersona} onSendMessage={handleSendMessage} disabled={chatState.isTyping} />
          </div>
        </div>
      </main>

      {showProfileModal && <ProfileModal language={language} onClose={() => setShowProfileModal(false)} />}
    </div>
  );
}
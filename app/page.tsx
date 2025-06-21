// Filename: app/page.tsx (CORRECTED)

"use client";

import { useState } from "react";
import { EnhancedWelcomePage } from "@/components/enhanced-welcome-page";
import { EnhancedChatPage } from "@/components/enhanced-chat-page";
import { useAuth } from "@/contexts/auth-context";
import type { Language } from "@/types/chat";
import { useEffect } from "react";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"welcome" | "chat">("welcome");
  const [language, setLanguage] = useState<Language>("en");
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, skip the welcome page and go straight to chat.
  // This useEffect will run when the AuthContext finishes loading.
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage("chat");
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    setCurrentPage("chat");
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (!isAuthenticated && currentPage === "welcome") {
    return (
      <EnhancedWelcomePage
        language={language}
        onLanguageChange={handleLanguageChange}
        onGetStarted={handleGetStarted}
      />
    );
  }

  // This ensures we always render the ENHANCED chat page when logged in.
  return <EnhancedChatPage language={language} onLanguageChange={handleLanguageChange} />;
}


// Filename: lib/dify-api.ts (REVISED AND SECURE)
import type { Persona, Language } from "@/types/chat"

export async function sendMessageToDify(
  message: string,
  persona: Persona,
  language: Language,
  conversationId?: string,
): Promise<ReadableStream<Uint8Array> | null> {
  
  const requestBody = {
    inputs: {
      persona,
      language: language === "en" ? "English" : "Bengali",
    },
    query: message,
    user: "legal-ai-user-123", // We can improve this later with real user IDs
    ...(conversationId && { conversation_id: conversationId }),
  }

  try {
    // This is the crucial change. It now calls YOUR server at /api/chat.
    const response = await fetch('/api/chat', { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${response.status} - ${errorData.error || "Failed to fetch response from server"}`)
    }

    return response.body

  } catch (error) {
    console.error("Error calling local chat API:", error)
    throw error
  }
}
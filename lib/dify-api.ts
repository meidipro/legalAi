import type { Persona, Language } from "@/types/chat"

const DIFY_API_KEY = "app-AKLVrjLrC1BKIPl2rbL5hZJD"
const DIFY_API_ENDPOINT = "https://api.dify.ai/v1/chat-messages"

export interface DifyResponse {
  answer: string
  conversation_id: string
  event: string
}

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
    response_mode: "streaming",
    user: "legal-ai-user-123",
    ...(conversationId && { conversation_id: conversationId }),
  }

  try {
    const response = await fetch(DIFY_API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response.body
  } catch (error) {
    console.error("Error fetching from Dify:", error)
    throw error
  }
}

import type { SavedConversation } from "@/types/chat"

export function exportChatToPDF(conversation: SavedConversation) {
  // Create a simple text version for download
  const content = conversation.messages.map((msg) => `${msg.isUser ? "You" : "AI"}: ${msg.content}`).join("\n\n")

  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "_")}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAllChats(conversations: SavedConversation[]) {
  const allContent = conversations
    .map((conv) => {
      const messages = conv.messages.map((msg) => `${msg.isUser ? "You" : "AI"}: ${msg.content}`).join("\n")
      return `=== ${conv.title} ===\nDate: ${conv.lastUpdated.toLocaleDateString()}\n\n${messages}`
    })
    .join("\n\n" + "=".repeat(50) + "\n\n")

  const blob = new Blob([allContent], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "all_legal_ai_conversations.txt"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

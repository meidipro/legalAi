import type { Message } from "@/types/chat"

interface MessageProps {
  message: Message
  isTyping?: boolean
}

export function MessageComponent({ message, isTyping = false }: MessageProps) {
  return (
    <div className={`flex gap-4 max-w-4xl ${message.isUser ? "ml-auto flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 ${message.isUser ? "bg-purple-500" : "bg-blue-500"}`} />
      <div
        className={`px-4 py-3 rounded-xl max-w-2xl ${
          message.isUser ? "bg-blue-500 text-white rounded-tr-none" : "bg-gray-100 text-gray-900 rounded-tl-none"
        } ${isTyping ? "italic text-gray-500" : ""}`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
      </div>
    </div>
  )
}

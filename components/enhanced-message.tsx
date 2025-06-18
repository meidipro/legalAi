import { Download, FileText, ImageIcon } from "lucide-react"
import type { Message } from "@/types/chat"

interface EnhancedMessageProps {
  message: Message
  isTyping?: boolean
  messageId?: string // Add this prop
}

export function EnhancedMessage({ message, isTyping = false, messageId }: EnhancedMessageProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div
      id={messageId ? `message-${messageId}` : undefined}
      className={`flex gap-2 sm:gap-4 max-w-full transition-all duration-300 ${message.isUser ? "ml-auto flex-row-reverse" : ""}`}
    >
      <div
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 ${message.isUser ? "bg-purple-500" : "bg-blue-500"}`}
      />
      <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-2xl">
        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border text-xs sm:text-sm"
              >
                {getFileIcon(attachment.type)}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate max-w-20 sm:max-w-32">{attachment.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
                </div>
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        {message.content && (
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base ${
              message.isUser
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
            } ${isTyping ? "italic text-gray-500 dark:text-gray-400" : ""}`}
          >
            <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
          </div>
        )}
      </div>
    </div>
  )
}

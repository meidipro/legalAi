"use client"

import { useState, useCallback } from "react"
import type { FileAttachment } from "@/types/chat"

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    setUploading(true)
    setError(null)

    try {
      // Create a blob URL for the file (in a real app, you'd upload to a server)
      const url = URL.createObjectURL(file)

      const attachment: FileAttachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url,
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return attachment
    } catch (err) {
      setError("Failed to upload file")
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploadFile, uploading, error }
}

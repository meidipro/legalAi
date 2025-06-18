"use client"

import { useState, useCallback, useMemo } from "react"
import { LegalSearchService } from "@/lib/legal-database"
import type { SearchResult, SearchFilters, SavedConversation, Language } from "@/types/chat"
import { SearchSuggestionsService } from "@/lib/search-suggestions-service"

export function useSearch(conversations: SavedConversation[], language: Language) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    type: ["conversation", "legal_document", "law_section"],
    category: [],
  })

  const legalSearchService = useMemo(() => LegalSearchService.getInstance(), [])
  const searchSuggestionsService = useMemo(() => SearchSuggestionsService.getInstance(), [])

  const searchConversations = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return []

      const results: SearchResult[] = []
      const queryLower = searchQuery.toLowerCase()

      conversations.forEach((conversation) => {
        // Search in conversation title
        if (conversation.title.toLowerCase().includes(queryLower)) {
          results.push({
            id: `conv-title-${conversation.id}`,
            type: "conversation",
            title: conversation.title,
            content: conversation.title,
            snippet: conversation.title,
            relevanceScore: 10,
            conversationId: conversation.id,
            timestamp: conversation.lastUpdated,
          })
        }

        // Search in messages
        conversation.messages.forEach((message, index) => {
          if (message.content.toLowerCase().includes(queryLower)) {
            const snippet = message.content.length > 150 ? message.content.substring(0, 150) + "..." : message.content

            results.push({
              id: `msg-${conversation.id}-${message.id}`,
              type: "conversation",
              title: `${conversation.title} - Message ${index + 1}`,
              content: message.content,
              snippet,
              relevanceScore: message.content.toLowerCase().split(queryLower).length - 1,
              conversationId: conversation.id,
              messageId: message.id,
              timestamp: message.timestamp,
            })
          }
        })
      })

      return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    },
    [conversations],
  )

  const performSearch = useCallback(
    async (searchQuery: string): Promise<SearchResult[]> => {
      if (!searchQuery.trim()) return []

      setIsSearching(true)

      try {
        const results: SearchResult[] = []

        // Search conversations if enabled
        if (filters.type.includes("conversation")) {
          const conversationResults = searchConversations(searchQuery)
          results.push(...conversationResults)
        }

        // Search legal database if enabled
        if (filters.type.includes("law_section")) {
          const legalResults = legalSearchService.searchLegalDatabase(searchQuery, language)
          results.push(...legalResults)
        }

        // Apply additional filters
        let filteredResults = results

        // Filter by date range
        if (filters.dateRange) {
          filteredResults = filteredResults.filter((result) => {
            if (!result.timestamp) return true
            return result.timestamp >= filters.dateRange!.start && result.timestamp <= filters.dateRange!.end
          })
        }

        // Filter by category
        if (filters.category && filters.category.length > 0) {
          filteredResults = filteredResults.filter((result) => {
            if (!result.legalReference) return result.type === "conversation"
            return filters.category!.includes(result.legalReference.category)
          })
        }

        // Sort by relevance score
        const sortedResults = filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

        // Record search in analytics
        searchSuggestionsService.recordSearch(searchQuery, sortedResults.length)

        return sortedResults
      } finally {
        setIsSearching(false)
      }
    },
    [filters, searchConversations, legalSearchService, language, searchSuggestionsService],
  )

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      type: ["conversation", "legal_document", "law_section"],
      category: [],
    })
  }, [])

  return {
    query,
    setQuery,
    isSearching,
    filters,
    updateFilters,
    resetFilters,
    performSearch,
  }
}

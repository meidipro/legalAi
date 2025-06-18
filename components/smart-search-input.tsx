"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Clock, TrendingUp, BookOpen, Lightbulb, X, History } from "lucide-react"
import { SearchSuggestionsService } from "@/lib/search-suggestions-service"
import { translations } from "@/lib/translations"
import type { Language, SearchSuggestion } from "@/types/chat"

interface SmartSearchInputProps {
  language: Language
  onSearch: (query: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
}

export function SmartSearchInput({
  language,
  onSearch,
  onSuggestionSelect,
  placeholder,
  className = "",
}: SmartSearchInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchService = SearchSuggestionsService.getInstance()
  const t = translations[language]

  const updateSuggestions = useCallback(
    (searchQuery: string) => {
      const newSuggestions = searchService.getSuggestions(searchQuery, language, 8)
      setSuggestions(newSuggestions)

      // Get spelling suggestions if no exact matches
      if (searchQuery.length > 2 && newSuggestions.length === 0) {
        const spelling = searchService.getSpellingSuggestions(searchQuery, language)
        setSpellingSuggestions(spelling)
      } else {
        setSpellingSuggestions([])
      }
    },
    [searchService, language],
  )

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateSuggestions(query)
    }, 150)

    return () => clearTimeout(debounceTimer)
  }, [query, updateSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
    if (!query) {
      updateSuggestions("")
    }
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    const totalSuggestions = suggestions.length + spellingSuggestions.length

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : -1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : totalSuggestions - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex])
          } else {
            const spellingIndex = selectedIndex - suggestions.length
            handleSpellingSuggestionClick(spellingSuggestions[spellingIndex])
          }
        } else {
          handleSearch()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      searchService.recordSearch(query.trim(), 0) // Result count will be updated later
      onSearch(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    searchService.recordSearch(suggestion.text, 0)
    onSearch(suggestion.text)
    onSuggestionSelect?.(suggestion)
  }

  const handleSpellingSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    onSearch(suggestion)
  }

  const clearQuery = () => {
    setQuery("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearHistory = () => {
    searchService.clearSearchHistory()
    updateSuggestions(query)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "recent":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "popular":
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case "legal_term":
        return <BookOpen className="w-4 h-4 text-purple-500" />
      case "completion":
        return <Search className="w-4 h-4 text-green-500" />
      case "related":
        return <Lightbulb className="w-4 h-4 text-orange-500" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case "recent":
        return t.recentSearches
      case "popular":
        return t.trending
      case "legal_term":
        return t.legalTerms
      case "completion":
        return t.suggested
      case "related":
        return t.relatedTerms
      default:
        return ""
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t.searchPlaceholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || spellingSuggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Spelling Suggestions */}
          {spellingSuggestions.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t.didYouMean}:</div>
              <div className="flex flex-wrap gap-2">
                {spellingSuggestions.map((suggestion, index) => (
                  <button
                    key={`spelling-${index}`}
                    onClick={() => handleSpellingSuggestionClick(suggestion)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedIndex === suggestions.length + index
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regular Suggestions */}
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-3 cursor-pointer transition-colors ${
                selectedIndex === index ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${index < suggestions.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
            >
              <div className="flex items-center gap-3">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 truncate">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {getSuggestionLabel(suggestion.type)}
                    </span>
                  </div>
                  {suggestion.metadata?.definition && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {suggestion.metadata.definition}
                    </div>
                  )}
                  {suggestion.frequency && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Searched {suggestion.frequency} times
                    </div>
                  )}
                  {suggestion.lastUsed && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last used: {suggestion.lastUsed.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Clear History Option */}
          {suggestions.some((s) => s.type === "recent") && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <History className="w-4 h-4" />
                {t.clearHistory}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

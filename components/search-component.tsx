"use client"
import { useState, useEffect, useRef } from "react"
import { Search, Filter, X, Calendar, FileText, MessageSquare, Scale, BarChart3 } from "lucide-react"
import { useSearch } from "@/hooks/use-search"
import { translations } from "@/lib/translations"
import type { Language, SavedConversation, SearchResult } from "@/types/chat"
import { SmartSearchInput } from "./smart-search-input"
import { SearchAnalyticsDashboard } from "./search-analytics-dashboard"

interface SearchComponentProps {
  language: Language
  conversations: SavedConversation[]
  onResultClick: (result: SearchResult) => void
  onClose: () => void
}

export function SearchComponent({ language, conversations, onResultClick, onClose }: SearchComponentProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  const { query, setQuery, isSearching, filters, updateFilters, resetFilters, performSearch } = useSearch(
    conversations,
    language,
  )

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        const searchResults = await performSearch(query)
        setResults(searchResults)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query, performSearch])

  const handleFilterChange = (filterType: string, value: any) => {
    updateFilters({ [filterType]: value })
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case "legal_document":
        return <FileText className="w-4 h-4 text-green-500" />
      case "law_section":
        return <Scale className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-4 sm:pt-20 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[80vh] flex flex-col">
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="flex-1">
              <SmartSearchInput
                language={language}
                onSearch={(searchQuery) => {
                  setQuery(searchQuery)
                }}
                onSuggestionSelect={(suggestion) => {
                  console.log("Selected suggestion:", suggestion)
                }}
                placeholder={t.searchPlaceholder}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Search Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 sm:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="hidden sm:block p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters - Mobile responsive */}
          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.advancedSearch}</h3>
                <button onClick={resetFilters} className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400">
                  {t.resetFilters}
                </button>
              </div>

              {/* Type Filters - Mobile responsive */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.filterByType}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "conversation", label: t.conversations },
                    { value: "legal_document", label: t.legalDocuments },
                    { value: "law_section", label: t.lawSections },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center p-2 bg-white dark:bg-gray-800 rounded border">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type.value as any)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.type, type.value as any]
                            : filters.type.filter((t) => t !== type.value)
                          handleFilterChange("type", newTypes)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filters - Mobile responsive */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.filterByCategory}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "consumer_rights", label: t.consumerRights },
                    { value: "criminal_procedure", label: t.criminalProcedure },
                    { value: "general_law", label: t.generalLaw },
                  ].map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center p-2 bg-white dark:bg-gray-800 rounded border"
                    >
                      <input
                        type="checkbox"
                        checked={filters.category?.includes(category.value) || false}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(filters.category || []), category.value]
                            : (filters.category || []).filter((c) => c !== category.value)
                          handleFilterChange("category", newCategories)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results - Mobile responsive */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">{t.searchInProgress}</span>
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {results.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t.searchResults} ({results.length})
                  </h3>
                </div>
              )}

              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => onResultClick(result)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {highlightText(result.title, query)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {highlightText(result.snippet, query)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          {t.relevanceScore}: {result.relevanceScore}
                        </span>
                        {result.source && (
                          <span className="flex items-center gap-1">
                            {t.foundIn}: {result.source}
                          </span>
                        )}
                        {result.timestamp && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(result.timestamp)}
                          </span>
                        )}
                        {result.legalReference && (
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            {result.legalReference.section}
                            {result.legalReference.subsection && `(${result.legalReference.subsection})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {showAnalytics && <SearchAnalyticsDashboard language={language} onClose={() => setShowAnalytics(false)} />}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Clock, BookOpen, X } from "lucide-react"
import { SearchSuggestionsService } from "@/lib/search-suggestions-service"
import { translations } from "@/lib/translations"
import type { Language, SearchAnalytics } from "@/types/chat"

interface SearchAnalyticsDashboardProps {
  language: Language
  onClose: () => void
}

export function SearchAnalyticsDashboard({ language, onClose }: SearchAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const searchService = SearchSuggestionsService.getInstance()
  const t = translations[language]

  useEffect(() => {
    setAnalytics(searchService.getSearchAnalytics())
  }, [searchService])

  if (!analytics) return null

  const popularQueries = Array.from(analytics.popularQueries.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const recentQueries = analytics.recentQueries.slice(0, 10)

  const topLegalTerms = Array.from(analytics.legalTermFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Search Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Popular Queries */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {t.popularSearches}
            </h3>
            <div className="space-y-2">
              {popularQueries.length > 0 ? (
                popularQueries.map(([query, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{query}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded ml-2">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No popular searches yet</p>
              )}
            </div>
          </div>

          {/* Recent Queries */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              {t.recentSearches}
            </h3>
            <div className="space-y-2">
              {recentQueries.length > 0 ? (
                recentQueries.map((search, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{search.query}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {search.timestamp.toLocaleDateString()} • {search.resultCount} results
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent searches</p>
              )}
            </div>
          </div>

          {/* Top Legal Terms */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              {t.legalTerms}
            </h3>
            <div className="space-y-2">
              {topLegalTerms.length > 0 ? (
                topLegalTerms.map(([term, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{term}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded ml-2">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No legal terms searched yet</p>
              )}
            </div>
          </div>

          {/* Search Statistics */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Search Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{analytics.recentQueries.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Searches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{analytics.popularQueries.size}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unique Queries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{analytics.legalTermFrequency.size}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Legal Terms Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {analytics.recentQueries.length > 0
                    ? Math.round(
                        analytics.recentQueries.reduce((sum, search) => sum + search.resultCount, 0) /
                          analytics.recentQueries.length,
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Results</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

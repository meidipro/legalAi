export interface SearchSuggestion {
  id: string
  text: string
  type: "recent" | "popular" | "legal_term" | "completion" | "related"
  category?: string
  frequency?: number
  lastUsed?: Date
  metadata?: {
    actName?: string
    section?: string
    definition?: string
    relatedTerms?: string[]
  }
}

export interface SearchHistory {
  query: string
  timestamp: Date
  resultCount: number
  clickedResults: string[]
}

export interface SearchAnalytics {
  popularQueries: Map<string, number>
  recentQueries: SearchHistory[]
  legalTermFrequency: Map<string, number>
  userPreferences: {
    preferredCategories: string[]
    commonSearchPatterns: string[]
  }
}

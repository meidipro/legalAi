export interface SearchResult {
  id: string
  type: "conversation" | "legal_document" | "law_section"
  title: string
  content: string
  snippet: string
  relevanceScore: number
  source?: string
  conversationId?: string
  messageId?: string
  timestamp?: Date
  legalReference?: LegalReference
}

export interface LegalReference {
  actName: string
  section: string
  subsection?: string
  description: string
  category: "consumer_rights" | "criminal_procedure" | "general_law"
}

export interface SearchFilters {
  type: ("conversation" | "legal_document" | "law_section")[]
  dateRange?: {
    start: Date
    end: Date
  }
  persona?: string
  language?: string
  category?: string[]
}

export interface SearchState {
  query: string
  results: SearchResult[]
  isSearching: boolean
  filters: SearchFilters
  totalResults: number
  currentPage: number
  resultsPerPage: number
}

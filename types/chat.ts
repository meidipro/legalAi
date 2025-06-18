export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface ChatState {
  messages: Message[]
  conversationId: string | null
  isTyping: boolean
}

export interface SavedConversation {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
  persona: Persona
}

export type Language = "en" | "bn"
export type Persona = "General Public" | "Law Student" | "Lawyer"
export type Theme = "light" | "dark"

export interface Translations {
  welcomeLogo: string
  welcomeTitle: string
  welcomeSubtitle: string
  getStartedBtn: string
  welcomeDisclaimer: string
  chatLogo: string
  newChatBtn: string
  conversationsTitle: string
  personaPublic: string
  personaStudent: string
  personaLawyer: string
  messagePlaceholder: string
  chatDisclaimer: string
  typing: string
  // New translations
  voiceInput: string
  stopRecording: string
  uploadFile: string
  exportChat: string
  darkMode: string
  lightMode: string
  deleteConversation: string
  fileUploaded: string
  recordingStarted: string
  recordingStopped: string
  exportingChat: string
  conversationDeleted: string
  search: string
  searchPlaceholder: string
  searchResults: string
  noResults: string
  searchFilters: string
  filterByType: string
  filterByDate: string
  filterByCategory: string
  conversations: string
  legalDocuments: string
  lawSections: string
  consumerRights: string
  criminalProcedure: string
  generalLaw: string
  relevanceScore: string
  foundIn: string
  searchInProgress: string
  clearSearch: string
  advancedSearch: string
  exactMatch: string
  dateFrom: string
  dateTo: string
  applyFilters: string
  resetFilters: string
  searchSuggestions: string
  recentSearches: string
  popularSearches: string
  legalTerms: string
  noSuggestions: string
  searchHistory: string
  clearHistory: string
  trending: string
  suggested: string
  autoComplete: string
  didYouMean: string
  relatedTerms: string
}

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

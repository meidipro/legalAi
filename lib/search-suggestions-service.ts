import type { SearchSuggestion, SearchHistory, SearchAnalytics } from "@/types/chat"

// Legal terms database with definitions and related terms
const legalTermsDatabase = {
  en: [
    {
      term: "consumer rights",
      definition: "Legal protections for people who purchase goods and services",
      relatedTerms: ["buyer protection", "warranty", "refund", "complaint"],
      category: "consumer_rights",
    },
    {
      term: "adulteration",
      definition: "The practice of adding inferior or harmful substances to food or medicine",
      relatedTerms: ["food safety", "contamination", "quality control", "health hazard"],
      category: "consumer_rights",
    },
    {
      term: "anti-consumer practice",
      definition: "Business practices that harm or deceive consumers",
      relatedTerms: ["false advertising", "price manipulation", "fraud", "deception"],
      category: "consumer_rights",
    },
    {
      term: "directorate",
      definition: "Government department responsible for consumer protection",
      relatedTerms: ["authority", "regulation", "enforcement", "oversight"],
      category: "consumer_rights",
    },
    {
      term: "complaint procedure",
      definition: "Process for filing grievances against businesses",
      relatedTerms: ["grievance", "dispute resolution", "legal remedy", "redress"],
      category: "consumer_rights",
    },
    {
      term: "manufacturer liability",
      definition: "Legal responsibility of producers for their products",
      relatedTerms: ["product liability", "defective goods", "warranty", "recall"],
      category: "consumer_rights",
    },
    {
      term: "price control",
      definition: "Government regulation of maximum prices for goods and services",
      relatedTerms: ["price fixing", "market regulation", "fair pricing", "monopoly"],
      category: "consumer_rights",
    },
    {
      term: "fake goods",
      definition: "Counterfeit or imitation products sold as genuine",
      relatedTerms: ["counterfeit", "piracy", "trademark violation", "intellectual property"],
      category: "consumer_rights",
    },
  ],
  bn: [
    {
      term: "ভোক্তা অধিকার",
      definition: "পণ্য ও সেবা ক্রয়কারীদের আইনি সুরক্ষা",
      relatedTerms: ["ক্রেতা সুরক্ষা", "ওয়ারেন্টি", "ফেরত", "অভিযোগ"],
      category: "consumer_rights",
    },
    {
      term: "ভেজাল",
      definition: "খাদ্য বা ওষুধে নিম্নমানের বা ক্ষতিকর পদার্থ মেশানো",
      relatedTerms: ["খাদ্য নিরাপত্তা", "দূষণ", "মান নিয়ন্ত্রণ", "স্বাস্থ্য ঝুঁকি"],
      category: "consumer_rights",
    },
    {
      term: "ভোক্তা বিরোধী কার্য",
      definition: "ভোক্তাদের ক্ষতি বা প্রতারণাকারী ব্যবসায়িক অনুশীলন",
      relatedTerms: ["মিথ্যা বিজ্ঞাপন", "মূল্য কারসাজি", "প্রতারণা", "ছলনা"],
      category: "consumer_rights",
    },
  ],
}

// Common search patterns and completions
const searchPatterns = {
  en: [
    "how to file a complaint",
    "consumer rights in Bangladesh",
    "what is adulteration",
    "fake product complaint",
    "price control laws",
    "manufacturer responsibility",
    "refund policy",
    "warranty claims",
    "food safety regulations",
    "medicine quality control",
  ],
  bn: [
    "কীভাবে অভিযোগ দায়ের করবেন",
    "বাংলাদেশে ভোক্তা অধিকার",
    "ভেজাল কী",
    "নকল পণ্যের অভিযোগ",
    "মূল্য নিয়ন্ত্রণ আইন",
    "উৎপাদনকারীর দায়বদ্ধতা",
    "ফেরত নীতি",
    "ওয়ারেন্টি দাবি",
    "খাদ্য নিরাপত্তা নিয়ম",
    "ওষুধের মান নিয়ন্ত্রণ",
  ],
}

export class SearchSuggestionsService {
  private static instance: SearchSuggestionsService
  private analytics: SearchAnalytics
  private readonly STORAGE_KEY = "legal-ai-search-analytics"

  private constructor() {
    this.analytics = this.loadAnalytics()
  }

  public static getInstance(): SearchSuggestionsService {
    if (!SearchSuggestionsService.instance) {
      SearchSuggestionsService.instance = new SearchSuggestionsService()
    }
    return SearchSuggestionsService.instance
  }

  private loadAnalytics(): SearchAnalytics {
    if (typeof window === "undefined") {
      return this.getDefaultAnalytics()
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          popularQueries: new Map(parsed.popularQueries || []),
          recentQueries:
            parsed.recentQueries?.map((q: any) => ({
              ...q,
              timestamp: new Date(q.timestamp),
            })) || [],
          legalTermFrequency: new Map(parsed.legalTermFrequency || []),
          userPreferences: parsed.userPreferences || {
            preferredCategories: [],
            commonSearchPatterns: [],
          },
        }
      }
    } catch (error) {
      console.error("Error loading search analytics:", error)
    }

    return this.getDefaultAnalytics()
  }

  private getDefaultAnalytics(): SearchAnalytics {
    return {
      popularQueries: new Map(),
      recentQueries: [],
      legalTermFrequency: new Map(),
      userPreferences: {
        preferredCategories: [],
        commonSearchPatterns: [],
      },
    }
  }

  private saveAnalytics() {
    if (typeof window === "undefined") return

    try {
      const toSave = {
        popularQueries: Array.from(this.analytics.popularQueries.entries()),
        recentQueries: this.analytics.recentQueries,
        legalTermFrequency: Array.from(this.analytics.legalTermFrequency.entries()),
        userPreferences: this.analytics.userPreferences,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error("Error saving search analytics:", error)
    }
  }

  public recordSearch(query: string, resultCount: number) {
    const searchHistory: SearchHistory = {
      query: query.toLowerCase().trim(),
      timestamp: new Date(),
      resultCount,
      clickedResults: [],
    }

    // Update recent queries (keep last 50)
    this.analytics.recentQueries.unshift(searchHistory)
    this.analytics.recentQueries = this.analytics.recentQueries.slice(0, 50)

    // Update popular queries
    const currentCount = this.analytics.popularQueries.get(searchHistory.query) || 0
    this.analytics.popularQueries.set(searchHistory.query, currentCount + 1)

    // Update legal term frequency
    this.updateLegalTermFrequency(query)

    this.saveAnalytics()
  }

  private updateLegalTermFrequency(query: string) {
    const queryLower = query.toLowerCase()
    const allTerms = [
      ...legalTermsDatabase.en.map((t) => t.term.toLowerCase()),
      ...legalTermsDatabase.bn.map((t) => t.term.toLowerCase()),
    ]

    allTerms.forEach((term) => {
      if (queryLower.includes(term)) {
        const currentCount = this.analytics.legalTermFrequency.get(term) || 0
        this.analytics.legalTermFrequency.set(term, currentCount + 1)
      }
    })
  }

  public getSuggestions(query: string, language: "en" | "bn", limit = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const queryLower = query.toLowerCase().trim()

    if (!queryLower) {
      // Return recent and popular searches when no query
      return this.getDefaultSuggestions(language, limit)
    }

    // 1. Auto-completion suggestions
    const completions = this.getCompletionSuggestions(queryLower, language)
    suggestions.push(...completions.slice(0, 3))

    // 2. Legal term suggestions
    const legalTerms = this.getLegalTermSuggestions(queryLower, language)
    suggestions.push(...legalTerms.slice(0, 3))

    // 3. Recent search suggestions
    const recentMatches = this.getRecentSearchSuggestions(queryLower)
    suggestions.push(...recentMatches.slice(0, 2))

    // 4. Related term suggestions
    const relatedTerms = this.getRelatedTermSuggestions(queryLower, language)
    suggestions.push(...relatedTerms.slice(0, 2))

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter(
      (suggestion, index, self) => index === self.findIndex((s) => s.text === suggestion.text),
    )

    return uniqueSuggestions.slice(0, limit)
  }

  private getDefaultSuggestions(language: "en" | "bn", limit: number): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []

    // Recent searches (last 5)
    const recentSearches = this.analytics.recentQueries.slice(0, 5).map((search, index) => ({
      id: `recent-${index}`,
      text: search.query,
      type: "recent" as const,
      lastUsed: search.timestamp,
    }))

    suggestions.push(...recentSearches)

    // Popular searches
    const popularSearches = Array.from(this.analytics.popularQueries.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([query, frequency], index) => ({
        id: `popular-${index}`,
        text: query,
        type: "popular" as const,
        frequency,
      }))

    suggestions.push(...popularSearches)

    // Common search patterns
    const patterns = searchPatterns[language] || searchPatterns.en
    const patternSuggestions = patterns.slice(0, 3).map((pattern, index) => ({
      id: `pattern-${index}`,
      text: pattern,
      type: "completion" as const,
    }))

    suggestions.push(...patternSuggestions)

    return suggestions.slice(0, limit)
  }

  private getCompletionSuggestions(query: string, language: "en" | "bn"): SearchSuggestion[] {
    const patterns = searchPatterns[language] || searchPatterns.en
    const recentQueries = this.analytics.recentQueries.map((r) => r.query)
    const allCompletions = [...patterns, ...recentQueries]

    return allCompletions
      .filter((completion) => completion.toLowerCase().includes(query) && completion !== query)
      .map((completion, index) => ({
        id: `completion-${index}`,
        text: completion,
        type: "completion" as const,
      }))
  }

  private getLegalTermSuggestions(query: string, language: "en" | "bn"): SearchSuggestion[] {
    const terms = legalTermsDatabase[language] || legalTermsDatabase.en

    return terms
      .filter((term) => term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query))
      .map((term, index) => ({
        id: `legal-${index}`,
        text: term.term,
        type: "legal_term" as const,
        category: term.category,
        metadata: {
          definition: term.definition,
          relatedTerms: term.relatedTerms,
        },
      }))
  }

  private getRecentSearchSuggestions(query: string): SearchSuggestion[] {
    return this.analytics.recentQueries
      .filter((search) => search.query.includes(query) && search.query !== query)
      .slice(0, 3)
      .map((search, index) => ({
        id: `recent-match-${index}`,
        text: search.query,
        type: "recent" as const,
        lastUsed: search.timestamp,
      }))
  }

  private getRelatedTermSuggestions(query: string, language: "en" | "bn"): SearchSuggestion[] {
    const terms = legalTermsDatabase[language] || legalTermsDatabase.en
    const relatedSuggestions: SearchSuggestion[] = []

    terms.forEach((term) => {
      if (term.term.toLowerCase().includes(query)) {
        term.relatedTerms.forEach((relatedTerm, index) => {
          relatedSuggestions.push({
            id: `related-${term.term}-${index}`,
            text: relatedTerm,
            type: "related" as const,
            metadata: {
              definition: `Related to ${term.term}`,
              relatedTerms: [term.term],
            },
          })
        })
      }
    })

    return relatedSuggestions
  }

  public clearSearchHistory() {
    this.analytics.recentQueries = []
    this.analytics.popularQueries.clear()
    this.saveAnalytics()
  }

  public getSearchAnalytics() {
    return { ...this.analytics }
  }

  public getSpellingSuggestions(query: string, language: "en" | "bn"): string[] {
    // Simple spelling correction based on legal terms
    const terms = legalTermsDatabase[language] || legalTermsDatabase.en
    const allTerms = terms.map((t) => t.term.toLowerCase())
    const patterns = searchPatterns[language] || searchPatterns.en

    const suggestions: string[] = []
    const queryLower = query.toLowerCase()

    // Find close matches using simple edit distance
    const allSearchableTerms = [...allTerms, ...patterns.map((p) => p.toLowerCase())]

    allSearchableTerms.forEach((term) => {
      if (this.calculateEditDistance(queryLower, term) <= 2 && term !== queryLower) {
        suggestions.push(term)
      }
    })

    return suggestions.slice(0, 3)
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }
}

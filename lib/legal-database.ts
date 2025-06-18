import type { SearchResult } from "@/types/chat"

// Legal database extracted from the Consumer Rights Protection Act, 2009
export const legalDatabase = {
  "consumer-rights-act-2009": {
    title: "Consumer Rights Protection Act, 2009",
    titleBn: "ভোক্তা-অধিকার সংরক্ষণ আইন, ২০০৯",
    sections: [
      {
        section: "2",
        subsection: "19",
        title: "Definition of Consumer",
        titleBn: "ভোক্তার সংজ্ঞা",
        content: `"consumer" means any person,—
(a) who, without resale or commercial purpose,—
(i) buys any goods for a consideration which has been paid or promised to be paid;
(ii) buys any goods for a consideration which has been partly paid and partly promised; or
(iii) buys any goods for a consideration under any system of deferred payment or installment basis;
(b) who uses any goods bought under clause (a) with the consent of the buyer;
(c) who buys any goods and uses it commercially for the purpose of earning his livelihood by means of self-employment;`,
        contentBn: `"ভোক্তা" অর্থ নিম্নবর্ণিত ব্যক্তি বা ব্যক্তিগণ, যিনি বা যাহারা এই আইনের অধীন কোন অভিযোগ দায়ের করেন—
(ক) কোন ভোক্তা ;
(খ) একই স্বার্থসংশ্লিষ্ট এক বা একাধিক ভোক্তা;
(গ) কোন আইনের অধীন নিবন্ধিত কোন ভোক্তা সংস্থা;`,
        category: "consumer_rights" as const,
      },
      {
        section: "2",
        subsection: "20",
        title: "Anti-consumer Right Practice",
        titleBn: "ভোক্তা-অধিকার বিরোধী কার্য",
        content: `"anti-consumer right practice" means,—
(a) to sell or offer to sell any goods, medicine or service at a higher price than the fixed price under any Act or rules;
(b) to sell or offer to sell adulterated goods or medicine knowingly;
(c) to sell or offer to sell any goods containing any ingredient which is extremely injurious to human health;
(d) to deceive consumers by untrue or false advertisement for the purpose of selling any goods or service;
(e) not to sell or deliver properly any goods or services promised to sell or deliver in consideration of money;`,
        contentBn: `"ভোক্তা-অধিকার বিরোধী কার্য" অর্থ,—
(ক) কোন আইন বা বিধির অধীন নির্ধারিত মূল্য অপেক্ষা অধিক মূল্যে কোন পণ্য, ঔষধ বা সেবা বিক্রয় করা বা বিক্রয়ের প্রস্তাব করা;
(খ) জেনেশুনে ভেজাল পণ্য বা ঔষধ বিক্রয় করা বা বিক্রয়ের প্রস্তাব করা;
(গ) মানুষের স্বাস্থ্যের জন্য অত্যন্ত ক্ষতিকর এমন কোন উপাদান সংমিশ্রিত পণ্য বিক্রয় করা বা বিক্রয়ের প্রস্তাব করা;`,
        category: "consumer_rights" as const,
      },
      {
        section: "5",
        title: "National Consumer Rights Protection Council",
        titleBn: "জাতীয় ভোক্তা-অধিকার সংরক্ষণ পরিষদ প্রতিষ্ঠা",
        content: `For the purpose of this Act, there shall be a Council called the National Consumer Rights Protection Council which shall consist of the following members, namely:—
(1) Minister in charge of the Ministry of Commerce, who shall also be its Chairman;
(2) Secretary, Ministry of Commerce, ex-officio;
(3) Director General, National Security Intelligence, ex-officio;`,
        contentBn: `এই আইনের উদ্দেশ্য পূরণকল্পে জাতীয় ভোক্তা-অধিকার সংরক্ষণ পরিষদ নামে একটি পরিষদ থাকিবে, যাহা নিম্নরূপ সদস্য সমন্বয়ে গঠিত হইবে, যথাঃ—
(১) বাণিজ্য মন্ত্রণালয়ের দায়িত্বে নিয়োজিত মন্ত্রী, যিনি ইহার চেয়ারম্যানও হইবেন;
(২) বাণিজ্য মন্ত্রণালয়ের সচিব, পদাধিকারবলে;`,
        category: "consumer_rights" as const,
      },
      {
        section: "18",
        title: "Directorate of National Consumer Rights Protection",
        titleBn: "জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর প্রতিষ্ঠা",
        content: `For the purpose of this Act, there shall be a Directorate called the Directorate of National Consumer Rights Protection.`,
        contentBn: `এই আইনের উদ্দেশ্য পূরণকল্পে জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর নামে একটি অধিদপ্তর থাকিবে।`,
        category: "consumer_rights" as const,
      },
    ],
  },
}

export class LegalSearchService {
  private static instance: LegalSearchService
  private searchIndex: Map<string, SearchResult[]> = new Map()

  private constructor() {
    this.buildSearchIndex()
  }

  public static getInstance(): LegalSearchService {
    if (!LegalSearchService.instance) {
      LegalSearchService.instance = new LegalSearchService()
    }
    return LegalSearchService.instance
  }

  private buildSearchIndex() {
    // Build search index from legal database
    Object.entries(legalDatabase).forEach(([actId, act]) => {
      act.sections.forEach((section) => {
        const searchResult: SearchResult = {
          id: `${actId}-${section.section}${section.subsection ? `-${section.subsection}` : ""}`,
          type: "law_section",
          title: `${act.title} - Section ${section.section}${section.subsection ? `(${section.subsection})` : ""}: ${section.title}`,
          content: section.content,
          snippet: this.createSnippet(section.content),
          relevanceScore: 0,
          source: act.title,
          legalReference: {
            actName: act.title,
            section: section.section,
            subsection: section.subsection,
            description: section.title,
            category: section.category,
          },
        }

        // Index by keywords
        const keywords = this.extractKeywords(section.content + " " + section.title)
        keywords.forEach((keyword) => {
          if (!this.searchIndex.has(keyword)) {
            this.searchIndex.set(keyword, [])
          }
          this.searchIndex.get(keyword)!.push(searchResult)
        })
      })
    })
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => !["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"].includes(word))
  }

  private createSnippet(content: string, maxLength = 150): string {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  private calculateRelevanceScore(searchTerms: string[], content: string, title: string): number {
    let score = 0
    const contentLower = content.toLowerCase()
    const titleLower = title.toLowerCase()

    searchTerms.forEach((term) => {
      const termLower = term.toLowerCase()
      // Title matches are worth more
      const titleMatches = (titleLower.match(new RegExp(termLower, "g")) || []).length
      const contentMatches = (contentLower.match(new RegExp(termLower, "g")) || []).length

      score += titleMatches * 10 + contentMatches * 2
    })

    return score
  }

  public searchLegalDatabase(query: string, language = "en"): SearchResult[] {
    if (!query.trim()) return []

    const searchTerms = this.extractKeywords(query)
    const results = new Map<string, SearchResult>()

    // Search through indexed content
    searchTerms.forEach((term) => {
      const matches = this.searchIndex.get(term) || []
      matches.forEach((match) => {
        if (results.has(match.id)) {
          // Increase relevance score for multiple matches
          results.get(match.id)!.relevanceScore += 1
        } else {
          const result = { ...match }
          result.relevanceScore = this.calculateRelevanceScore(searchTerms, result.content, result.title)
          results.set(match.id, result)
        }
      })
    })

    // Convert to array and sort by relevance
    return Array.from(results.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20) // Limit results
  }
}

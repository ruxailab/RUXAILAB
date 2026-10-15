const ACTIONABLE_ISSUE = /\b(too many|too much|confus(?:ing|ed|ion)|unclear|difficult|hard|struggl(?:e|ed|ing)|frustrat(?:ing|ed|ion)|broken|slow|missing|error|problem|issue)\b/i
const SUGGESTED_CHANGE = /\b(summary|summarize|overview|recap)\b.*\b(submit|send|checkout|confirm)\b/i

const keywordPriority = (phrase) => {
  if (SUGGESTED_CHANGE.test(phrase)) return 2
  if (ACTIONABLE_ISSUE.test(phrase)) return 1
  return 0
}

/**
 * Combines the per-topic ranked keyword lists for the session-wide cloud.
 * Explicit requests and friction findings should remain discoverable even
 * when another topic has a highly ranked but neutral phrase.
 */
export function rankKeywordCloud(perTopicAnalysis = {}) {
  const entries = new Map()

  Object.values(perTopicAnalysis).forEach((topicAnalysis) => {
    const keywords = topicAnalysis?.keywords ?? []
    keywords.forEach((term, index) => {
      const entry = entries.get(term) ?? { term, weight: 0, priority: keywordPriority(term) }
      entry.weight += keywords.length - index
      entries.set(term, entry)
    })
  })

  return [...entries.values()]
    .sort((a, b) => b.priority - a.priority || b.weight - a.weight || a.term.localeCompare(b.term))
    .slice(0, 20)
}

import { extractKeywords } from './keywordExtractor.js'
import { extractThemes } from './themeExtractor.js'
import { computeConsensus } from './consensusAnalyzer.js'
import { summarize } from './summarizer.js'
import {
  flattenSessionMessages,
  groupTextByTopicAndParticipant,
} from './flattenSession.js'

/**
 * Runs the full Tier 1 ($0, always-available) NLP pipeline against one
 * finished Focus Group session: per-topic keywords, an extractive summary,
 * wording similarity, cautious quote-backed stance suggestions, and
 * cross-topic theme suggestions. Similarity is not treated as agreement.
 *
 * @param {{ sessionId: string, messages: Object, participantIds?: Set<string> }} session - a persisted session record
 * @returns {{
 *   perTopic: Object,   // { [topicId]: { keywords, summary, consensus } }
 *   suggestedThemes: Array,
 * }}
 */
export function runAnalysisPipeline(session) {
  const flatMessages = flattenSessionMessages(session, session.participantIds)
  const byTopic = groupTextByTopicAndParticipant(flatMessages)

  const perTopic = {}
  Object.entries(byTopic).forEach(([topicId, responses]) => {
    const topicText = responses.map((r) => r.text).join(' ')
    perTopic[topicId] = {
      // Keep participant boundaries so phrase support can be counted per
      // person rather than letting one verbose participant dominate RAKE.
      keywords: extractKeywords(responses),
      summary: summarize(topicText),
      consensus: computeConsensus(responses),
    }
  })

  const suggestedThemes = extractThemes(flatMessages)

  return { perTopic, suggestedThemes }
}

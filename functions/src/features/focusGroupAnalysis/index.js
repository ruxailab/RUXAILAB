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
 * a consensus/divergence score, and cross-topic theme suggestions.
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
      keywords: extractKeywords(topicText),
      summary: summarize(topicText),
      consensus: computeConsensus(responses),
    }
  })

  const suggestedThemes = extractThemes(flatMessages)

  return { perTopic, suggestedThemes }
}

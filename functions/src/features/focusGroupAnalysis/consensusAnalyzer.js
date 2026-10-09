import { computeTfIdf, cosineSimilarity, tokenize } from './textVectorize.js'

/**
 * Lexical similarity scoring for one topic's participant responses.
 * This reports shared wording, not agreement: TF-IDF/cosine cannot reliably
 * distinguish opposing stances or recognize paraphrases. The legacy
 * sharedOpinions/divergencePoints fields remain empty for stored-schema
 * compatibility until a validated stance-analysis method is available.
 *
 * @param {Array<{ participantId: string, text: string }>} responses
 *   One aggregated text block per participant for this topic.
 * @returns {{ score: number|null, respondentCount: number, sharedOpinions: [], divergencePoints: [], alignment: Object }}
 */
export function computeConsensus(responses) {
  const nonEmpty = responses.filter((r) => r.text && r.text.trim())
  if (nonEmpty.length < 2) {
    // One person's response is a perspective, not group consensus. Returning
    // 1 here made a single-participant session look like unanimous agreement.
    return {
      score: null,
      respondentCount: nonEmpty.length,
      sharedOpinions: [],
      divergencePoints: [],
      alignment: {},
    }
  }

  const vectors = computeTfIdf(nonEmpty.map((r) => tokenize(r.text)))

  const pairwise = []
  const avgSimilarity = new Map(nonEmpty.map((r) => [r.participantId, 0]))
  for (let i = 0; i < nonEmpty.length; i += 1) {
    for (let j = i + 1; j < nonEmpty.length; j += 1) {
      const sim = cosineSimilarity(vectors[i], vectors[j])
      pairwise.push(sim)
      avgSimilarity.set(
        nonEmpty[i].participantId,
        avgSimilarity.get(nonEmpty[i].participantId) + sim / (nonEmpty.length - 1),
      )
      avgSimilarity.set(
        nonEmpty[j].participantId,
        avgSimilarity.get(nonEmpty[j].participantId) + sim / (nonEmpty.length - 1),
      )
    }
  }

  const score = pairwise.reduce((sum, s) => sum + s, 0) / pairwise.length
  const alignment = {}
  nonEmpty.forEach((r) => {
    alignment[r.participantId] = Math.round(avgSimilarity.get(r.participantId) * 100) / 100
  })

  return {
    score: Math.round(score * 100) / 100,
    respondentCount: nonEmpty.length,
    sharedOpinions: [],
    divergencePoints: [],
    alignment,
  }
}

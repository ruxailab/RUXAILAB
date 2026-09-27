import { computeTfIdf, cosineSimilarity, tokenize } from './textVectorize.js'

/**
 * Consensus/divergence scoring for one topic's participant responses.
 * High average pairwise similarity across participants → consensus. A
 * response whose average similarity to everyone else falls well below the
 * group's own average is flagged as a divergence point rather than folded
 * into the shared score.
 *
 * @param {Array<{ participantId: string, text: string }>} responses
 *   One aggregated text block per participant for this topic.
 * @returns {{
 *   score: number,
 *   sharedOpinions: Array<{ statement: string, supportingParticipants: string[], confidence: number }>,
 *   divergencePoints: Array<{ description: string, perspectives: Array<{ position: string, participantIds: string[] }> }>,
 *   alignment: Object,   // { [participantId]: 0-1 similarity to the rest of the group }
 * }}
 */
export function computeConsensus(responses) {
  const nonEmpty = responses.filter((r) => r.text && r.text.trim())
  if (nonEmpty.length < 2) {
    const alignment = {}
    nonEmpty.forEach((r) => {
      alignment[r.participantId] = 1
    })
    return { score: nonEmpty.length ? 1 : 0, sharedOpinions: [], divergencePoints: [], alignment }
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
  const groupAvg = score

  // A participant whose average alignment to the group sits well below the
  // group's own average is treated as holding a distinct position.
  const outliers = nonEmpty.filter(
    (r) => avgSimilarity.get(r.participantId) < groupAvg - 0.15,
  )
  const aligned = nonEmpty.filter(
    (r) => avgSimilarity.get(r.participantId) >= groupAvg - 0.15,
  )

  const sharedOpinions =
    aligned.length > 0
      ? [
          {
            statement: aligned[0].text.slice(0, 200),
            supportingParticipants: aligned.map((r) => r.participantId),
            confidence: Math.round(groupAvg * 100) / 100,
          },
        ]
      : []

  const divergencePoints =
    outliers.length > 0
      ? [
          {
            description: 'Responses that diverge from the group’s shared view',
            perspectives: [
              {
                position: aligned[0]?.text.slice(0, 200) ?? '',
                participantIds: aligned.map((r) => r.participantId),
              },
              ...outliers.map((r) => ({
                position: r.text.slice(0, 200),
                participantIds: [r.participantId],
              })),
            ],
          },
        ]
      : []

  const alignment = {}
  nonEmpty.forEach((r) => {
    alignment[r.participantId] = Math.round(avgSimilarity.get(r.participantId) * 100) / 100
  })

  return {
    score: Math.round(score * 100) / 100,
    sharedOpinions,
    divergencePoints,
    alignment,
  }
}

import { computeTfIdf, cosineSimilarity, tokenize } from './textVectorize.js'
import { extractKeywords } from './keywordExtractor.js'

const MIN_MESSAGES_PER_TOPIC = 5
const MIN_PARTICIPANTS_PER_TOPIC = 3
const MIN_PARTICIPANTS_PER_SUGGESTION = 2
const MIN_CLUSTER_SIMILARITY = 0.12

/**
 * Topic-scoped TF-IDF + K-means candidate grouping, operating at
 * individual-message granularity so each suggested theme's `responseRefs` point at the same
 * (sessionId, topicId, messageId) triples the manual ThematicEditor board
 * uses — an NLP-suggested theme is just a `Theme` with `source: 'nlp'`,
 * editable/mergeable in the same drag-and-drop UI as a manually authored one.
 *
 * @param {Array<{ sessionId: string, topicId: string, messageId: string, participantId: string, text: string }>} messages
 * @param {{ k?: number, keywordsPerTheme?: number }} [options]
 * @returns {Array<{ id, label, keywords, responseRefs, frequency, source }>}
 */
export function extractThemes(messages, { k, keywordsPerTheme = 4 } = {}) {
  const nonEmpty = messages.filter((m) => m.text && m.text.trim())
  if (nonEmpty.length === 0) return []

  // Never cluster across discussion topics: shared words across unrelated
  // prompts otherwise create convincing-looking but meaningless groups.
  const byTopic = new Map()
  nonEmpty.forEach((message) => {
    const topicMessages = byTopic.get(message.topicId) ?? []
    topicMessages.push(message)
    byTopic.set(message.topicId, topicMessages)
  })

  return [...byTopic.entries()].flatMap(([topicId, topicMessages]) => {
    const participantCount = new Set(topicMessages.map((m) => m.participantId)).size

    // Small focus-group samples do not provide enough evidence for automatic
    // clustering. Keep the literal phrase suggestions available elsewhere,
    // and let the researcher create themes manually in these cases.
    if (
      topicMessages.length < MIN_MESSAGES_PER_TOPIC ||
      participantCount < MIN_PARTICIPANTS_PER_TOPIC
    ) {
      return []
    }

    const defaultK = Math.max(2, Math.round(topicMessages.length / 3))
    const chosenK = Math.max(2, Math.min(k ?? defaultK, 5, topicMessages.length))
    const vectors = computeTfIdf(topicMessages.map((m) => tokenize(m.text)))
    const assignments = kmeans(vectors, chosenK)

    const clusters = new Map()
    assignments.forEach((clusterIndex, i) => {
      if (!clusters.has(clusterIndex)) clusters.set(clusterIndex, [])
      clusters.get(clusterIndex).push(i)
    })

    return [...clusters.entries()].flatMap(([clusterIndex, indices]) => {
      const members = indices.map((i) => topicMessages[i])
      const memberVectors = indices.map((i) => vectors[i])
      const distinctParticipants = new Set(members.map((m) => m.participantId))

      // A suggestion must be supported by more than one person and show at
      // least modest lexical cohesion. K-means always assigns every item, so
      // this gate prevents it from presenting every forced cluster as a theme.
      if (
        distinctParticipants.size < MIN_PARTICIPANTS_PER_SUGGESTION ||
        meanPairwiseSimilarity(memberVectors) < MIN_CLUSTER_SIMILARITY
      ) {
        return []
      }

      const keywords = topTerms(memberVectors, keywordsPerTheme)
      const phrases = extractKeywords(
        members.map((member) => member.text).join('. '),
        { maxKeywords: keywordsPerTheme },
      )
      const phraseLabel = phrases
        .map((phrase) => phrase.trim().split(/\s+/))
        .flatMap((words) => {
          const windows = []
          for (let size = words.length; size >= 2; size -= 1) {
            for (let start = 0; start <= words.length - size; start += 1) {
              windows.push(words.slice(start, start + size).join(' '))
            }
          }
          return windows
        })
        .find((phrase) => members.some((member) =>
          member.text.toLowerCase().includes(phrase),
        ))
      const safeSessionId = String(members[0].sessionId).replace(/[^a-zA-Z0-9_-]/g, '-')
      const safeTopicId = String(topicId).replace(/[^a-zA-Z0-9_-]/g, '-')

      return [{
        // Theme IDs live at the study-wide answer-document level; scope them
        // to both session and topic so independent clusters cannot collide.
        id: `${safeSessionId}-nlp-${safeTopicId}-theme-${clusterIndex}`,
        label: phraseLabel || 'Related responses',
        keywords,
        responseRefs: members.map((m) => ({
          sessionId: m.sessionId,
          topicId: m.topicId,
          messageId: m.messageId,
          participantId: m.participantId,
          excerpt: m.text,
        })),
        frequency: distinctParticipants.size,
        source: 'nlp',
      }]
    })
  })
}

function meanPairwiseSimilarity(vectors) {
  if (vectors.length < 2) return 0
  let total = 0
  let pairs = 0
  for (let i = 0; i < vectors.length; i += 1) {
    for (let j = i + 1; j < vectors.length; j += 1) {
      total += cosineSimilarity(vectors[i], vectors[j])
      pairs += 1
    }
  }
  return total / pairs
}

/** Lloyd's K-means over sparse TF-IDF vectors using cosine similarity. */
function kmeans(vectors, k, { iterations = 10 } = {}) {
  if (vectors.length <= k) return vectors.map((_, i) => i)

  let centroids = kmeansPlusPlusInit(vectors, k)
  let assignments = new Array(vectors.length).fill(0)

  for (let iter = 0; iter < iterations; iter += 1) {
    const nextAssignments = vectors.map((vector) => nearestCentroid(vector, centroids))
    const converged = nextAssignments.every((a, i) => a === assignments[i])
    assignments = nextAssignments
    if (converged && iter > 0) break

    centroids = centroids.map((_, clusterIndex) => {
      const members = vectors.filter((_, i) => assignments[i] === clusterIndex)
      return members.length ? averageVector(members) : centroids[clusterIndex]
    })
  }

  return assignments
}

/** kmeans++-style init: spread initial centroids apart for stable small-n clustering. */
function kmeansPlusPlusInit(vectors, k) {
  const centroids = [vectors[0]]
  while (centroids.length < k) {
    let farthest = vectors[0]
    let farthestDistance = -Infinity
    vectors.forEach((vector) => {
      const distance = Math.min(
        ...centroids.map((c) => 1 - cosineSimilarity(vector, c)),
      )
      if (distance > farthestDistance) {
        farthestDistance = distance
        farthest = vector
      }
    })
    centroids.push(farthest)
  }
  return centroids
}

function nearestCentroid(vector, centroids) {
  let best = 0
  let bestSimilarity = -Infinity
  centroids.forEach((centroid, index) => {
    const similarity = cosineSimilarity(vector, centroid)
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity
      best = index
    }
  })
  return best
}

/** Term-wise mean of a set of sparse vectors — the new cluster centroid. */
function averageVector(vectors) {
  const sums = {}
  vectors.forEach((vector) => {
    Object.entries(vector).forEach(([term, weight]) => {
      sums[term] = (sums[term] ?? 0) + weight
    })
  })
  const centroid = {}
  Object.entries(sums).forEach(([term, sum]) => {
    centroid[term] = sum / vectors.length
  })
  return centroid
}

/** Highest-weight terms across a cluster's member vectors, for a theme label/keywords. */
function topTerms(vectors, count) {
  const totals = {}
  vectors.forEach((vector) => {
    Object.entries(vector).forEach(([term, weight]) => {
      totals[term] = (totals[term] ?? 0) + weight
    })
  })
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([term]) => term)
}

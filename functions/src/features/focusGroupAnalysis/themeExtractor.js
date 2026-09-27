import { computeTfIdf, cosineSimilarity, tokenize } from './textVectorize.js'

/**
 * TF-IDF + K-means theme clustering, operating at individual-message
 * granularity so each suggested theme's `responseRefs` point at the same
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

  // Roughly one theme per three messages, bounded to a reviewable range and
  // never more than there are messages to cluster.
  const defaultK = Math.round(nonEmpty.length / 3) || 1
  const chosenK = Math.max(1, Math.min(k ?? defaultK, 5, nonEmpty.length))

  const vectors = computeTfIdf(nonEmpty.map((m) => tokenize(m.text)))
  const assignments = kmeans(vectors, chosenK)

  const clusters = new Map()
  assignments.forEach((clusterIndex, i) => {
    if (!clusters.has(clusterIndex)) clusters.set(clusterIndex, [])
    clusters.get(clusterIndex).push(i)
  })

  return [...clusters.entries()].map(([clusterIndex, indices]) => {
    const members = indices.map((i) => nonEmpty[i])
    const memberVectors = indices.map((i) => vectors[i])
    const keywords = topTerms(memberVectors, keywordsPerTheme)

    return {
      // Theme IDs live at the study-wide answer-document level; scope them
      // to this session so cluster 0 from two sessions cannot collide.
      id: `${String(nonEmpty[0].sessionId).replace(/[^a-zA-Z0-9_-]/g, '-')}-nlp-theme-${clusterIndex}`,
      label: keywords.slice(0, 2).join(' ') || `Theme ${clusterIndex + 1}`,
      keywords,
      responseRefs: members.map((m) => ({
        sessionId: m.sessionId,
        topicId: m.topicId,
        messageId: m.messageId,
        participantId: m.participantId,
        excerpt: m.text,
      })),
      frequency: new Set(members.map((m) => m.participantId)).size,
      source: 'nlp',
    }
  })
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

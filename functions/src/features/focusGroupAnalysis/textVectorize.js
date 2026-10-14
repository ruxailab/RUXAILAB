/**
 * Shared text-processing primitives for the Focus Group Tier 1 NLP pipeline
 * (keyword extraction, theme clustering, consensus scoring, summarization).
 * Deliberately dependency-free: focus group sessions produce a handful of
 * short participant messages per topic, well within reach of classical
 * TF-IDF/cosine methods with no model download or external API call.
 */

// Small, general-purpose English stopword list. Not exhaustive — good enough
// to keep RAKE phrase boundaries and TF-IDF term weights from being
// dominated by function words at this corpus size.
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an',
  'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before',
  'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
])

/** Lowercase, strip punctuation, split on whitespace, drop stopwords/empties. */
export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOPWORDS.has(token))
}

/** Splits free text into sentences on `.`/`!`/`?` boundaries. */
export function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

/** Term frequency map for one document's tokens. */
export function termFrequency(tokens) {
  const counts = {}
  tokens.forEach((token) => {
    counts[token] = (counts[token] ?? 0) + 1
  })
  return counts
}

/**
 * TF-IDF vectors for a list of documents (each a token array).
 *
 * @param {string[][]} documents
 * @returns {Object[]} one { [term]: weight } map per document, same order
 */
export function computeTfIdf(documents) {
  const docFrequency = {}
  const termFreqs = documents.map((tokens) => {
    const tf = termFrequency(tokens)
    Object.keys(tf).forEach((term) => {
      docFrequency[term] = (docFrequency[term] ?? 0) + 1
    })
    return tf
  })

  const n = documents.length
  return termFreqs.map((tf) => {
    const vector = {}
    const totalTerms = Object.values(tf).reduce((sum, c) => sum + c, 0) || 1
    Object.entries(tf).forEach(([term, count]) => {
      const idf = Math.log((n + 1) / (docFrequency[term] + 1)) + 1
      vector[term] = (count / totalTerms) * idf
    })
    return vector
  })
}

/** Cosine similarity between two sparse { [term]: weight } vectors. */
export function cosineSimilarity(vectorA, vectorB) {
  const termsA = Object.keys(vectorA)
  let dot = 0
  termsA.forEach((term) => {
    if (term in vectorB) dot += vectorA[term] * vectorB[term]
  })

  const magnitude = (vector) =>
    Math.sqrt(Object.values(vector).reduce((sum, w) => sum + w * w, 0))

  const magA = magnitude(vectorA)
  const magB = magnitude(vectorB)
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

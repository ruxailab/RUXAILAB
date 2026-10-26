import {
  computeTfIdf,
  cosineSimilarity,
  splitSentences,
  tokenize,
} from './textVectorize.js'

/**
 * TextRank extractive summarization: sentences are graph nodes, cosine
 * similarity between sentence TF-IDF vectors are edge weights, PageRank
 * ranks the sentences. Preserves participants' actual words (extractive),
 * never generates new text — matches the proposal's "preserve actual
 * words, not generative paraphrase" requirement, and needs no model.
 *
 * @param {string} text
 * @param {{ maxSentences?: number, iterations?: number, damping?: number }} [options]
 * @returns {string} up to maxSentences sentences, in original order
 */
export function summarize(
  text,
  { maxSentences = 3, iterations = 20, damping = 0.85 } = {},
) {
  const sentences = splitSentences(text)
  if (sentences.length <= maxSentences) return sentences.join(' ')

  const vectors = computeTfIdf(sentences.map((s) => tokenize(s)))
  const n = sentences.length

  // Similarity matrix, row-normalized so each node's outgoing weight sums to 1.
  const similarity = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (i === j) continue
      similarity[i][j] = cosineSimilarity(vectors[i], vectors[j])
    }
    const rowSum = similarity[i].reduce((sum, w) => sum + w, 0)
    if (rowSum > 0) {
      similarity[i] = similarity[i].map((w) => w / rowSum)
    }
  }

  let scores = new Array(n).fill(1 / n)
  for (let iter = 0; iter < iterations; iter += 1) {
    const next = new Array(n).fill((1 - damping) / n)
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        if (similarity[j][i] > 0) {
          next[i] += damping * similarity[j][i] * scores[j]
        }
      }
    }
    scores = next
  }

  const topIndices = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((entry) => entry.index)
    .sort((a, b) => a - b) // restore original reading order

  return topIndices.map((index) => sentences[index]).join(' ')
}

import { STOPWORDS } from './textVectorize.js'

/**
 * RAKE (Rapid Automatic Keyword Extraction) — pure string co-occurrence
 * statistics, no model or API call. Candidate phrases are the runs of
 * non-stopword words between stopwords/punctuation; each word's score is
 * degree(co-occurrence within candidate phrases) / frequency, and a
 * phrase's score is the sum of its words' scores. Multi-word phrases
 * naturally outrank single common words, which is what makes RAKE better
 * suited here than picking top single TF-IDF terms.
 *
 * @param {string} text
 * @param {{ maxKeywords?: number }} [options]
 * @returns {string[]} candidate phrases, highest score first
 */
export function extractKeywords(text, { maxKeywords = 5 } = {}) {
  const candidates = splitIntoCandidatePhrases(text)
  if (candidates.length === 0) return []

  const wordScores = scoreWords(candidates)

  const phraseScores = new Map()
  candidates.forEach((phraseWords) => {
    const phrase = phraseWords.join(' ')
    const score = phraseWords.reduce(
      (sum, word) => sum + (wordScores.get(word) ?? 0),
      0,
    )
    // Keep the highest score seen for a repeated phrase rather than summing
    // duplicates, so a phrase mentioned many times doesn't just inflate by
    // repetition count.
    if (!phraseScores.has(phrase) || phraseScores.get(phrase) < score) {
      phraseScores.set(phrase, score)
    }
  })

  return [...phraseScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([phrase]) => phrase)
}

/**
 * Splits raw text into candidate phrases: runs of non-stopword words,
 * additionally broken at sentence/clause punctuation. Punctuation must be
 * treated as a phrase delimiter (not just stopwords) — otherwise stripping
 * it to whitespace silently merges the end of one sentence into the start
 * of the next into a single, artificially long candidate phrase.
 */
function splitIntoCandidatePhrases(text) {
  const clauses = String(text || '').split(/[.!?,;:()]+/)

  const phrases = []
  clauses.forEach((clause) => {
    const words = clause
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .split(/\s+/)
      .filter(Boolean)

    let current = []
    words.forEach((word) => {
      if (STOPWORDS.has(word)) {
        if (current.length) phrases.push(current)
        current = []
      } else {
        current.push(word)
      }
    })
    if (current.length) phrases.push(current)
  })
  return phrases
}

/** RAKE word score: degree(co-occurrence)/frequency, per Rose et al. 2010. */
function scoreWords(candidates) {
  const frequency = new Map()
  const degree = new Map()

  candidates.forEach((phraseWords) => {
    const phraseDegree = phraseWords.length - 1
    phraseWords.forEach((word) => {
      frequency.set(word, (frequency.get(word) ?? 0) + 1)
      degree.set(word, (degree.get(word) ?? 0) + phraseDegree)
    })
  })

  const scores = new Map()
  frequency.forEach((freq, word) => {
    const wordDegree = degree.get(word) + freq // co-occurrence + itself
    scores.set(word, wordDegree / freq)
  })
  return scores
}

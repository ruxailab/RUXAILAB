import { STOPWORDS } from './textVectorize.js'

// Generic evaluation words do not make useful suggestions by themselves.
// They are omitted while adjacent words are retained ("layout felt clean"
// becomes "layout clean"). Context words such as "too", "many", "before",
// and "final" are intentionally not in this set: they can change the meaning
// of an otherwise useful phrase.
const LOW_INFORMATION_WORDS = new Set([
  'already',
  'away',
  'easily',
  'easy',
  'felt',
  'fine',
  'good',
  'great',
  'happened',
  'her',
  'his',
  'is',
  'last',
  'liked',
  'main',
  'mostly',
  'much',
  'my',
  'nice',
  'noticed',
  'our',
  'pretty',
  'quite',
  'really',
  'reported',
  'right',
  'second',
  'several',
  'suddenly',
  'took',
  'usually',
  'users',
  'various',
  'very',
  'well',
  'was',
  'were',
  'your',
  'their',
])

// These words are retained in a displayed phrase when they connect meaningful
// terms, but should not count as the phrase's substantive content.
const CONTEXT_WORDS = new Set(['after', 'before', 'final', 'many', 'too'])
const CONNECTOR_WORDS = new Set(['after', 'before', 'too'])
const ACTION_CUES = new Set([
  'confusing', 'confused', 'difficult', 'hard', 'struggled', 'too', 'unclear',
])
const REQUEST_PATTERNS = /\b(would|could|should)\s+(help|improve|make|show|add|include|provide)\b|\b(need|needs|want|wants)\s+(?:(a|an|the)\s+)?(way|option|summary|button|screen|step|change)\b/i
const PROBLEM_PATTERNS = /\b(confus(?:ing|ed|ion)|unclear|difficult|hard|struggl(?:e|ed|ing)|frustrat(?:ing|ed|ion)|too many|too much|not enough|doesn't work|does not work|broken|slow)\b/i

/**
 * RAKE-style extraction over participant responses. Candidate phrases retain
 * useful context words while low-information words are used only as scoring
 * boundaries. A phrase normally needs two substantive terms; "too many X" is
 * also retained because the construction itself expresses an actionable
 * problem. No model or API call is made.
 *
 * @param {string|Array<{ participantId?: string, text: string }>} input
 * @param {{ maxKeywords?: number }} [options]
 * @returns {string[]} candidate phrases, highest score first
 */
export function extractKeywords(input, { maxKeywords = 5 } = {}) {
  const responses = normalizeResponses(input)
  const candidates = responses.flatMap(({ text, participantId }, index) =>
    splitIntoCandidatePhrases(text, participantId ?? `response-${index}`),
  )
  const usableCandidates = candidates.filter(isUsefulCandidate)
  if (usableCandidates.length === 0) return []

  const contentByCandidate = usableCandidates.map((candidate) =>
    candidate.words.filter(isContentWord),
  )
  const wordScores = scoreWords(contentByCandidate)
  const phraseScores = new Map()

  usableCandidates.forEach((candidate, index) => {
    const phrase = candidate.words.join(' ')
    const contentWords = contentByCandidate[index]
    const score = contentWords.reduce(
      (sum, word) => sum + (wordScores.get(word) ?? 0),
      0,
    )

    const existing = phraseScores.get(phrase) ?? { score: -Infinity, supporters: new Set() }
    existing.score = Math.max(existing.score, score)
    existing.supporters.add(candidate.participantId)
    phraseScores.set(phrase, existing)
  })

  return [...phraseScores.entries()]
    .map(([phrase, value]) => ({
      phrase,
      // Independent participants mentioning the same phrase provide useful
      // evidence, without letting repeated messages from one person dominate.
      score: value.score + Math.log1p(value.supporters.size) * 0.5,
      priority: phrasePriority(phrase, usableCandidates),
    }))
    // Put explicit requests and problems before broad topics or positive
    // observations; use RAKE relevance and independent support within a tier.
    .sort((a, b) => b.priority - a.priority || b.score - a.score || a.phrase.localeCompare(b.phrase))
    .slice(0, maxKeywords)
    .map(({ phrase }) => phrase)
}

function normalizeResponses(input) {
  if (typeof input === 'string') return [{ text: input, participantId: 'response' }]
  if (!Array.isArray(input)) return []
  return input
    .filter((response) => response?.text && response.text.trim())
    .map((response) => ({
      text: response.text,
      participantId: response.participantId,
    }))
}

function isContentWord(word) {
  return !CONTEXT_WORDS.has(word) && !STOPWORDS.has(word)
}

function isUsefulCandidate(candidate) {
  const contentCount = candidate.words.filter(isContentWord).length
  return contentCount >= 2 || (
    contentCount >= 1 && candidate.words.includes('too') && candidate.words.includes('many')
  )
}

/** Split at sentence punctuation and ordinary stopwords, preserving selected
 * connectors when they join substantive terms ("summary before final submit"). */
function splitIntoCandidatePhrases(text, participantId) {
  const clauses = String(text || '').split(/[.!?,;:()]+/)
  const phrases = []

  clauses.forEach((clause) => {
    // Keep a connector with the phrase it relates, even when English inserts
    // an article ("summary before the final submit"). Elsewhere articles
    // remain normal boundaries so boilerplate does not bleed into keywords.
    const words = clause
      .toLowerCase()
      .replace(/\b(before|after)\s+(a|an|the)\b/g, '$1')
      .replace(/[^a-z0-9\s']/g, ' ')
      .split(/\s+/)
      .filter(Boolean)

    let current = []
    const flush = () => {
      if (current.length) {
        phrases.push({ words: current, participantId, sourceClause: clause })
      }
      current = []
    }

    words.forEach((word) => {
      if (LOW_INFORMATION_WORDS.has(word)) return
      if (STOPWORDS.has(word) && !CONNECTOR_WORDS.has(word)) {
        flush()
      } else {
        current.push(word)
      }
    })
    flush()
  })
  return phrases
}

function phrasePriority(phrase, candidates) {
  const phraseWords = phrase.split(' ')
  const sourceClauses = candidates
    .filter((candidate) => candidate.words.join(' ') === phrase)
    .map((candidate) => candidate.sourceClause ?? '')
  const hasIssueCue = phraseWords.some((word) => ACTION_CUES.has(word))
    || phraseWords.includes('many') && phraseWords.includes('steps')
    || phraseWords.some((word) => PROBLEM_PATTERNS.test(word))

  if (sourceClauses.some((clause) => REQUEST_PATTERNS.test(clause))) return 2
  return hasIssueCue ? 1 : 0
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
    const wordDegree = degree.get(word) + freq
    scores.set(word, wordDegree / freq)
  })
  return scores
}

import stopwordsIso from 'stopwords-iso' with { type: 'json' }

/**
 * @param {string} word
 * @returns {string}
 */
const normalizeToken = (word) =>
  word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const STOPWORDS = new Set(
  [...stopwordsIso.pt, ...stopwordsIso.en, ...stopwordsIso.es].map(
    normalizeToken,
  ),
)

/**
 * @param {string|null|undefined} text
 * @returns {string[]}
 */
export const tokenize = (text) => {
  if (!text || typeof text !== 'string') return []
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * @param {string} token
 * @returns {boolean}
 */
const isStopwordOrNoise = (token) => {
  if (token.length < 2) return true
  if (/^\d+$/.test(token)) return true
  return STOPWORDS.has(token)
}

/**
 * @param {object|null|undefined} side
 * @returns {string}
 */
const textFromSide = (side) => {
  if (!side) return ''
  if (side.transcript?.trim()) return side.transcript
  const segments = Array.isArray(side.segments) ? side.segments : []
  return segments.map((segment) => segment?.text || '').join(' ')
}

export const TOP_KEYWORDS_LIMIT = 30

/**
 * Merge keyword maps by summing counts (no truncation).
 *
 * @param {Array<Record<string, number>|null|undefined>} maps
 * @returns {Record<string, number>}
 */
export const mergeKeywordMaps = (maps) => {
  const counts = {}

  for (const map of maps) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue
    for (const [word, count] of Object.entries(map)) {
      const value = Number(count) || 0
      if (!word || value <= 0) continue
      counts[word] = (counts[word] || 0) + value
    }
  }

  return counts
}

/**
 * Keep the top-N keywords by count (ties broken by word ascending).
 *
 * @param {Record<string, number>|null|undefined} map
 * @param {number} [limit=TOP_KEYWORDS_LIMIT]
 * @returns {Record<string, number>}
 */
export const limitKeywordMap = (map, limit = TOP_KEYWORDS_LIMIT) => {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return {}
  const max = Math.max(0, Number(limit) || 0)
  if (max === 0) return {}

  const entries = Object.entries(map)
    .map(([word, count]) => [word, Number(count) || 0])
    .filter(([word, count]) => word && count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)

  return Object.fromEntries(entries)
}

/**
 * Extract keyword counts from a transcription (evaluator + moderator).
 * Returns a compact map with no top-N truncation.
 *
 * @param {object} transcription
 * @returns {Record<string, number>}
 */
export const extractKeywords = (transcription) => {
  const text = [
    textFromSide(transcription?.evaluator),
    textFromSide(transcription?.moderator),
  ]
    .filter(Boolean)
    .join(' ')

  const counts = {}
  for (const token of tokenize(text)) {
    if (isStopwordOrNoise(token)) continue
    counts[token] = (counts[token] || 0) + 1
  }

  return counts
}

import {
  computeTfIdf,
  cosineSimilarity,
  tokenize,
  splitSentences,
  STOPWORDS,
} from './textVectorize.js'

// Deliberately small, transparent English cue lists. This is not sentiment
// analysis in the general sense: a finding is emitted only when explicit
// polarity words occur in a sentence about a shared, concrete aspect.
const POSITIVE_CUES = new Set([
  'easy', 'easier', 'intuitive', 'clear', 'clearly', 'helpful', 'useful',
  'smooth', 'simple', 'fast', 'quick', 'good', 'great', 'excellent', 'like',
  'liked', 'love', 'loved', 'enjoy', 'enjoyed', 'works', 'working', 'effective',
  'accessible', 'convenient', 'pleasant', 'clean', 'straightforward', 'nice', 'help', 'helps',
])
const NEGATIVE_CUES = new Set([
  'hard', 'difficult', 'confusing', 'unclear', 'unintuitive', 'unhelpful',
  'useless', 'slow', 'bad', 'poor', 'broken', 'frustrating', 'frustrated',
  'hate', 'hated', 'dislike', 'disliked', 'problem', 'problems', 'issue',
  'issues', 'failed', 'fails', 'annoying', 'annoyed', 'inaccessible',
  'cluttered', 'complicated', 'lost', 'missing',
])
const NEGATIONS = new Set(['not', 'never', 'no', "don't", 'doesn\'t', 'didn\'t', 'isn\'t', 'wasn\'t', 'cannot', 'can\'t'])
const ASPECT_EXCLUSIONS = new Set([
  ...STOPWORDS, ...POSITIVE_CUES, ...NEGATIVE_CUES, ...NEGATIONS,
  'also', 'really', 'very', 'just', 'thing', 'things', 'stuff', 'something',
  'anything', 'everything', 'experience', 'interface', 'product', 'website',
  'app', 'site', 'page', 'user', 'users', 'people', 'person', 'part', 'way',
  'time', 'times', 'lot', 'lots', 'bit', 'overall', 'aspect', 'feel', 'felt',
  'think', 'thought', 'know', 'noticed', 'using', 'use', 'used', 'would',
  'could', 'might', 'seem', 'seems', 'seemed', 'get', 'got', 'make', 'made',
  'one', 'first', 'second', 'last', 'much', 'many', 'few', 'little', 'quite',
  'find', 'finds', 'found', 'scan', 'right', 'away',
])

function clauseSentences(text) {
  return splitSentences(text).flatMap((quote) =>
    quote
      .split(/\b(?:but|however|although|and|or)\b|[,;]/i)
      .map((clause) => ({ clause: clause.trim(), quote }))
      .filter(({ clause }) => clause),
  )
}

function detectStance(sentence) {
  const words = String(sentence).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []
  const cues = []
  if (/\btoo\s+(?:many|much|few)\b/i.test(sentence)) {
    cues.push({ polarity: 'negative' })
  }
  words.forEach((word, index) => {
    const polarity = POSITIVE_CUES.has(word) ? 'positive' : NEGATIVE_CUES.has(word) ? 'negative' : null
    if (!polarity) return
    const negated = words.slice(Math.max(0, index - 2), index).some((previous) => NEGATIONS.has(previous))
    cues.push({ polarity: negated ? (polarity === 'positive' ? 'negative' : 'positive') : polarity })
  })
  const polarities = new Set(cues.map(({ polarity }) => polarity))
  // Mixed or contradictory language in one clause is intentionally left
  // unclassified rather than choosing whichever cue happens to occur first.
  return polarities.size === 1 ? [...polarities][0] : null
}

function extractAspectTerms(sentence) {
  return [...new Set(tokenize(sentence).filter((word) => !ASPECT_EXCLUSIONS.has(word)))]
}

function analyzeStances(responses) {
  const evidenceByAspect = new Map()

  responses.forEach(({ participantId, text }) => {
    clauseSentences(text).forEach(({ clause, quote }) => {
      const stance = detectStance(clause)
      if (!stance) return
      const aspect = extractAspectTerms(clause).join(' ')
      if (!aspect) return

      // A response contributes at most one piece of evidence to an aspect and
      // stance. Keep the original sentence so every suggestion is auditable.
      if (!evidenceByAspect.has(aspect)) evidenceByAspect.set(aspect, { positive: new Map(), negative: new Map() })
      const group = evidenceByAspect.get(aspect)[stance]
      if (!group.has(participantId)) group.set(participantId, quote)
    })
  })

  const sharedOpinions = []
  const divergencePoints = []
  evidenceByAspect.forEach((stances, aspect) => {
    // If one participant used both polarities for the same aspect, keep them
    // out of a group-level finding: the cues may describe different details.
    const positive = [...stances.positive]
      .filter(([participantId]) => !stances.negative.has(participantId))
      .map(([participantId, quote]) => ({ participantId, quote }))
    const negative = [...stances.negative]
      .filter(([participantId]) => !stances.positive.has(participantId))
      .map(([participantId, quote]) => ({ participantId, quote }))

    if (positive.length >= 2) {
      sharedOpinions.push({ aspect, stance: 'positive', evidence: positive })
    }
    if (negative.length >= 2) {
      sharedOpinions.push({ aspect, stance: 'negative', evidence: negative })
    }
    if (positive.length && negative.length) {
      divergencePoints.push({ aspect, positions: { positive, negative } })
    }
  })

  const byAspect = (a, b) => a.aspect.localeCompare(b.aspect)
  return {
    sharedOpinions: sharedOpinions.sort(byAspect),
    divergencePoints: divergencePoints.sort(byAspect),
  }
}

/**
 * Lexical similarity scoring plus cautious, quote-backed stance cues for one
 * topic. Similarity remains a wording metric; stance findings are a separate
 * heuristic and should be reviewed as suggestions, not definitive coding.
 *
 * @param {Array<{ participantId: string, text: string }>} responses
 *   One aggregated text block per participant for this topic.
 */
export function computeConsensus(responses) {
  const nonEmpty = responses.filter((r) => r.text && r.text.trim())
  const stanceFindings = analyzeStances(nonEmpty)
  if (nonEmpty.length < 2) {
    return {
      score: null,
      respondentCount: nonEmpty.length,
      ...stanceFindings,
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
      avgSimilarity.set(nonEmpty[i].participantId, avgSimilarity.get(nonEmpty[i].participantId) + sim / (nonEmpty.length - 1))
      avgSimilarity.set(nonEmpty[j].participantId, avgSimilarity.get(nonEmpty[j].participantId) + sim / (nonEmpty.length - 1))
    }
  }

  const score = pairwise.reduce((sum, similarity) => sum + similarity, 0) / pairwise.length
  const alignment = {}
  nonEmpty.forEach((response) => {
    alignment[response.participantId] = Math.round(avgSimilarity.get(response.participantId) * 100) / 100
  })

  return {
    score: Math.round(score * 100) / 100,
    respondentCount: nonEmpty.length,
    ...stanceFindings,
    alignment,
  }
}

import { TextSentimentResults } from '../models/TextSentimentResults.js'

const LABEL_TO_BUCKET = {
  POS: 'Positive',
  POSITIVE: 'Positive',
  NEU: 'Neutral',
  NEUTRAL: 'Neutral',
  NEG: 'Negative',
  NEGATIVE: 'Negative',
}

/**
 * Map an utterance label to Positive / Neutral / Negative.
 *
 * @param {unknown} label
 * @returns {'Positive'|'Neutral'|'Negative'|null}
 */
export const mapUtteranceLabel = (label) => {
  if (label == null) return null
  const key = String(label).trim().toUpperCase()
  return LABEL_TO_BUCKET[key] ?? null
}

/**
 * Aggregate utterance-level labels into percentage buckets.
 *
 * @param {Array<{ label?: string, sentiment?: string }|string>|null|undefined} utterances
 * @returns {TextSentimentResults}
 */
export const aggregateUtteranceSentiment = (utterances) => {
  const list = Array.isArray(utterances) ? utterances : []
  let positive = 0
  let neutral = 0
  let negative = 0

  for (const item of list) {
    const rawLabel =
      typeof item === 'string'
        ? item
        : item?.label ?? item?.sentiment ?? null
    const bucket = mapUtteranceLabel(rawLabel)
    if (bucket === 'Positive') positive += 1
    else if (bucket === 'Neutral') neutral += 1
    else if (bucket === 'Negative') negative += 1
  }

  const sampleCount = positive + neutral + negative
  if (sampleCount <= 0) {
    return TextSentimentResults.create({ sampleCount: 0 })
  }

  return TextSentimentResults.create({
    Positive: Math.round((positive / sampleCount) * 100),
    Neutral: Math.round((neutral / sampleCount) * 100),
    Negative: Math.round((negative / sampleCount) * 100),
    sampleCount,
  })
}

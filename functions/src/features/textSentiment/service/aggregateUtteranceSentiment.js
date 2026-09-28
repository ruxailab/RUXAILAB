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
 * Normalize API utterance label to Positive / Neutral / Negative.
 *
 * @param {unknown} label
 * @returns {'Positive'|'Neutral'|'Negative'|string}
 */
export const normalizeRegionSentiment = (label) => {
  const bucket = mapUtteranceLabel(label)
  if (bucket) return bucket
  return label != null ? String(label) : ''
}

/**
 * Map API utterances into moderated-compatible regions.
 *
 * @param {Array<object>|null|undefined} utterances
 * @param {number} [timeOffsetSec=0]
 * @returns {Array<{
 *   idx: number,
 *   start: number,
 *   end: number,
 *   transcript: string,
 *   sentiment: string,
 *   confidence: number,
 * }>}
 */
export const mapUtterancesToRegions = (utterances, timeOffsetSec = 0) => {
  const list = Array.isArray(utterances) ? utterances : []
  const regions = []

  for (let i = 0; i < list.length; i += 1) {
    const utterance = list[i]
    if (!utterance || typeof utterance !== 'object') continue

    const timestamp = Array.isArray(utterance.timestamp)
      ? utterance.timestamp
      : [utterance.start, utterance.end]
    const startRaw = Number(timestamp?.[0])
    const endRaw = Number(timestamp?.[1])
    const start = Number.isFinite(startRaw) ? startRaw + timeOffsetSec : timeOffsetSec
    const end = Number.isFinite(endRaw) ? endRaw + timeOffsetSec : start

    regions.push({
      idx: i,
      start,
      end,
      transcript: utterance.text != null ? String(utterance.text) : '',
      sentiment: normalizeRegionSentiment(
        utterance.label ?? utterance.sentiment,
      ),
      confidence: Number(utterance.confidence) || 0,
    })
  }

  return regions
}

/**
 * Aggregate utterance-level labels into percentage buckets + regions.
 *
 * @param {Array<object|string>|null|undefined} utterances
 * @param {number} [timeOffsetSec=0]
 * @returns {TextSentimentResults}
 */
export const aggregateUtteranceSentiment = (utterances, timeOffsetSec = 0) => {
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

  const regions = mapUtterancesToRegions(
    list.filter((item) => item && typeof item === 'object'),
    timeOffsetSec,
  )

  const sampleCount = positive + neutral + negative
  if (sampleCount <= 0) {
    return TextSentimentResults.create({
      sampleCount: 0,
      regionsCount: regions.length,
      regions,
    })
  }

  return TextSentimentResults.create({
    Positive: Math.round((positive / sampleCount) * 100),
    Neutral: Math.round((neutral / sampleCount) * 100),
    Negative: Math.round((negative / sampleCount) * 100),
    sampleCount,
    regionsCount: regions.length,
    regions,
  })
}

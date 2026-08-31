import { fail } from '../../../core/errors.js'
import { aggregateUtteranceSentiment } from './aggregateUtteranceSentiment.js'

/** Full-audio window when duration is unknown (12 hours). */
export const FULL_AUDIO_END_TIME_MS = 12 * 60 * 60 * 1000

/**
 * Call the transcription sentiment API for a full audio URL.
 *
 * @param {object} params
 * @param {string} params.baseUrl
 * @param {string} params.audioUrl
 * @param {number} [params.startTimeMs]
 * @param {number} [params.endTimeMs]
 * @returns {Promise<import('../models/TextSentimentResults.js').TextSentimentResults>}
 */
export async function processAudioSentiment({
  baseUrl,
  audioUrl,
  startTimeMs = 0,
  endTimeMs = FULL_AUDIO_END_TIME_MS,
}) {
  if (!audioUrl) {
    fail('failed-precondition', 'Audio URL is required for text sentiment')
  }

  const response = await fetch(`${baseUrl}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: audioUrl,
      start_time_ms: startTimeMs,
      end_time_ms: endTimeMs,
    }),
    signal: AbortSignal.timeout(500_000),
  })

  if (!response.ok) {
    fail(
      'unavailable',
      `Text sentiment API failed (HTTP ${response.status})`,
    )
  }

  const payload = await response.json()
  if (!payload || payload.status !== 'success') {
    fail(
      'internal',
      `Text sentiment failed: ${payload?.error || payload?.message || 'Unknown error'}`,
    )
  }

  const utterances =
    payload?.data?.utterances_sentiment ??
    payload?.utterances_sentiment ??
    []

  if (!Array.isArray(utterances) || utterances.length === 0) {
    fail('internal', 'Text sentiment response did not include utterances.')
  }

  return aggregateUtteranceSentiment(utterances)
}

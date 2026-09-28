import { fail } from '../../../core/errors.js'
import { FacialEmotions } from '../models/FacialEmotions.js'

/**
 * Call the facial sentiment API for a single Storage video path.
 *
 * @param {object} params
 * @param {string} params.baseUrl
 * @param {string} params.videoName
 * @returns {Promise<FacialEmotions>}
 */
export async function processFacialVideo({ baseUrl, videoName }) {
  if (!videoName) {
    fail('failed-precondition', 'Video path is required for facial sentiment')
  }

  const response = await fetch(`${baseUrl}/process_video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_name: videoName,
    }),
    signal: AbortSignal.timeout(500_000),
  })

  if (!response.ok) {
    fail(
      'unavailable',
      `Facial sentiment API failed (HTTP ${response.status})`,
    )
  }

  const data = await response.json()
  const emotions = data?.emotions
  if (!emotions || typeof emotions !== 'object') {
    fail(
      'internal',
      `Facial sentiment failed: ${data?.message || 'No emotions in response'}`,
    )
  }

  return FacialEmotions.fromApi(emotions)
}

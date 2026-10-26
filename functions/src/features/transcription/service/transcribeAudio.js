import { fail } from '../../../core/errors.js'
import { fromApiSegments } from '../models/mapSegments.js'

/**
 * Call the Whisper transcription API for a single audio URL.
 * Missing URL yields an empty side (same behavior as the former Vue flow).
 *
 * @param {object} params
 * @param {string} params.baseUrl
 * @param {string|null|undefined} params.audioUrl
 * @param {string} params.provider
 * @param {string} params.model
 * @param {string} params.role
 * @returns {Promise<{ language: string|null, transcript: string, segments: Array }>}
 */
export async function transcribeAudio({
  baseUrl,
  audioUrl,
  provider,
  model,
  role,
}) {
  if (!audioUrl) {
    return { language: null, transcript: '', segments: [] }
  }

  const response = await fetch(`${baseUrl}/api/v1/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_url: audioUrl,
      provider,
      model,
    }),
    signal: AbortSignal.timeout(500_000),
  })

  if (!response.ok) {
    fail(
      'unavailable',
      `Transcription API failed for ${role} (HTTP ${response.status})`,
    )
  }

  const data = await response.json()
  if (data.status !== 'success' || !Array.isArray(data.segments)) {
    fail(
      'internal',
      `Transcription failed for ${role}: ${data.message || 'No segments'}`,
    )
  }

  return {
    language: data.language ?? null,
    transcript: data.transcript ?? '',
    segments: fromApiSegments(data.segments),
  }
}

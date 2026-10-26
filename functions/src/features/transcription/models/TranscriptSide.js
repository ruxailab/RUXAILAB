import { fromFirestoreSegments } from './mapSegments.js'

/**
 * One speaker side of a moderated-task transcription (evaluator or moderator).
 */
export class TranscriptSide {
  /**
   * @param {object} params
   * @param {string|null} [params.language]
   * @param {string} [params.transcript]
   * @param {Array<{ start: number, end: number, text: string }>} [params.segments]
   */
  constructor({ language = null, transcript = '', segments = [] } = {}) {
    this.language = language
    this.transcript = transcript
    this.segments = segments
  }

  /**
   * @param {object} [data]
   * @returns {TranscriptSide}
   */
  static create(data = {}) {
    return new TranscriptSide(data)
  }

  /**
   * Hydrate from Firestore nested shape (startTimeSec/endTimeSec).
   *
   * @param {object} [data]
   * @returns {TranscriptSide}
   */
  static fromFirestore(data = {}) {
    return new TranscriptSide({
      language: data.language ?? null,
      transcript: data.transcript ?? '',
      segments: fromFirestoreSegments(data.segments),
    })
  }

  /**
   * Empty side when audio URL is missing.
   * @returns {TranscriptSide}
   */
  static empty() {
    return new TranscriptSide()
  }

  /**
   * Firestore nested shape (matches client Transcription.toFirestore).
   * @returns {{ language: string|null, transcript: string, segments: Array }}
   */
  toFirestore() {
    return {
      language: this.language,
      transcript: this.transcript,
      segments: this.segments.map((segment) => ({
        startTimeSec: segment.start,
        endTimeSec: segment.end,
        text: segment.text,
      })),
    }
  }

  /**
   * API / UI shape with start/end.
   * @returns {{ language: string|null, transcript: string, segments: Array }}
   */
  toJSON() {
    return {
      language: this.language,
      transcript: this.transcript,
      segments: this.segments,
    }
  }
}

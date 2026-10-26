/**
 * @param {Array<{ start?: number, end?: number, text?: string }>} [segments]
 * @returns {Array<{ start: number, end: number, text: string }>}
 */
export const fromApiSegments = (segments = []) =>
  segments.map((segment) => ({
    start: segment.start,
    end: segment.end,
    text: segment.text,
  }))

/**
 * Firestore shape used by Transcription.toFirestore() on the client.
 *
 * @param {Array<{ start?: number, end?: number, text?: string }>} [segments]
 * @returns {Array<{ startTimeSec: number, endTimeSec: number, text: string }>}
 */
export const toFirestoreSegments = (segments = []) =>
  segments.map((segment) => ({
    startTimeSec: segment.start,
    endTimeSec: segment.end,
    text: segment.text,
  }))

/**
 * Hydrate API / domain segments from Firestore nested shape.
 *
 * @param {Array<{ startTimeSec?: number, endTimeSec?: number, start?: number, end?: number, text?: string }>} [segments]
 * @returns {Array<{ start: number, end: number, text: string }>}
 */
export const fromFirestoreSegments = (segments = []) =>
  segments.map((segment) => ({
    start: segment.startTimeSec ?? segment.start,
    end: segment.endTimeSec ?? segment.end,
    text: segment.text,
  }))

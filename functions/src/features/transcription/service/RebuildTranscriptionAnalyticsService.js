import {
  buildTranscriptionAnalytics,
  collectTranscriptionDocIds,
} from './buildTranscriptionAnalytics.js'

/**
 * Rebuild answer-level transcription analytics from latest task pointers.
 */
export class RebuildTranscriptionAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreTranscriptionAnalyticsRepository.js').FirestoreTranscriptionAnalyticsRepository} deps.analyticsRepository
   * @param {import('../repositories/FirestoreTranscriptionRepository.js').FirestoreTranscriptionRepository} deps.transcriptionRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {object} deps.FieldValue
   */
  constructor({
    analyticsRepository,
    transcriptionRepository,
    answerRepository,
    FieldValue,
  }) {
    this.analyticsRepository = analyticsRepository
    this.transcriptionRepository = transcriptionRepository
    this.answerRepository = answerRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.answersDocId
   * @param {object} [params.preferTranscription] - In-memory transcription override (e.g. just upserted)
   * @returns {Promise<object>}
   */
  async execute({ answersDocId, preferTranscription = null }) {
    const answer = await this.answerRepository.get(answersDocId)
    const transcriptionIds = new Set(collectTranscriptionDocIds(answer))

    if (preferTranscription?.id) {
      transcriptionIds.add(String(preferTranscription.id))
    }

    const loaded = await Promise.all(
      [...transcriptionIds].map((id) => this.transcriptionRepository.get(id)),
    )

    const byId = new Map()
    for (const doc of loaded) {
      if (doc?.id) byId.set(String(doc.id), doc)
    }

    if (preferTranscription?.id) {
      const id = String(preferTranscription.id)
      const current = byId.get(id)
      byId.set(id, {
        ...(current || {}),
        ...preferTranscription,
        id: preferTranscription.id,
      })
    }

    const analytics = buildTranscriptionAnalytics([...byId.values()])
    analytics.updatedAt = this.FieldValue.serverTimestamp()
    await this.analyticsRepository.set(analytics)
    return analytics
  }
}

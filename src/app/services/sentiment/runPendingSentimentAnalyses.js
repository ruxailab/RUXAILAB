import { analyzeFacialSentimentTask } from '@/app/services/facialSentiment/FacialSentimentService'
import { analyzeTextSentimentTask } from '@/app/services/textSentiment/TextSentimentService'

/**
 * Enqueue every pending facial and text sentiment analysis.
 *
 * @param {object} params
 * @param {string} params.answersDocId
 * @param {string} [params.studyId]
 * @param {Array<{ type: 'facial'|'text', userDocId: string, taskId: string }>} params.items
 * @returns {Promise<{ queued: number, failed: number }>}
 */
export async function runPendingSentimentAnalyses({
  answersDocId,
  studyId,
  items = [],
}) {
  const results = await Promise.allSettled(
    items.map((item) => {
      const payload = {
        answersDocId,
        userDocId: item.userDocId,
        taskId: String(item.taskId),
        studyId: studyId || undefined,
      }
      return item.type === 'facial'
        ? analyzeFacialSentimentTask(payload)
        : analyzeTextSentimentTask(payload)
    }),
  )

  const failed = results.flatMap((result, index) => {
    if (result.status !== 'rejected') return []
    return [
      {
        type: items[index]?.type,
        message: result.reason?.message || 'Failed to enqueue analysis',
      },
    ]
  })
  if (failed.length > 0 && failed.length === results.length) {
    const error = new Error(failed.map((item) => item.message).join(' '))
    error.failures = failed
    throw error
  }

  return {
    queued: results.length - failed.length,
    failed: failed.length,
    failures: failed,
  }
}

import { transcribeTask } from '@/app/services/transcription/TranscriptionService'

const DEFAULT_PROVIDER = 'whisper'
const DEFAULT_MODEL = 'medium'

/**
 * Enqueue transcription for every session task that has audio and no transcription.
 *
 * @param {object} params
 * @param {string} params.answersDocId
 * @param {string} [params.studyId]
 * @param {Array<{ userDocId: string, taskId: string }>} params.items
 * @returns {Promise<{ queued: number, failed: number, errors: string[] }>}
 */
export async function runPendingTranscriptions({
  answersDocId,
  studyId,
  items = [],
}) {
  const results = await Promise.allSettled(
    items.map((item) =>
      transcribeTask({
        answersDocId,
        userDocId: item.userDocId,
        taskId: String(item.taskId),
        studyId: studyId || undefined,
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
      }),
    ),
  )

  const failed = results.filter((result) => result.status === 'rejected')
  if (failed.length > 0 && failed.length === results.length) {
    throw failed[0].reason
  }

  return {
    queued: results.length - failed.length,
    failed: failed.length,
    errors: failed.map((result) => result.reason?.message).filter(Boolean),
  }
}

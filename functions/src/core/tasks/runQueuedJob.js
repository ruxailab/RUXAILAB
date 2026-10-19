import { isPermanentTaskError } from './isPermanentTaskError.js'

/**
 * Runs a queued job and records processing, done, or failed.
 * A newer jobId on the same document is left untouched.
 * Permanent errors are acknowledged. Other errors are retried until the last attempt.
 *
 * @param {object} params
 * @param {{ get: Function, update: Function }} params.repository
 * @param {{ serverTimestamp: Function }} params.FieldValue
 * @param {string} params.jobDocId
 * @param {string} params.jobId
 * @param {number} [params.retryCount]
 * @param {number} [params.maxAttempts]
 * @param {string} [params.failureMessage]
 * @param {() => Promise<unknown>} params.work
 * @param {(result: unknown) => object} [params.resultFields]
 * @returns {Promise<unknown>}
 */
export async function runQueuedJob({
  repository,
  FieldValue,
  jobDocId,
  jobId,
  retryCount = 0,
  maxAttempts = 3,
  failureMessage = 'Task failed',
  work,
  resultFields,
}) {
  const job = await repository.get(jobDocId)
  if (!job || job.jobId !== jobId || job.status === 'done') return

  await repository.update(jobDocId, {
    status: 'processing',
    error: null,
    updatedAt: FieldValue.serverTimestamp(),
  })

  try {
    const result = await work()
    const latest = await repository.get(jobDocId)
    if (!latest || latest.jobId !== jobId) return result

    await repository.update(jobDocId, {
      status: 'done',
      progress: 100,
      error: null,
      ...(resultFields ? resultFields(result) : {}),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return result
  } catch (err) {
    const latest = await repository.get(jobDocId)
    const stillCurrent = latest && latest.jobId === jobId
    const lastAttempt = retryCount >= maxAttempts - 1

    if (stillCurrent && (isPermanentTaskError(err) || lastAttempt)) {
      await repository.update(jobDocId, {
        status: 'failed',
        error: err?.message || failureMessage,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    if (isPermanentTaskError(err)) return
    throw err
  }
}

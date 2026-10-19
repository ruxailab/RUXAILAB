import { randomUUID } from 'node:crypto'

/**
 * Writes a queued job document and enqueues its payload.
 * `data` is stored and sent to the worker. `record` is stored only.
 *
 * @param {object} params
 * @param {{ set: Function, update: Function }} params.repository
 * @param {{ serverTimestamp: Function }} params.FieldValue
 * @param {{ enqueue: (data: object) => Promise<void> }} params.taskQueue
 * @param {string} params.type
 * @param {object} params.data
 * @param {object} [params.record]
 * @returns {Promise<{ status: 'queued', jobId: string, jobDocId: string }>}
 */
export async function enqueueTaskJob({
  repository,
  FieldValue,
  taskQueue,
  type,
  data,
  record = {},
}) {
  const jobId = randomUUID()
  const payload = { jobId, type, ...data }

  await repository.set(jobId, {
    ...payload,
    ...record,
    status: 'queued',
    progress: 0,
    error: null,
    cloudTaskId: jobId,
    updatedAt: FieldValue.serverTimestamp(),
  })

  try {
    await taskQueue.enqueue(payload, { id: jobId })
  } catch (err) {
    await repository.update(jobId, {
      status: 'failed',
      error: err?.message || 'Failed to enqueue task',
      updatedAt: FieldValue.serverTimestamp(),
    })
    throw err
  }

  return { status: 'queued', jobId, jobDocId: jobId }
}

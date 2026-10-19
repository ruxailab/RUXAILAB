import { fail } from '../../../core/errors.js'
import { TASK_QUEUE_BY_TYPE } from '../taskQueueNames.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * True when Cloud Tasks reports that the named task is already gone.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
function isTaskNotFound(err) {
  const code = err?.code
  return (
    code === 5 ||
    code === '5' ||
    code === 'not-found' ||
    code === 'NOT_FOUND' ||
    err?.status === 404
  )
}

/**
 * Cancels a job that is still queued and removes its Cloud Task when the id is known.
 */
export class CancelQueuedJobService {
  /**
   * @param {object} deps
   * @param {{ get: Function, cancelIfQueued: Function }} deps.jobRepository
   * @param {{ isSuperAdmin: Function }} deps.userRepository
   * @param {{ get: Function }} deps.studyRepository
   * @param {Record<string, { delete: Function }>} deps.taskQueues
   * @param {{ serverTimestamp: Function }} deps.FieldValue
   */
  constructor({
    jobRepository,
    userRepository,
    studyRepository,
    taskQueues,
    FieldValue,
  }) {
    this.jobRepository = jobRepository
    this.userRepository = userRepository
    this.studyRepository = studyRepository
    this.taskQueues = taskQueues
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {{ jobId: string }} params.input
   * @returns {Promise<{ status: 'cancelled', jobId: string }>}
   */
  async execute({ uid, input }) {
    const jobId = input?.jobId
    const job = await this.jobRepository.get(jobId)
    if (!job) fail('not-found', 'Job not found')
    if (job.status !== 'queued') {
      fail('failed-precondition', 'Only queued jobs can be cancelled')
    }
    if (!job.studyId) fail('failed-precondition', 'Job is not linked to a study')

    const [study, isSuperAdmin] = await Promise.all([
      this.studyRepository.get(job.studyId),
      this.userRepository.isSuperAdmin(uid),
    ])

    assertStudyAccess(study, uid, isSuperAdmin, {
      allowedRoles: [ROLE.ADMIN, ROLE.MANAGER],
      message: 'Cancelling this job is not permitted',
    })

    const queueName = TASK_QUEUE_BY_TYPE[job.type]
    const taskId = job.cloudTaskId || null
    const queue = queueName ? this.taskQueues[queueName] : null
    if (queue && taskId) {
      try {
        await queue.delete(taskId)
      } catch (err) {
        if (!isTaskNotFound(err)) throw err
      }
    }

    const cancelled = await this.jobRepository.cancelIfQueued(
      jobId,
      this.FieldValue,
    )
    if (!cancelled) {
      fail('failed-precondition', 'Job is no longer queued')
    }

    return { status: 'cancelled', jobId }
  }
}

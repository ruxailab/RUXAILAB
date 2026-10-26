import { enqueueTaskJob } from '../../../core/tasks/index.js'

/**
 * Records a queued facial sentiment job and enqueues it on Cloud Tasks.
 */
export class EnqueueFacialSentimentTaskService {
  /**
   * @param {object} deps
   * @param {import('../../../core/repositories/FirestoreJobRepository.js').FirestoreJobRepository} deps.jobRepository
   * @param {{ enqueue: (data: object) => Promise<void> }} deps.taskQueue
   * @param {object} deps.FieldValue
   */
  constructor({ jobRepository, taskQueue, FieldValue }) {
    this.jobRepository = jobRepository
    this.taskQueue = taskQueue
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<{ status: 'queued', jobId: string, jobDocId: string }>}
   */
  async execute({ uid, input }) {
    return enqueueTaskJob({
      repository: this.jobRepository,
      FieldValue: this.FieldValue,
      taskQueue: this.taskQueue,
      type: 'facial',
      data: {
        uid,
        answersDocId: input.answersDocId,
        userDocId: input.userDocId,
        taskId: String(input.taskId),
        studyId: input.studyId ?? null,
      },
      record: { sentimentDocId: null },
    })
  }
}

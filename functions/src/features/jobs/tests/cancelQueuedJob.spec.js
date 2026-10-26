import { jest } from '@jest/globals'
import { CancelQueuedJobService } from '../service/CancelQueuedJobService.js'

const queuedJob = {
  jobId: 'job-1',
  type: 'transcription',
  status: 'queued',
  studyId: 'study-1',
  cloudTaskId: 'job-1',
}

function createService({
  job = queuedJob,
  cancelIfQueued = jest.fn(async () => true),
  deleteTask = jest.fn(async () => undefined),
  isSuperAdmin = jest.fn(async () => false),
  study = {
    testAdmin: { userDocId: 'owner' },
    studyRoleMap: { owner: 0 },
  },
} = {}) {
  const taskDelete = deleteTask
  const service = new CancelQueuedJobService({
    jobRepository: {
      get: jest.fn(async () => job),
      cancelIfQueued,
    },
    userRepository: { isSuperAdmin },
    studyRepository: {
      get: jest.fn(async () => study),
    },
    taskQueues: {
      transcriptionTaskWorker: { delete: taskDelete },
    },
    FieldValue: { serverTimestamp: () => 'ts' },
  })
  return { service, cancelIfQueued, taskDelete }
}

describe('CancelQueuedJobService', () => {
  it('deletes the cloud task and marks the job cancelled', async () => {
    const { service, cancelIfQueued, taskDelete } = createService()

    await expect(
      service.execute({ uid: 'owner', input: { jobId: 'job-1' } }),
    ).resolves.toEqual({ status: 'cancelled', jobId: 'job-1' })

    expect(taskDelete).toHaveBeenCalledWith('job-1')
    expect(cancelIfQueued).toHaveBeenCalledWith('job-1', expect.any(Object))
  })

  it('cancels when the cloud task is already gone', async () => {
    const notFound = Object.assign(new Error('missing'), { code: 5 })
    const { service, cancelIfQueued } = createService({
      deleteTask: jest.fn(async () => {
        throw notFound
      }),
    })

    await expect(
      service.execute({ uid: 'owner', input: { jobId: 'job-1' } }),
    ).resolves.toEqual({ status: 'cancelled', jobId: 'job-1' })
    expect(cancelIfQueued).toHaveBeenCalled()
  })

  it('skips cloud task deletion when the job has no task id', async () => {
    const { service, taskDelete } = createService({
      job: { ...queuedJob, cloudTaskId: null },
    })

    await service.execute({ uid: 'owner', input: { jobId: 'job-1' } })
    expect(taskDelete).not.toHaveBeenCalled()
  })

  it('rejects a job that is no longer queued', async () => {
    const { service, taskDelete } = createService({
      job: { ...queuedJob, status: 'processing' },
    })

    await expect(
      service.execute({ uid: 'owner', input: { jobId: 'job-1' } }),
    ).rejects.toMatchObject({ code: 'failed-precondition' })
    expect(taskDelete).not.toHaveBeenCalled()
  })

  it('rejects a caller without study access', async () => {
    const { service, taskDelete } = createService()

    await expect(
      service.execute({ uid: 'stranger', input: { jobId: 'job-1' } }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(taskDelete).not.toHaveBeenCalled()
  })

  it('fails when the job left the queue before the write', async () => {
    const { service } = createService({
      cancelIfQueued: jest.fn(async () => false),
    })

    await expect(
      service.execute({ uid: 'owner', input: { jobId: 'job-1' } }),
    ).rejects.toMatchObject({ code: 'failed-precondition' })
  })
})

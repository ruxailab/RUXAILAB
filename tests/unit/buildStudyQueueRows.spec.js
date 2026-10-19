import { buildStudyQueueRows } from '@/app/services/jobs/buildStudyQueueRows'

describe('buildStudyQueueRows', () => {
  const userTasks = [{ taskName: 'Checkout' }, { taskName: 'Search' }]

  const taskAnswers = {
    'user-1': {
      userDocId: 'user-1',
      fullName: 'Ana Costa',
      tasks: {
        0: { audioRecordURL: 'https://audio', webcamRecordURL: 'https://cam' },
        1: { audioRecordURL: 'https://audio-2' },
      },
    },
  }

  it('maps stored job types and marks media without a job as missing', () => {
    const rows = buildStudyQueueRows({
      jobs: [
        {
          id: 'job-1',
          type: 'transcription',
          userDocId: 'user-1',
          taskId: '0',
          status: 'processing',
          progress: 40,
        },
        {
          id: 'job-2',
          type: 'text',
          userDocId: 'user-1',
          taskId: '1',
          status: 'failed',
          error: 'timed out',
        },
      ],
      taskAnswers,
      userTasks,
    })

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'job-1',
          type: 'transcription',
          participant: 'Ana Costa',
          taskLabel: 'Checkout',
          status: 'processing',
          progress: 40,
        }),
        expect.objectContaining({
          id: 'job-2',
          type: 'textSentiment',
          taskLabel: 'Search',
          status: 'failed',
          error: 'timed out',
        }),
        expect.objectContaining({
          id: 'missing:facialSentiment|user-1|0',
          type: 'facialSentiment',
          status: 'missing',
        }),
        expect.objectContaining({
          id: 'missing:transcription|user-1|1',
          type: 'transcription',
          status: 'missing',
        }),
      ]),
    )
    expect(rows.some((row) => row.id === 'missing:transcription|user-1|0')).toBe(
      false,
    )
  })

  it('hides a cancelled job and does not list that analysis as missing', () => {
    const rows = buildStudyQueueRows({
      jobs: [
        {
          id: 'job-cancelled',
          type: 'transcription',
          userDocId: 'user-1',
          taskId: '0',
          status: 'cancelled',
        },
      ],
      taskAnswers,
      userTasks,
    })

    expect(rows.some((row) => row.id === 'job-cancelled')).toBe(false)
    expect(rows.some((row) => row.id === 'missing:transcription|user-1|0')).toBe(
      false,
    )
    expect(rows.some((row) => row.id === 'missing:textSentiment|user-1|0')).toBe(
      true,
    )
  })

  it('orders jobs by updatedAt, newest first, and leaves undated rows last', () => {
    const rows = buildStudyQueueRows({
      jobs: [
        {
          id: 'older',
          type: 'transcription',
          userDocId: 'user-1',
          taskId: '0',
          status: 'done',
          updatedAt: { seconds: 100, nanoseconds: 0 },
        },
        {
          id: 'newer',
          type: 'facial',
          userDocId: 'user-1',
          taskId: '0',
          status: 'queued',
          updatedAt: '2026-10-19T03:00:00.000Z',
        },
      ],
      taskAnswers,
      userTasks,
    })

    expect(rows.map((row) => row.id)).toEqual([
      'newer',
      'older',
      'missing:textSentiment|user-1|0',
      'missing:transcription|user-1|1',
      'missing:textSentiment|user-1|1',
    ])
  })
})

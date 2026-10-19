import {
  countPendingSentiment,
  countPendingTranscriptions,
  listPendingSentiment,
} from '@/app/services/jobs/pendingAnalysis'

describe('pendingAnalysis', () => {
  const userAnswers = {
    'user-1': {
      userDocId: 'user-1',
      tasks: {
        0: {
          webcamRecordURL: 'https://cam',
          audioRecordURL: 'https://audio',
        },
        1: { audioRecordURL: 'https://audio-2', transcriptionDocId: 'tr-1' },
      },
    },
    'user-2': {
      hidden: true,
      tasks: {
        0: { webcamRecordURL: 'https://hidden-cam' },
      },
    },
  }

  it('counts webcam and audio tasks that have no sentiment result', () => {
    const coverage = new Map([
      [
        'user-1|1',
        {
          facial: null,
          text: { Positive: 80, Neutral: 10, Negative: 10, sampleCount: 1 },
        },
      ],
    ])

    expect(
      countPendingSentiment({ userAnswers, coverage }),
    ).toEqual({ facial: 1, text: 1, total: 2 })
  })

  it('ignores a signal that already has stored results', () => {
    const coverage = new Map([
      [
        'user-1|0',
        {
          facial: { Happy: 70, Neutral: 30, sampleCount: 1 },
          text: { Positive: 60, Neutral: 40, Negative: 0, sampleCount: 1 },
        },
      ],
    ])

    expect(
      countPendingSentiment({
        userAnswers,
        coverage,
        signal: 'facial',
        taskId: '0',
      }).total,
    ).toBe(0)
  })

  it('includes facial media even when a sentiment document already has facial results', () => {
    const coverage = new Map([
      [
        'user-1|0',
        {
          facial: { Happy: 70, Neutral: 30, sampleCount: 1 },
          text: null,
        },
      ],
    ])

    const items = listPendingSentiment({
      userAnswers,
      coverage,
      onlyMissing: false,
    })

    expect(items.map((item) => item.type).sort()).toEqual([
      'facial',
      'text',
      'text',
    ])
  })

  it('counts audio tasks that have no transcription document', () => {
    expect(countPendingTranscriptions({ userAnswers })).toBe(1)
    expect(
      countPendingTranscriptions({ userAnswers, taskId: '1' }),
    ).toBe(0)
  })

  it('skips analyses that are already queued or processing', () => {
    const jobs = [
      {
        type: 'facial',
        userDocId: 'user-1',
        taskId: '0',
        status: 'queued',
      },
      {
        type: 'text',
        userDocId: 'user-1',
        taskId: '0',
        status: 'processing',
      },
      {
        type: 'transcription',
        userDocId: 'user-1',
        taskId: '0',
        status: 'queued',
      },
    ]

    expect(countPendingSentiment({ userAnswers, jobs })).toEqual({
      facial: 0,
      text: 1,
      total: 1,
    })
    expect(countPendingTranscriptions({ userAnswers, jobs })).toBe(0)
  })

  it('treats a stored text analysis with no speech as complete', () => {
    const coverage = new Map([
      [
        'user-1|0',
        {
          facial: null,
          text: {
            Positive: 0,
            Neutral: 0,
            Negative: 0,
            sampleCount: 0,
            regions: [],
          },
        },
      ],
    ])

    expect(
      countPendingSentiment({
        userAnswers,
        coverage,
        signal: 'text',
        taskId: '0',
      }).total,
    ).toBe(0)
  })

  it('still counts a task whose previous job failed', () => {
    expect(
      countPendingSentiment({
        userAnswers,
        jobs: [
          {
            type: 'facial',
            userDocId: 'user-1',
            taskId: '0',
            status: 'failed',
          },
        ],
        signal: 'facial',
        taskId: '0',
      }).total,
    ).toBe(1)
  })
})

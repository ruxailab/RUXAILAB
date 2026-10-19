jest.mock('@/app/services/facialSentiment/FacialSentimentService', () => ({
  analyzeFacialSentimentTask: jest.fn(),
}))
jest.mock('@/app/services/textSentiment/TextSentimentService', () => ({
  analyzeTextSentimentTask: jest.fn(),
}))

import { analyzeFacialSentimentTask } from '@/app/services/facialSentiment/FacialSentimentService'
import { analyzeTextSentimentTask } from '@/app/services/textSentiment/TextSentimentService'
import { runPendingSentimentAnalyses } from '@/app/services/sentiment/runPendingSentimentAnalyses'

describe('runPendingSentimentAnalyses', () => {
  beforeEach(() => {
    analyzeFacialSentimentTask.mockReset()
    analyzeTextSentimentTask.mockReset()
  })

  it('enqueues facial and text sentiment for each pending item', async () => {
    analyzeFacialSentimentTask.mockResolvedValue({ status: 'queued' })
    analyzeTextSentimentTask.mockResolvedValue({ status: 'queued' })

    const result = await runPendingSentimentAnalyses({
      answersDocId: 'answers-1',
      studyId: 'study-1',
      items: [
        { type: 'facial', userDocId: 'user-1', taskId: '0' },
        { type: 'text', userDocId: 'user-1', taskId: '0' },
      ],
    })

    expect(analyzeFacialSentimentTask).toHaveBeenCalledWith({
      answersDocId: 'answers-1',
      userDocId: 'user-1',
      taskId: '0',
      studyId: 'study-1',
    })
    expect(analyzeTextSentimentTask).toHaveBeenCalledWith({
      answersDocId: 'answers-1',
      userDocId: 'user-1',
      taskId: '0',
      studyId: 'study-1',
    })
    expect(result).toEqual({ queued: 2, failed: 0, failures: [] })
  })

  it('reports a partial failure without dropping the queued jobs', async () => {
    analyzeFacialSentimentTask.mockResolvedValue({ status: 'queued' })
    analyzeTextSentimentTask.mockRejectedValue(new Error('queue full'))

    const result = await runPendingSentimentAnalyses({
      answersDocId: 'answers-1',
      items: [
        { type: 'facial', userDocId: 'user-1', taskId: '0' },
        { type: 'text', userDocId: 'user-2', taskId: '1' },
      ],
    })

    expect(result.queued).toBe(1)
    expect(result.failed).toBe(1)
    expect(result.failures[0].type).toBe('text')
  })
})

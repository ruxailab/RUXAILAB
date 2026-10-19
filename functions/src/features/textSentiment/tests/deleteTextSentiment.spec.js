import { jest } from '@jest/globals'
import { Sentiment } from '../../../shared/models/Sentiment.js'
import { DeleteTextSentimentService } from '../service/DeleteTextSentimentService.js'

const study = {
  answersDocId: 'answer-1',
  testAdmin: { userDocId: 'owner' },
  studyRoleMap: { owner: 0 },
}

function createService(sentiment) {
  const sentimentRepository = {
    get: jest.fn(async () => sentiment),
    set: jest.fn(async () => undefined),
    delete: jest.fn(async () => undefined),
  }
  const answerRepository = {
    get: jest.fn(async () => ({ studyId: 'study-1' })),
    setSentimentDocId: jest.fn(async () => undefined),
  }
  const rebuild = { execute: jest.fn(async () => undefined) }

  const service = new DeleteTextSentimentService({
    userRepository: { isSuperAdmin: jest.fn(async () => false) },
    answerRepository,
    studyRepository: {
      get: jest.fn(async () => study),
      findByAnswersDocId: jest.fn(),
    },
    sentimentRepository,
    createRebuildService: jest.fn(() => rebuild),
    FieldValue: { serverTimestamp: () => 'ts' },
  })

  return { service, sentimentRepository, answerRepository, rebuild }
}

describe('DeleteTextSentimentService', () => {
  it('clears text sentiment and keeps the document when facial remains', async () => {
    const sentiment = Sentiment.create({
      id: 'sent-1',
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      facial: { Happy: 80 },
      text: { Positive: 60 },
    })
    const { service, sentimentRepository, answerRepository, rebuild } =
      createService(sentiment)

    const result = await service.execute({
      uid: 'owner',
      input: { sentimentDocId: 'sent-1' },
    })

    expect(sentimentRepository.set).toHaveBeenCalledWith(
      'sent-1',
      expect.objectContaining({ facial: { Happy: 80 }, text: null }),
      { merge: false },
    )
    expect(sentimentRepository.delete).not.toHaveBeenCalled()
    expect(answerRepository.setSentimentDocId).not.toHaveBeenCalled()
    expect(rebuild.execute).toHaveBeenCalledWith({ answersDocId: 'answer-1' })
    expect(result.side).toBe('text')
    expect(result.removedDocument).toBe(false)
  })

  it('deletes the document when facial sentiment is already empty', async () => {
    const sentiment = Sentiment.create({
      id: 'sent-1',
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      facial: null,
      text: { Positive: 60 },
    })
    const { service, sentimentRepository, answerRepository } =
      createService(sentiment)

    const result = await service.execute({
      uid: 'owner',
      input: { sentimentDocId: 'sent-1' },
    })

    expect(sentimentRepository.delete).toHaveBeenCalledWith('sent-1')
    expect(answerRepository.setSentimentDocId).toHaveBeenCalledWith(
      'answer-1',
      'user-1',
      '0',
      null,
    )
    expect(result.sentimentDocId).toBeNull()
  })
})
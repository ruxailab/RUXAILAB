import { jest } from '@jest/globals'
import { Sentiment } from '../../../shared/models/Sentiment.js'
import { DeleteSentimentSideService } from '../service/DeleteSentimentSideService.js'

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

  const service = new DeleteSentimentSideService({
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

describe('DeleteSentimentSideService', () => {
  it('clears facial sentiment and keeps the document when text remains', async () => {
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
      input: { sentimentDocId: 'sent-1', side: 'facial' },
    })

    expect(sentimentRepository.set).toHaveBeenCalledWith(
      'sent-1',
      expect.objectContaining({ facial: null, text: { Positive: 60 } }),
      { merge: false },
    )
    expect(sentimentRepository.delete).not.toHaveBeenCalled()
    expect(answerRepository.setSentimentDocId).not.toHaveBeenCalled()
    expect(rebuild.execute).toHaveBeenCalledWith({ answersDocId: 'answer-1' })
    expect(result).toEqual({
      sentimentDocId: 'sent-1',
      side: 'facial',
      removedDocument: false,
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
    })
  })

  it('deletes the document when the remaining side is empty', async () => {
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
      input: { sentimentDocId: 'sent-1', side: 'text' },
    })

    expect(sentimentRepository.delete).toHaveBeenCalledWith('sent-1')
    expect(answerRepository.setSentimentDocId).toHaveBeenCalledWith(
      'answer-1',
      'user-1',
      '0',
      null,
    )
    expect(result.removedDocument).toBe(true)
    expect(result.sentimentDocId).toBeNull()
  })

  it('rejects a caller without study access', async () => {
    const sentiment = Sentiment.create({
      id: 'sent-1',
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      facial: { Happy: 1 },
      text: null,
    })
    const { service, sentimentRepository } = createService(sentiment)

    await expect(
      service.execute({
        uid: 'stranger',
        input: { sentimentDocId: 'sent-1', side: 'facial' },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(sentimentRepository.delete).not.toHaveBeenCalled()
  })
})

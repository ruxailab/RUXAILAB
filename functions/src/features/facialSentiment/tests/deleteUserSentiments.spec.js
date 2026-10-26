import { jest } from '@jest/globals'
import { Sentiment } from '../../../shared/models/Sentiment.js'
import { DeleteUserSentimentsService } from '../service/DeleteUserSentimentsService.js'

const study = {
  answersDocId: 'answer-1',
  testAdmin: { userDocId: 'owner' },
  studyRoleMap: { owner: 0 },
}

function createService(items = []) {
  const sentimentRepository = {
    listByAnswerUser: jest.fn(async () => items),
    deleteMany: jest.fn(async (ids) => ids.length),
  }
  const answerRepository = {
    get: jest.fn(async () => ({ studyId: 'study-1' })),
  }
  const rebuild = { execute: jest.fn(async () => undefined) }

  const service = new DeleteUserSentimentsService({
    userRepository: { isSuperAdmin: jest.fn(async () => false) },
    answerRepository,
    studyRepository: {
      get: jest.fn(async () => study),
      findByAnswersDocId: jest.fn(),
    },
    sentimentRepository,
    createRebuildService: jest.fn(() => rebuild),
  })

  return { service, sentimentRepository, rebuild }
}

describe('DeleteUserSentimentsService', () => {
  it('deletes all sentiment documents for the user and rebuilds analytics', async () => {
    const items = [
      Sentiment.create({
        id: 'sent-1',
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        taskId: '0',
        facial: { Happy: 80 },
      }),
      Sentiment.create({
        id: 'sent-2',
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        taskId: '1',
        text: { Positive: 60 },
      }),
    ]
    const { service, sentimentRepository, rebuild } = createService(items)

    const result = await service.execute({
      uid: 'owner',
      input: {
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        studyId: 'study-1',
      },
    })

    expect(sentimentRepository.listByAnswerUser).toHaveBeenCalledWith(
      'answer-1',
      'user-1',
    )
    expect(sentimentRepository.deleteMany).toHaveBeenCalledWith([
      'sent-1',
      'sent-2',
    ])
    expect(rebuild.execute).toHaveBeenCalledWith({ answersDocId: 'answer-1' })
    expect(result).toEqual({
      deletedCount: 2,
      answersDocId: 'answer-1',
      userDocId: 'user-1',
    })
  })

  it('rebuilds analytics when the user has no sentiment documents', async () => {
    const { service, sentimentRepository, rebuild } = createService([])

    const result = await service.execute({
      uid: 'owner',
      input: {
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        studyId: 'study-1',
      },
    })

    expect(sentimentRepository.deleteMany).toHaveBeenCalledWith([])
    expect(rebuild.execute).toHaveBeenCalledWith({ answersDocId: 'answer-1' })
    expect(result.deletedCount).toBe(0)
  })

  it('rejects a caller without study access', async () => {
    const { service, sentimentRepository } = createService([
      Sentiment.create({
        id: 'sent-1',
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        taskId: '0',
      }),
    ])

    await expect(
      service.execute({
        uid: 'stranger',
        input: {
          answersDocId: 'answer-1',
          userDocId: 'user-1',
          studyId: 'study-1',
        },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(sentimentRepository.deleteMany).not.toHaveBeenCalled()
  })
})

import { jest } from '@jest/globals'
import {
  StudyReportService,
  answerCollectionFor,
  resolveAnswerKey,
} from '../service/StudyReportService.js'

const study = {
  id: 'study-1',
  answersDocId: 'answer-1',
  testType: 'USER',
  subType: 'USER_UNMODERATED',
  testAdmin: { userDocId: 'owner' },
  studyRoleMap: { owner: 0, manager: 4 },
}

const deleteSentinel = Symbol('delete')

function createService({
  answer = {
    studyId: 'study-1',
    type: 'USER',
    taskAnswers: {
      'participant-1': { userDocId: 'participant-1', submitted: true },
    },
  },
  user = { accessLevel: 1, myAnswers: { 'study-1': true } },
  isSuperAdmin = false,
} = {}) {
  const answerRepository = {
    get: jest.fn(async () => answer),
    update: jest.fn(async () => undefined),
  }
  const userRepository = {
    isSuperAdmin: jest.fn(async () => isSuperAdmin),
    get: jest.fn(async (id) => (id === 'participant-1' ? user : null)),
    update: jest.fn(async () => undefined),
  }
  const studyRepository = {
    get: jest.fn(async () => study),
    findByAnswersDocId: jest.fn(async () => study),
  }
  const service = new StudyReportService({
    userRepository,
    answerRepository,
    studyRepository,
    FieldValue: { delete: () => deleteSentinel },
  })
  return { service, answerRepository, userRepository, studyRepository }
}

describe('answerCollectionFor', () => {
  it('maps study types to the answers map field', () => {
    expect(answerCollectionFor('USER')).toBe('taskAnswers')
    expect(answerCollectionFor('CARD_SORTING')).toBe('cardSortingAnswers')
    expect(answerCollectionFor('HEURISTIC')).toBe('heuristicAnswers')
    expect(answerCollectionFor('heuristics')).toBe('heuristicAnswers')
  })
})

describe('resolveAnswerKey', () => {
  it('prefers the map key and falls back to a matching userDocId', () => {
    expect(resolveAnswerKey({ 'user-1': { userDocId: 'user-1' } }, 'user-1')).toBe(
      'user-1',
    )
    expect(
      resolveAnswerKey({ Ev1: { userDocId: 'anon-1' } }, 'anon-1'),
    ).toBe('Ev1')
    expect(resolveAnswerKey({ Ev1: { submitted: true } }, 'Ev1')).toBe('Ev1')
  })
})

describe('StudyReportService', () => {
  const input = {
    answersDocId: 'answer-1',
    userDocId: 'participant-1',
    studyId: 'study-1',
  }

  it('removes the participant answer and myAnswers reference', async () => {
    const { service, answerRepository, userRepository } = createService()

    await expect(
      service.remove({ uid: 'owner', input }),
    ).resolves.toEqual({
      success: true,
      answersDocId: 'answer-1',
      userDocId: 'participant-1',
      answerKey: 'participant-1',
    })

    expect(answerRepository.update).toHaveBeenCalledWith('answer-1', {
      'taskAnswers.participant-1': deleteSentinel,
    })
    expect(userRepository.update).toHaveBeenCalledWith('participant-1', {
      'myAnswers.study-1': deleteSentinel,
    })
  })

  it('removes an Ev-prefixed anonymous unmoderated answer by userDocId', async () => {
    const { service, answerRepository, userRepository } = createService({
      answer: {
        studyId: 'study-1',
        type: 'USER',
        taskAnswers: { Ev1: { userDocId: 'anon-1', submitted: true } },
      },
    })

    await service.remove({
      uid: 'owner',
      input: { ...input, userDocId: 'anon-1' },
    })

    expect(answerRepository.update).toHaveBeenCalledWith('answer-1', {
      'taskAnswers.Ev1': deleteSentinel,
    })
    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('skips myAnswers when the participant has no user document', async () => {
    const { service, userRepository } = createService()
    userRepository.get.mockResolvedValue(null)

    await service.remove({ uid: 'owner', input })
    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('hides an existing report', async () => {
    const { service, answerRepository } = createService()

    await expect(
      service.setHidden({ uid: 'owner', input: { ...input, hidden: true } }),
    ).resolves.toEqual({
      success: true,
      hidden: true,
      answersDocId: 'answer-1',
      userDocId: 'participant-1',
    })

    expect(answerRepository.update).toHaveBeenCalledWith('answer-1', {
      'taskAnswers.participant-1.hidden': true,
    })
  })

  it('rejects hiding a report that does not exist', async () => {
    const { service } = createService({
      answer: { studyId: 'study-1', type: 'USER', taskAnswers: {} },
    })

    await expect(
      service.setHidden({ uid: 'owner', input: { ...input, hidden: true } }),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('rejects a caller without study access', async () => {
    const { service, answerRepository } = createService()

    await expect(
      service.remove({ uid: 'stranger', input }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(answerRepository.update).not.toHaveBeenCalled()
  })

  it('allows a manager to remove a report', async () => {
    const { service, answerRepository } = createService()

    await service.remove({ uid: 'manager', input })
    expect(answerRepository.update).toHaveBeenCalled()
  })

  it('rejects a studyId that does not match the answers document', async () => {
    const { service, studyRepository } = createService()
    studyRepository.get.mockResolvedValue({
      ...study,
      id: 'other-study',
      answersDocId: 'other-answers',
    })

    await expect(
      service.remove({
        uid: 'owner',
        input: { ...input, studyId: 'other-study' },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })
})

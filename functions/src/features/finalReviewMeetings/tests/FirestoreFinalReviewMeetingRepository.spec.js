import { jest } from '@jest/globals'

const mockWriteAuditEvent = jest.fn()

jest.unstable_mockModule('../../../utils/auditTrail.js', () => ({
  writeAuditEvent: mockWriteAuditEvent,
}))

const { FirestoreFinalReviewMeetingRepository } = await import(
  '../repositories/FirestoreFinalReviewMeetingRepository.js'
)

const makeDocument = (path) => ({
  path,
  id: path.split('/').at(-1),
  collection: (name) => makeCollection(`${path}/${name}`),
})

const makeCollection = (path) => ({
  path,
  doc: (id = 'generated-id') => makeDocument(`${path}/${id}`),
})

describe('FirestoreFinalReviewMeetingRepository', () => {
  it('keeps Firestore references and transaction operations inside the repository', async () => {
    const firestoreTransaction = {
      get: jest.fn(async (reference) => ({ path: reference.path })),
      create: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    }
    const db = {
      collection: jest.fn((name) => makeCollection(name)),
      runTransaction: jest.fn((callback) => callback(firestoreTransaction)),
    }
    const FieldValue = { serverTimestamp: jest.fn(() => 'server-time') }
    const repository = new FirestoreFinalReviewMeetingRepository({ db, FieldValue })

    const result = await repository.runTransaction(async (transaction) => {
      const study = await transaction.getStudy('study-1')
      const user = await transaction.getUser('user-1')
      const answers = await transaction.getAnswers('answers-1')
      const meeting = await transaction.getMeeting('study-1', 'meeting-1')
      await transaction.getSourceEvaluations('study-1', 'meeting-1')
      await transaction.getDecision('study-1', 'meeting-1', 'decision-1')
      await transaction.getDecisions('study-1', 'meeting-1')

      const meetingId = transaction.createMeeting('study-1', { title: 'Review' })
      transaction.createSourceEvaluation('study-1', meetingId, 'expert-1', {
        evaluatorId: 'expert-1',
      })
      transaction.createDecisionHistory('study-1', meetingId, { revision: 1 })
      transaction.setDecision('study-1', meetingId, 'decision-1', { revision: 2 })
      transaction.updateMeeting('study-1', meetingId, { status: 'IN_PROGRESS' })
      transaction.writeAuditEvent('study-1', { action: 'review.created' })

      return { study, user, answers, meeting, meetingId, timestamp: transaction.serverTimestamp() }
    })

    expect(result.meetingId).toBe('generated-id')
    expect(result.timestamp).toBe('server-time')
    expect(result.study.path).toBe('tests/study-1')
    expect(result.user.path).toBe('users/user-1')
    expect(result.answers.path).toBe('answers/answers-1')
    expect(result.meeting.path).toBe('tests/study-1/finalReviewMeetings/meeting-1')
    expect(firestoreTransaction.create).toHaveBeenCalledTimes(3)
    expect(firestoreTransaction.set).toHaveBeenCalledTimes(1)
    expect(firestoreTransaction.update).toHaveBeenCalledTimes(1)
    expect(mockWriteAuditEvent).toHaveBeenCalledWith(
      firestoreTransaction,
      expect.objectContaining({ path: 'tests/study-1' }),
      { action: 'review.created' },
    )
  })
})

jest.mock('@/ux/UserTest/models/NasaTlxAnswer', () => ({
  NasaTlxAnswer: class {
    constructor(data) { Object.assign(this, data) }
    toFirestore() { return { ...this } }
  }
}))

jest.mock('@/ux/UserTest/models/TamAnswer', () => ({
  TamAnswer: class {
    constructor(data) { Object.assign(this, data) }
    toFirestore() { return { ...this } }
  }
}))

jest.mock('@/ux/UserTest/models/SartAnswer', () => {
  return {
    __esModule: true,
    default: class SartAnswer {
      constructor(data) { Object.assign(this, data || {}) }
      toFirestore() { return { ...this } }
    }
  }
})

import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'

describe('UserStudyEvaluatorAnswer', () => {
  describe('constructor', () => {
    it('sets all fields from provided data', () => {
      const data = {
        preTestAnswer: [{ q: 1, a: 'yes' }],
        consent: 'I agree',
        postTestAnswer: [{ q: 2, a: 'no' }],
        preTestCompleted: true,
        consentCompleted: true,
        fullName: 'Jane Doe',
        postTestCompleted: true,
        tasks: {},
        progress: 75,
        total: 4,
        submitted: true,
        userDocId: 'user-123',
        lastUpdate: '2026-01-01',
        invited: true,
        hidden: false,
      }

      const answer = new UserStudyEvaluatorAnswer(data)

      expect(answer.preTestAnswer).toEqual([{ q: 1, a: 'yes' }])
      expect(answer.consent).toBe('I agree')
      expect(answer.fullName).toBe('Jane Doe')
      expect(answer.consentCompleted).toBe(true)
      expect(answer.submitted).toBe(true)
      expect(answer.total).toBe(4)
      expect(answer.progress).toBe(75)
      expect(answer.userDocId).toBe('user-123')
      expect(answer.hidden).toBe(false)
    })

    it('applies defaults when no arguments provided', () => {
      const answer = new UserStudyEvaluatorAnswer()

      expect(answer.preTestAnswer).toEqual([])
      expect(answer.consent).toBe('')
      expect(answer.postTestAnswer).toEqual([])
      expect(answer.preTestCompleted).toBe(false)
      expect(answer.consentCompleted).toBe(false)
      expect(answer.fullName).toBe('')
      expect(answer.postTestCompleted).toBe(false)
      expect(answer.tasks).toEqual({})
      expect(answer.progress).toBeNull()
      expect(answer.total).toBe(0)
      expect(answer.submitted).toBe(false)
      expect(answer.userDocId).toBeNull()
      expect(answer.lastUpdate).toBeNull()
      expect(answer.invited).toBe(false)
      expect(answer.hidden).toBe(false)
      expect(answer.sessionNotes).toEqual([])
    })
  })

  describe('toFirestore', () => {
    it('returns correct shape for empty instance', () => {
      const answer = new UserStudyEvaluatorAnswer()
      const result = answer.toFirestore()

      expect(result).toEqual(
        expect.objectContaining({
          preTestAnswer: [],
          consent: '',
          postTestAnswer: [],
          preTestCompleted: false,
          consentCompleted: false,
          fullName: '',
          postTestCompleted: false,
          tasks: {},
          progress: null,
          total: 0,
          submitted: false,
          userDocId: null,
          lastUpdate: null,
          invited: false,
          hidden: false,
          sessionNotes: [],
        }),
      )
    })

    it('serializes tasks using TaskAnswer.toFirestore', () => {
      const taskData = {
        taskId: 'task-1',
        taskAnswer: 'My answer',
        completed: true,
      }

      const answer = new UserStudyEvaluatorAnswer({
        tasks: { 0: new TaskAnswer(taskData) },
      })

      const result = answer.toFirestore()

      expect(result.tasks).toBeDefined()
      expect(result.tasks['0']).toEqual(
        expect.objectContaining({
          taskId: 'task-1',
          taskAnswer: 'My answer',
          completed: true,
        }),
      )
    })

    it('wraps plain task objects in TaskAnswer before serializing', () => {
      const answer = new UserStudyEvaluatorAnswer({
        tasks: { 0: { taskId: 'task-2', completed: false } },
      })

      const result = answer.toFirestore()

      expect(result.tasks['0']).toEqual(
        expect.objectContaining({
          taskId: 'task-2',
          completed: false,
        }),
      )
    })
  })

  describe('toModel (static factory)', () => {
    it('creates instance from raw data', () => {
      const raw = {
        fullName: 'John',
        consentCompleted: true,
        tasks: {
          0: { taskId: 'task-1', completed: true },
          1: { taskId: 'task-2', completed: false },
        },
      }

      const result = UserStudyEvaluatorAnswer.toModel(raw)

      expect(result).toBeInstanceOf(UserStudyEvaluatorAnswer)
      expect(result.fullName).toBe('John')
      expect(result.consentCompleted).toBe(true)
    })

    it('converts task entries via TaskAnswer.toModel', () => {
      const raw = {
        tasks: {
          0: { taskId: 'task-1', taskAnswer: 'hello' },
        },
      }

      const result = UserStudyEvaluatorAnswer.toModel(raw)

      expect(result.tasks['0']).toBeInstanceOf(TaskAnswer)
      expect(result.tasks['0'].taskId).toBe('task-1')
    })
  })
})

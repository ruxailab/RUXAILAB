import { jest } from '@jest/globals'

const mockStudies = new Map()
const mockAnswers = new Map()
const mockUsers = new Map()

const snap = (id, data) => ({
  id,
  exists: data !== undefined,
  data: () => data,
})

const mockDb = {
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((id) => ({
      get: jest.fn(() => {
        if (collectionName === 'tests') {
          return Promise.resolve(snap(id, mockStudies.get(id)))
        }
        if (collectionName === 'answers') {
          return Promise.resolve(snap(id, mockAnswers.get(id)))
        }
        if (collectionName === 'users') {
          return Promise.resolve(snap(id, mockUsers.get(id)))
        }

        throw new Error(`Unexpected collection: ${collectionName}`)
      }),
    })),
  })),
}

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn(() => mockDb),
  },
  functions: {
    onCall: jest.fn((options) => options.handler),
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      },
    },
  },
}))

const { getMyStudyAnswer } = await import('../src/https/studyAnswers.js')

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const userStudy = (overrides = {}) => ({
  testType: 'USER',
  answersDocId: 'answer-1',
  isPublic: false,
  testAdmin: { userDocId: 'owner' },
  studyRoleMap: {},
  ...overrides,
})

const userAnswer = (overrides = {}) => ({
  type: 'USER',
  studyId: 'study-1',
  createdBy: 'owner',
  taskAnswers: {
    caller: { userDocId: 'caller', progress: 40 },
    other: { userDocId: 'other', progress: 100 },
  },
  ...overrides,
})

describe('getMyStudyAnswer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStudies.clear()
    mockAnswers.clear()
    mockUsers.clear()
  })

  it('requires authentication', async () => {
    await expect(getMyStudyAnswer(request(null, { studyId: 'study-1' })))
      .rejects.toThrow(expect.objectContaining({ code: 'unauthenticated' }))
  })

  it('requires studyId', async () => {
    await expect(getMyStudyAnswer(request('caller', {}))).rejects.toThrow(
      expect.objectContaining({ code: 'invalid-argument' }),
    )
  })

  it('denies a private study stranger', async () => {
    mockStudies.set('study-1', userStudy())
    mockUsers.set('caller', { accessLevel: 5 })

    await expect(
      getMyStudyAnswer(request('caller', { studyId: 'study-1' })),
    ).rejects.toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('returns only the caller task answer for a public user study', async () => {
    mockStudies.set('study-1', userStudy({ isPublic: true }))
    mockAnswers.set('answer-1', userAnswer())

    await expect(
      getMyStudyAnswer(request('caller', { studyId: 'study-1' })),
    ).resolves.toEqual({
      id: 'answer-1',
      type: 'USER',
      studyId: 'study-1',
      createdBy: 'owner',
      taskAnswers: {
        caller: { userDocId: 'caller', progress: 40 },
      },
    })
  })

  it('allows a private user study participant to read only their own task answer', async () => {
    mockStudies.set(
      'study-1',
      userStudy({
        studyRoleMap: {
          caller: 5,
        },
      }),
    )
    mockAnswers.set('answer-1', userAnswer())

    const result = await getMyStudyAnswer(
      request('caller', { studyId: 'study-1' }),
    )

    expect(result.taskAnswers).toEqual({
      caller: { userDocId: 'caller', progress: 40 },
    })
    expect(result.taskAnswers.other).toBeUndefined()
  })

  it('allows a heuristic evaluator to read only their own heuristic answer', async () => {
    mockStudies.set(
      'study-1',
      userStudy({
        testType: 'HEURISTIC',
        studyRoleMap: {
          caller: 1,
        },
      }),
    )
    mockAnswers.set('answer-1', {
      type: 'HEURISTIC',
      studyId: 'study-1',
      createdBy: 'owner',
      heuristicAnswers: {
        caller: { userDocId: 'caller', progress: 50 },
        other: { userDocId: 'other', progress: 90 },
      },
    })

    await expect(
      getMyStudyAnswer(request('caller', { studyId: 'study-1' })),
    ).resolves.toEqual({
      id: 'answer-1',
      type: 'HEURISTIC',
      studyId: 'study-1',
      createdBy: 'owner',
      heuristicAnswers: {
        caller: { userDocId: 'caller', progress: 50 },
      },
    })
  })

  it('ignores target user input and still returns only the caller answer', async () => {
    mockStudies.set('study-1', userStudy({ isPublic: true }))
    mockAnswers.set('answer-1', userAnswer())

    const result = await getMyStudyAnswer(
      request('caller', {
        studyId: 'study-1',
        targetUserId: 'other',
      }),
    )

    expect(result.taskAnswers).toEqual({
      caller: { userDocId: 'caller', progress: 40 },
    })
  })
})

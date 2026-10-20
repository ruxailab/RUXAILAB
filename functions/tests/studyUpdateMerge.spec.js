import { jest } from '@jest/globals'

const task = (name) => ({
  taskName: name,
  taskDescription: `Description for ${name}`,
  taskTip: '',
  taskLink: '',
  postQuestion: '',
  postForm: '',
  taskType: 'no-answer',
  hasAudioRecord: false,
  hasScreenRecord: false,
  hasCamRecord: false,
  hasEye: false,
  estimatedTime: 5,
})

const variable = (title) => ({
  answer: '',
  title,
  description: '',
  selectionFields: [],
  selectionField: false,
  textField: true,
})

const structure = ({ userTasks = [], postTest = [] } = {}) => ({
  welcomeMessage: '',
  finalMessage: '',
  preTest: [],
  userTasks,
  postTest,
  consent: '',
})

const storedStudy = {
  testTitle: 'Concurrent Editing Demo Study',
  testType: 'USER',
  testAdmin: { userDocId: 'owner', email: 'owner@example.test' },
  studyRoleMap: { owner: 0, admin2: 4 },
  cooperators: [
    { userDocId: 'admin2', accessLevel: 4, accepted: true },
  ],
  testStructure: structure({
    userTasks: [task('Original task'), task('Task added by owner')],
  }),
}

const transaction = {
  get: jest.fn(async (ref) => ({
    exists: true,
    data: () =>
      ref.name === 'users'
        ? { email: 'admin2@example.test', accessLevel: 4 }
        : storedStudy,
  })),
  update: jest.fn(),
  set: jest.fn(),
}

const db = {
  collection: (name) => ({
    doc: (id) => ({
      id,
      name,
      collection: () => ({ doc: () => ({ id: 'audit-event' }) }),
    }),
  }),
  runTransaction: jest.fn(async (handler) => handler(transaction)),
}

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(() => db), {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'server-time'),
        delete: jest.fn(() => 'delete'),
      },
    }),
    storage: jest.fn(),
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

const { updateStudyWithAudit } = await import('../src/https/studyUpdate.js')

const call = (data, uid = 'admin2') =>
  updateStudyWithAudit({
    auth: { uid, token: { email: 'admin2@example.test' } },
    data,
  })

describe('updateStudyWithAudit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('keeps the changes another admin made when a stale editor saves', async () => {
    const base = {
      testTitle: storedStudy.testTitle,
      testType: 'USER',
      testStructure: structure({ userTasks: [task('Original task')] }),
    }

    const result = await call({
      studyId: 'study-1',
      study: {
        testTitle: storedStudy.testTitle,
        testType: 'USER',
        testStructure: structure({
          userTasks: [task('Original task')],
          postTest: [variable('Post-test question from admin2')],
        }),
      },
      base,
    })

    expect(result.status).toBe('updated')

    const written = transaction.update.mock.calls[0][1]
    expect(written.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
      'Task added by owner',
    ])
    expect(written.testStructure.postTest.map((entry) => entry.title)).toEqual([
      'Post-test question from admin2',
    ])
  })

  it('records the changes that were really applied in the audit trail', async () => {
    const base = {
      testTitle: storedStudy.testTitle,
      testType: 'USER',
      testStructure: structure({ userTasks: [task('Original task')] }),
    }

    await call({
      studyId: 'study-1',
      study: {
        testTitle: storedStudy.testTitle,
        testType: 'USER',
        testStructure: structure({
          userTasks: [task('Original task')],
          postTest: [variable('Post-test question from admin2')],
        }),
      },
      base,
    })

    const auditEvent = transaction.set.mock.calls[0][1]
    expect(auditEvent.action).toBe('study.edited')
    expect(auditEvent.details.changedFields).toEqual(['testStructure'])
  })

  it('still replaces the study when the editor does not send a base snapshot', async () => {
    await call({
      studyId: 'study-1',
      study: {
        testTitle: storedStudy.testTitle,
        testType: 'USER',
        testStructure: structure({ userTasks: [task('Original task')] }),
      },
    })

    const written = transaction.update.mock.calls[0][1]
    expect(written.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
    ])
  })
})

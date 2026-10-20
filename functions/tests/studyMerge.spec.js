import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn(),
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

const { mergeStudyUpdates } = await import('../src/shared/studyMerge.js')

const task = (name, extra = {}) => ({
  taskName: name,
  taskDescription: `Description for ${name}`,
  taskType: 'no-answer',
  ...extra,
})

const variable = (title) => ({
  answer: '',
  title,
  description: '',
  selectionFields: [],
  selectionField: false,
  textField: true,
})

const structure = ({ userTasks = [], postTest = [], preTest = [], ...rest } = {}) => ({
  welcomeMessage: '',
  finalMessage: '',
  preTest,
  userTasks,
  postTest,
  consent: '',
  ...rest,
})

describe('mergeStudyUpdates', () => {
  it('keeps a task another admin added while the editor was working', () => {
    const base = { testStructure: structure({ userTasks: [task('Original task')] }) }
    const current = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task added by owner')],
      }),
    }
    const requested = {
      testStructure: structure({
        userTasks: [task('Original task')],
        postTest: [variable('Post-test question from admin2')],
      }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
      'Task added by owner',
    ])
    expect(merged.testStructure.postTest.map((entry) => entry.title)).toEqual([
      'Post-test question from admin2',
    ])
  })

  it('keeps a task the editor added and the task another admin added', () => {
    const base = { testStructure: structure({ userTasks: [task('Original task')] }) }
    const current = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task added by owner')],
      }),
    }
    const requested = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task added by admin2')],
      }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
      'Task added by admin2',
      'Task added by owner',
    ])
  })

  it('applies the change the editor made to a task', () => {
    const base = {
      testStructure: structure({ userTasks: [task('Original task')] }),
    }
    const current = {
      testStructure: structure({ userTasks: [task('Original task')] }),
    }
    const requested = {
      testStructure: structure({
        userTasks: [task('Original task', { taskDescription: 'New description' })],
      }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.userTasks[0].taskDescription).toBe('New description')
  })

  it('applies a task the editor deleted', () => {
    const base = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task to delete')],
      }),
    }
    const current = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task to delete')],
      }),
    }
    const requested = {
      testStructure: structure({ userTasks: [task('Original task')] }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
    ])
  })

  it('keeps a post-test variable another admin added', () => {
    const base = { testStructure: structure({ postTest: [] }) }
    const current = {
      testStructure: structure({ postTest: [variable('Question from admin2')] }),
    }
    const requested = {
      testStructure: structure({
        postTest: [variable('Question from admin2')],
        preTest: [variable('Question from admin3')],
      }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.postTest.map((entry) => entry.title)).toEqual([
      'Question from admin2',
    ])
    expect(merged.testStructure.preTest.map((entry) => entry.title)).toEqual([
      'Question from admin3',
    ])
  })

  it('keeps a study field another admin changed', () => {
    const base = { testTitle: 'Study', testDescription: 'Old description' }
    const current = { testTitle: 'Study', testDescription: 'Description of the owner' }
    const requested = { testTitle: 'Study', testDescription: 'Old description' }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testDescription).toBe('Description of the owner')
  })

  it('applies the request as it is when there is no base snapshot', () => {
    const current = {
      testStructure: structure({
        userTasks: [task('Original task'), task('Task added by owner')],
      }),
    }
    const requested = {
      testStructure: structure({ userTasks: [task('Original task')] }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base: null })

    expect(merged.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
    ])
  })

  it('merges a study that stores its tasks as a flat list', () => {
    const base = { testStructure: [task('Original task')] }
    const current = {
      testStructure: [task('Original task'), task('Task added by owner')],
    }
    const requested = {
      testStructure: structure({
        userTasks: [task('Original task')],
        postTest: [variable('Question from admin2')],
      }),
    }

    const merged = mergeStudyUpdates({ current, requestedUpdates: requested, base })

    expect(merged.testStructure.userTasks.map((entry) => entry.taskName)).toEqual([
      'Original task',
      'Task added by owner',
    ])
    expect(merged.testStructure.postTest.map((entry) => entry.title)).toEqual([
      'Question from admin2',
    ])
  })
})

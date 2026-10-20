import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn(),
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

const { applyStudyPatch } = await import('../src/https/studyUpdate.js')

describe('applying study update patches', () => {
  it('merges an editor patch into the latest study values', () => {
    const latest = {
      testStructure: {
        userTasks: [{ taskName: 'Task from the first admin' }],
        postTest: [],
      },
    }

    const { result, rootPaths } = applyStudyPatch(latest, [
      {
        path: ['testStructure', 'postTest'],
        value: [{ title: 'Question from the second admin' }],
      },
    ])

    expect(rootPaths).toEqual(new Set(['testStructure']))
    expect(result.testStructure).toEqual({
      userTasks: [{ taskName: 'Task from the first admin' }],
      postTest: [{ title: 'Question from the second admin' }],
    })
  })

  it('rejects malformed patch paths', () => {
    expect(() =>
      applyStudyPatch({}, [
        { path: ['__proto__', 'polluted'], value: true },
      ]),
    ).toThrow(expect.objectContaining({ code: 'invalid-argument' }))
  })
})

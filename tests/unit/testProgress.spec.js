import { calculateProgress } from '@/ux/UserTest/utils/testProgress'

describe('calculateProgress', () => {
  it('excludes optional stages that are not configured', () => {
    const answer = {
      consentCompleted: true,
      tasks: [{ attempted: true }, { attempted: false }],
    }

    expect(
      calculateProgress(answer, {
        preTest: [],
        postTest: [],
        userTasks: [{}, {}],
      }),
    ).toBe(67)
    expect(answer.progress).toBe(67)
  })

  it('counts each configured task as an individual progress unit', () => {
    const answer = {
      consentCompleted: true,
      preTestCompleted: true,
      tasks: [{ completed: true }, { attempted: false }, { attempted: false }],
      postTestCompleted: false,
    }

    expect(
      calculateProgress(answer, {
        preTest: [{}],
        postTest: [{}],
        userTasks: [{}, {}, {}],
      }),
    ).toBe(50)
  })

  it('reaches 100 percent when consent is the only applicable unit', () => {
    const answer = { consentCompleted: true, tasks: [] }

    expect(
      calculateProgress(answer, {
        preTest: [],
        postTest: [],
        userTasks: [],
      }),
    ).toBe(100)
  })
})

import {
  firstUnattemptedTaskIndex,
  resumeDestination,
  taskDestination,
} from '@/ux/UserTest/utils/unmoderatedNavigation'

describe('unmoderated task navigation', () => {
  it('advances to the next configured task', () => {
    expect(
      taskDestination({
        taskIndex: 0,
        taskCount: 2,
        hasEyeTracking: false,
        hasPostTest: true,
        postTestCompleted: false,
      }),
    ).toEqual({ kind: 'task', taskIndex: 1 })
  })

  it('opens a pending post-test after the final task', () => {
    expect(
      taskDestination({
        taskIndex: 0,
        taskCount: 1,
        hasEyeTracking: false,
        hasPostTest: true,
        postTestCompleted: false,
      }),
    ).toEqual({ kind: 'postTest', globalIndex: 5 })
  })

  it('skips an already completed post-test instead of rendering a blank stage', () => {
    expect(
      taskDestination({
        taskIndex: 0,
        taskCount: 1,
        hasEyeTracking: false,
        hasPostTest: true,
        postTestCompleted: true,
      }),
    ).toEqual({ kind: 'finish', globalIndex: 6 })
  })

  it('finishes directly when the study has no post-test', () => {
    expect(
      taskDestination({
        taskIndex: 0,
        taskCount: 1,
        hasEyeTracking: true,
        hasPostTest: false,
        postTestCompleted: false,
      }),
    ).toEqual({ kind: 'finish', globalIndex: 7 })
  })
})

describe('firstUnattemptedTaskIndex', () => {
  it('returns the first task that is neither attempted nor completed', () => {
    const tasks = [{ attempted: true }, { completed: true }, {}, {}]
    expect(firstUnattemptedTaskIndex(tasks, 4)).toBe(2)
  })

  it('returns -1 when every task was attempted', () => {
    expect(firstUnattemptedTaskIndex([{ attempted: true }], 1)).toBe(-1)
  })

  it('treats missing task answers as not attempted', () => {
    expect(firstUnattemptedTaskIndex(undefined, 2)).toBe(0)
  })
})

describe('resuming a returning participant', () => {
  const study = {
    hasPreTest: true,
    hasEyeTracking: false,
    hasPostTest: true,
    taskCount: 2,
  }

  it('sends a participant who has not consented to the consent step', () => {
    expect(resumeDestination({ ...study, answer: {} })).toEqual({
      kind: 'consent',
      globalIndex: 1,
      taskIndex: 0,
    })
  })

  it('does not send a participant who consented back to the consent step (#2486)', () => {
    const answer = {
      consentCompleted: true,
      preTestCompleted: true,
      tasks: [{ attempted: true }, { attempted: true }],
      postTestCompleted: true,
    }
    expect(resumeDestination({ ...study, answer })).toEqual({
      kind: 'finish',
      globalIndex: 6,
      taskIndex: 1,
    })
  })

  it('resumes at the pre-test when it is not done', () => {
    const answer = { consentCompleted: true, preTestCompleted: false }
    expect(resumeDestination({ ...study, answer })).toEqual({
      kind: 'preTest',
      globalIndex: 2,
      taskIndex: 0,
    })
  })

  it('resumes at the first task that was not attempted', () => {
    const answer = {
      consentCompleted: true,
      preTestCompleted: true,
      tasks: [{ attempted: true }, {}],
    }
    expect(resumeDestination({ ...study, answer })).toEqual({
      kind: 'task',
      globalIndex: 4,
      taskIndex: 1,
    })
  })

  it('calibrates eye tracking again before resuming the tasks', () => {
    const answer = {
      consentCompleted: true,
      preTestCompleted: true,
      tasks: [{ attempted: true }, {}],
    }
    expect(
      resumeDestination({ ...study, hasEyeTracking: true, answer }),
    ).toEqual({ kind: 'calibration', globalIndex: 3, taskIndex: 1 })
  })

  it('resumes at the post-test when every task was attempted', () => {
    const answer = {
      consentCompleted: true,
      preTestCompleted: true,
      tasks: [{ attempted: true }, { completed: true }],
      postTestCompleted: false,
    }
    expect(resumeDestination({ ...study, answer })).toEqual({
      kind: 'postTest',
      globalIndex: 5,
      taskIndex: 1,
    })
    expect(
      resumeDestination({ ...study, hasEyeTracking: true, answer }).globalIndex,
    ).toBe(6)
  })

  it('skips the stages that the study does not have', () => {
    const answer = { consentCompleted: true, tasks: [{ attempted: true }] }
    expect(
      resumeDestination({
        answer,
        hasPreTest: false,
        hasEyeTracking: false,
        hasPostTest: false,
        taskCount: 1,
      }),
    ).toEqual({ kind: 'finish', globalIndex: 6, taskIndex: 0 })
  })
})

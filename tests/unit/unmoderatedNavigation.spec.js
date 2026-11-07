import {
  firstOpenTaskIndex,
  taskDestination,
  welcomeStartStage,
} from '@/ux/UserTest/utils/unmoderatedNavigation'

describe('unmoderated task navigation', () => {
  it('starts at the first task when nothing has been saved', () => {
    expect(firstOpenTaskIndex([])).toBe(0)
    expect(
      firstOpenTaskIndex([
        { attempted: false, completed: false },
        { attempted: false, completed: false },
      ]),
    ).toBe(0)
  })

  it('skips a saved task 1 and opens task 2', () => {
    expect(
      firstOpenTaskIndex([
        { attempted: true, completed: true },
        { attempted: false, completed: false },
      ]),
    ).toBe(1)
  })

  it('treats a completed task without the attempted flag as already done', () => {
    expect(
      firstOpenTaskIndex([
        { completed: true },
        { attempted: false, completed: false },
      ]),
    ).toBe(1)
  })

  it('reports that every task is already done', () => {
    expect(
      firstOpenTaskIndex([
        { attempted: true, completed: true },
        { attempted: true, completed: false },
      ]),
    ).toBe(-1)
  })

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

describe('welcome start for a returning participant', () => {
  const study = { hasPreTest: false, hasEyeTracking: false }

  it('asks a new participant for consent', () => {
    expect(welcomeStartStage({ answer: {}, ...study })).toBe('consent')
    expect(welcomeStartStage({ answer: undefined, ...study })).toBe('consent')
  })

  it('asks again when the consent was not accepted', () => {
    expect(
      welcomeStartStage({ answer: { consentCompleted: false }, ...study }),
    ).toBe('consent')
  })

  it('continues with the tasks once the consent was accepted', () => {
    expect(
      welcomeStartStage({ answer: { consentCompleted: true }, ...study }),
    ).toBe('tasks')
  })

  it('opens a pre-test that is not done yet', () => {
    expect(
      welcomeStartStage({
        answer: { consentCompleted: true, preTestCompleted: false },
        hasPreTest: true,
        hasEyeTracking: true,
      }),
    ).toBe('preTest')
  })

  it('skips a finished pre-test', () => {
    expect(
      welcomeStartStage({
        answer: { consentCompleted: true, preTestCompleted: true },
        hasPreTest: true,
        hasEyeTracking: false,
      }),
    ).toBe('tasks')
  })

  it('calibrates the eye tracking again before the tasks', () => {
    expect(
      welcomeStartStage({
        answer: { consentCompleted: true, preTestCompleted: true },
        hasPreTest: true,
        hasEyeTracking: true,
      }),
    ).toBe('calibration')
  })

  it('leaves a submitted answer on the consent step as before', () => {
    expect(
      welcomeStartStage({
        answer: { consentCompleted: true, submitted: true },
        ...study,
      }),
    ).toBe('consent')
  })
})

import { taskDestination } from '@/ux/UserTest/utils/unmoderatedNavigation'

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

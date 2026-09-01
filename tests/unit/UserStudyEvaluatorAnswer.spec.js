import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'

describe('UserStudyEvaluatorAnswer', () => {
  it('merges participant progress without replacing saved metadata', () => {
    const saved = new UserStudyEvaluatorAnswer({
      consentCompleted: false,
      hidden: true,
      lastUpdate: 123,
      sessionNotes: [{ text: 'Keep this note' }],
      tasks: { 0: { taskId: 'task-1', attempted: false } },
    })
    const current = new UserStudyEvaluatorAnswer({
      consentCompleted: true,
      preTestCompleted: true,
      postTestCompleted: true,
      userDocId: 'participant-1',
      tasks: { 0: { taskId: 'task-1', attempted: true } },
    })

    const merged = UserStudyEvaluatorAnswer.mergeProgress(saved, current)

    expect(merged).toMatchObject({
      consentCompleted: true,
      preTestCompleted: true,
      postTestCompleted: true,
      userDocId: 'participant-1',
      hidden: true,
      lastUpdate: 123,
      sessionNotes: [{ text: 'Keep this note' }],
    })
    expect(merged.tasks[0].attempted).toBe(true)
  })
})

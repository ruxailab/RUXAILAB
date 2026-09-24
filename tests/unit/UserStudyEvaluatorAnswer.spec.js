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

  it('preserves saved participant identity when current progress omits it', () => {
    const saved = new UserStudyEvaluatorAnswer({
      userDocId: 'participant-1',
      invited: true,
    })
    const current = new UserStudyEvaluatorAnswer({ consentCompleted: true })

    expect(UserStudyEvaluatorAnswer.mergeProgress(saved, current)).toMatchObject({
      userDocId: 'participant-1',
      invited: true,
      consentCompleted: true,
    })
  })

  it('preserves sparse TAM positions through task serialization and reload', () => {
    const answer = new UserStudyEvaluatorAnswer({
      tasks: {
        0: {
          taskId: 'task-1',
          tamAnswers: {
            perceivedUsefulness: [, , 7],
            perceivedEaseOfUse: [null, 5],
          },
        },
      },
    })

    const saved = answer.toFirestore()

    expect(saved.tasks['0'].tamAnswers).toMatchObject({
      perceivedUsefulness: [null, null, 7],
      perceivedEaseOfUse: [null, 5],
    })
    expect(
      UserStudyEvaluatorAnswer.toModel(saved).tasks['0'].tamAnswers
        .perceivedUsefulness,
    ).toEqual([null, null, 7])
  })
})

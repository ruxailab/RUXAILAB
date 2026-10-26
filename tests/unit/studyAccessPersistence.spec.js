import Study from '@/shared/models/Study'
import StudyAnswer from '@/shared/models/StudyAnswer'

describe('study access persistence', () => {
  it('derives a role lookup map from accepted memberships only', () => {
    const study = new Study({
      testAdmin: { toFirestore: () => ({ userDocId: 'owner' }) },
      cooperators: [
        { userDocId: 'manager', accessLevel: 4, accepted: true },
        { userDocId: 'pending', accessLevel: 0, accepted: false },
        { userDocId: null, accessLevel: 3, accepted: true },
      ],
    })

    expect(study.toFirestore().studyRoleMap).toEqual({ manager: 4 })
  })

  it('persists the study link and creator on answer documents', () => {
    expect(
      new StudyAnswer({
        type: 'USER',
        studyId: 'study-1',
        createdBy: 'owner',
      }).toFirestore(),
    ).toEqual({
      type: 'USER',
      studyId: 'study-1',
      createdBy: 'owner',
      taskAnswers: {},
    })
  })
})

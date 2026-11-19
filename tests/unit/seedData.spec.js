import { buildSeedData, SEED_USERS } from '../../scripts/seed/seedData'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import StudyAnswer from '@/shared/models/StudyAnswer'
import User from '@/features/auth/models/UserModel'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import {
  calculateSUSScore,
  getSUSRating,
} from '@/ux/UserTest/utils/susCalculator'

const NOW = new Date(2026, 10, 14, 12, 0).getTime()

// The seed writes plain documents. These tests run them back through the
// app's own models, so the demo data cannot drift from what the app writes.
describe('emulator seed data', () => {
  const { users, studies, answers } = buildSeedData(NOW)

  it.each(Object.keys(studies))(
    'study %s matches what its model writes',
    (id) => {
      const study = studies[id]
      const model = instantiateStudyByType(study.testType, study)

      expect(model.toFirestore()).toEqual(study)
    },
  )

  it('gives every study an answers document of the same type', () => {
    Object.entries(studies).forEach(([id, study]) => {
      const answerDoc = answers[study.answersDocId]
      const empty = new StudyAnswer({
        type: study.testType,
        studyId: id,
        createdBy: SEED_USERS.researcher.uid,
      }).toFirestore()

      expect(answerDoc).toMatchObject({
        type: empty.type,
        studyId: empty.studyId,
        createdBy: empty.createdBy,
      })
      expect(Object.keys(answerDoc)).toEqual(Object.keys(empty))
    })
  })

  it('writes user documents in the shape of the User model', () => {
    Object.entries(users).forEach(([id, user]) => {
      expect(new User({ id, ...user }).toFirestore()).toEqual(user)
    })
  })

  it('lists every study under its owner', () => {
    const owner = users[SEED_USERS.researcher.uid]

    expect(Object.keys(owner.myTests)).toEqual(Object.keys(studies))
  })

  it('has submitted answers that cover every task of the user study', () => {
    const study = studies['seed-user-study']
    const { taskAnswers } = answers[study.answersDocId]

    Object.entries(taskAnswers).forEach(([userId, answer]) => {
      const model = UserStudyEvaluatorAnswer.toModel(answer)

      expect(model.userDocId).toBe(userId)
      expect(model.submitted).toBe(true)
      expect(Object.keys(model.tasks)).toHaveLength(
        study.testStructure.userTasks.length,
      )
    })
  })

  it('spreads the System Usability Scale scores across the ratings', () => {
    const { taskAnswers } = answers['seed-user-study-answers']
    const scores = Object.values(taskAnswers).map((answer) =>
      calculateSUSScore(answer.tasks[1].susAnswers),
    )

    expect(scores).toEqual([92.5, 70, 37.5])
    expect(scores.map(getSUSRating)).toEqual(['Excellent', 'Good', 'Poor'])
  })
})

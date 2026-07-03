import {
  buildStudyManagerCards,
  buildStudyNavigator,
} from '@/shared/utils/studyNavigation'
import { STUDY_ROLE } from '@/shared/utils/studyAccessPolicy'

const owner = { id: 'owner', accessLevel: 1 }

const studyWith = (testType, userId, role) => ({
  id: 'study-1',
  testType,
  testAdmin: { userDocId: owner.id },
  cooperators:
    userId && role !== null
      ? [{ userDocId: userId, accessLevel: role, accepted: true }]
      : [],
})

const titlesFor = (study, user, type = 'userTest/unmoderated') =>
  buildStudyNavigator({ study, user, type }).map((item) => item.title)

describe('study navigation', () => {
  it('shows every user-study Admin item, including Storage', () => {
    expect(titlesFor(studyWith('USER'), owner)).toEqual([
      'Manager',
      'Test',
      'Preview',
      'Reports',
      'Answers',
      'Cooperators',
      'Settings',
      'Storage',
    ])
  })

  it('shows a user-study Manager only their permitted destinations', () => {
    const user = { id: 'manager', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.MANAGER)

    expect(titlesFor(study, user)).toEqual([
      'Manager',
      'Test',
      'Preview',
      'Answers',
      'Cooperators',
    ])
  })

  it('shows an Observator the dashboard and Answers but not Storage', () => {
    const user = { id: 'observator', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.OBSERVATOR)

    expect(titlesFor(study, user)).toEqual(['Manager', 'Answers'])
  })

  it('shows heuristic-only management items to a heuristic Manager', () => {
    const user = { id: 'manager', accessLevel: 1 }
    const study = studyWith('HEURISTIC', user.id, STUDY_ROLE.MANAGER)

    expect(titlesFor(study, user, 'heuristic')).toEqual([
      'Manager',
      'Test',
      'Preview',
      'Answers',
      'Cooperators',
      'Final Report',
      'Evaluator Info',
    ])
  })

  it('does not build manager navigation for the user-study User role', () => {
    const user = { id: 'participant', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.USER)

    expect(titlesFor(study, user)).toEqual([])
  })

  it('filters manager dashboard cards through the same capability policy', () => {
    const user = { id: 'observator', accessLevel: 1 }
    const study = {
      ...studyWith('USER', user.id, STUDY_ROLE.OBSERVATOR),
      answersDocId: 'answers-1',
    }

    expect(
      buildStudyManagerCards({
        study,
        user,
        type: 'userTest/unmoderated',
      }),
    ).toMatchObject({
      topCards: [],
      bottomCards: [{ title: 'answers' }],
    })
  })
})

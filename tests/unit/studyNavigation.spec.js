import {
  buildStudyManagerCards,
  buildStudyNavigator,
  getAcceptedInvitationDestination,
  getCommunityStudyDestination,
} from '@/shared/utils/studyNavigation'
import { STUDY_ROLE } from '@/shared/utils/studyAccessPolicy'
import { USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

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
  it('opens a public community study as an answer, without visiting Manager', () => {
    const publicStudy = { ...studyWith('USER'), isPublic: true }

    expect(
      getCommunityStudyDestination({
        study: publicStudy,
        user: { id: 'public-participant', accessLevel: 1 },
      }),
    ).toEqual({ name: 'TestView', params: { id: publicStudy.id } })
  })

  it('opens a public community study as an answer before the user is hydrated', () => {
    const publicStudy = { ...studyWith('USER'), isPublic: true }

    expect(
      getCommunityStudyDestination({
        study: publicStudy,
        user: null,
      }),
    ).toEqual({ name: 'TestView', params: { id: publicStudy.id } })
  })

  it('uses the real study document id when public list items expose testDocId', () => {
    const publicStudy = {
      ...studyWith('USER'),
      id: 'list-row-id',
      testDocId: 'study-doc-id',
      isPublic: true,
    }

    expect(
      getCommunityStudyDestination({
        study: publicStudy,
        user: { id: 'public-participant', accessLevel: 1 },
      }),
    ).toEqual({ name: 'TestView', params: { id: 'study-doc-id' } })
  })

  it('opens a community study dashboard for invited members with dashboard access', () => {
    const user = { id: 'manager', accessLevel: 1 }
    const study = {
      ...studyWith('USER', user.id, STUDY_ROLE.MANAGER),
      subType: USER_STUDY_SUBTYPES.UNMODERATED,
      isPublic: true,
    }

    expect(
      getCommunityStudyDestination({
        study,
        user,
      }),
    ).toEqual({ name: 'UserUnmoderatedManagerView', params: { id: study.id } })
  })

  it('sends an accepted Manager invitation to the study dashboard', () => {
    const user = { id: 'manager', accessLevel: 1 }
    const study = {
      ...studyWith('USER', user.id, STUDY_ROLE.MANAGER),
      subType: USER_STUDY_SUBTYPES.MODERATED,
    }

    expect(getAcceptedInvitationDestination({ study, user })).toEqual({
      name: 'UserModeratedManagerView',
      params: { id: study.id },
    })
  })

  it('replaces an accepted participant invite token with their user id', () => {
    const user = { id: 'participant', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.USER)

    expect(getAcceptedInvitationDestination({ study, user })).toEqual({
      name: 'TestView',
      params: { id: study.id, token: user.id },
    })
  })

  it('sends accepted viewer roles to their manager dashboards', () => {
    const observator = { id: 'observator', accessLevel: 1 }
    const userStudy = {
      ...studyWith('USER', observator.id, STUDY_ROLE.OBSERVATOR),
      subType: USER_STUDY_SUBTYPES.UNMODERATED,
    }
    const guest = { id: 'guest', accessLevel: 1 }
    const heuristicStudy = studyWith(
      'HEURISTIC',
      guest.id,
      STUDY_ROLE.GUEST,
    )

    expect(
      getAcceptedInvitationDestination({
        study: userStudy,
        user: observator,
      }),
    ).toEqual({
      name: 'UserUnmoderatedManagerView',
      params: { id: userStudy.id },
    })
    expect(
      getAcceptedInvitationDestination({
        study: heuristicStudy,
        user: guest,
      }),
    ).toEqual({
      name: 'HeuristicManagerView',
      params: { id: heuristicStudy.id },
    })
  })

  it('sends an accepted heuristic Evaluator directly to the answer flow', () => {
    const evaluator = { id: 'evaluator', accessLevel: 1 }
    const study = studyWith(
      'HEURISTIC',
      evaluator.id,
      STUDY_ROLE.EVALUATOR,
    )

    expect(
      getAcceptedInvitationDestination({ study, user: evaluator }),
    ).toEqual({
      name: 'TestView',
      params: { id: study.id, token: evaluator.id },
    })
  })

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
      'Audit Trail',
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

  it('does not show Audit Trail to an invited Admin', () => {
    const user = { id: 'admin', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.ADMIN)

    expect(titlesFor(study, user)).not.toContain('Audit Trail')
  })

  it('keeps Preview hidden for a private-study Observator', () => {
    const user = { id: 'observator', accessLevel: 1 }
    const study = studyWith('USER', user.id, STUDY_ROLE.OBSERVATOR)

    expect(titlesFor(study, user)).toEqual(['Manager', 'Answers'])
  })

  it('shows Preview for an Observator on a public study', () => {
    const user = { id: 'observator', accessLevel: 1 }
    const study = {
      ...studyWith('USER', user.id, STUDY_ROLE.OBSERVATOR),
      isPublic: true,
    }

    expect(titlesFor(study, user)).toEqual([
      'Manager',
      'Preview',
      'Answers',
    ])
  })

  it('shows Preview for a Guest only when the heuristic study is public', () => {
    const user = { id: 'guest', accessLevel: 1 }
    const privateStudy = studyWith('HEURISTIC', user.id, STUDY_ROLE.GUEST)
    const publicStudy = { ...privateStudy, isPublic: true }

    expect(titlesFor(privateStudy, user, 'heuristic')).toEqual([
      'Manager',
      'Answers',
    ])
    expect(titlesFor(publicStudy, user, 'heuristic')).toEqual([
      'Manager',
      'Preview',
      'Answers',
    ])
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

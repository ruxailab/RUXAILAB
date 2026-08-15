import {
  STUDY_CAPABILITY,
  STUDY_ROLE,
  canManageCooperator,
  canJoinModeratedUserSession,
  getAssignableRoles,
  getAssignableRoleOptions,
  getSupportedRoleOptions,
  getStudyFallbackPath,
  hasStudyCapability,
  isModeratedSessionViewer,
  resolveStudyAccess,
} from '@/shared/utils/studyAccessPolicy'
import { USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

const owner = { id: 'owner', accessLevel: 1 }
const manager = { id: 'manager', accessLevel: 1 }
const observator = { id: 'observator', accessLevel: 1 }
const participant = { id: 'participant', accessLevel: 1 }

const userStudy = (overrides = {}) => ({
  id: 'study-1',
  testType: 'USER',
  isPublic: false,
  testAdmin: { userDocId: owner.id },
  cooperators: [
    {
      userDocId: manager.id,
      accessLevel: STUDY_ROLE.MANAGER,
      accepted: true,
    },
    {
      userDocId: observator.id,
      accessLevel: STUDY_ROLE.OBSERVATOR,
      accepted: true,
    },
  ],
  ...overrides,
})

describe('study access policy', () => {
  it('resolves owner, accepted membership, and pending invitation distinctly', () => {
    expect(resolveStudyAccess(userStudy(), owner)).toMatchObject({
      role: STUDY_ROLE.ADMIN,
      isOwner: true,
    })
    expect(resolveStudyAccess(userStudy(), manager)).toMatchObject({
      role: STUDY_ROLE.MANAGER,
      isAcceptedMember: true,
    })

    const pending = { id: 'pending', accessLevel: 1 }
    const study = userStudy({
      cooperators: [
        {
          userDocId: pending.id,
          accessLevel: STUDY_ROLE.MANAGER,
          accepted: false,
        },
      ],
    })
    expect(resolveStudyAccess(study, pending).role).toBeNull()
  })

  it('does not confuse application account level with a study role', () => {
    const ordinaryAccount = { id: 'uninvited', accessLevel: 1 }

    expect(resolveStudyAccess(userStudy(), ordinaryAccount).role).toBeNull()
  })

  it('allows a signed-in public participant to answer but not view the dashboard', () => {
    const study = userStudy({ isPublic: true })

    expect(
      hasStudyCapability(study, participant, STUDY_CAPABILITY.STUDY_ANSWER),
    ).toBe(true)
    expect(
      hasStudyCapability(study, participant, STUDY_CAPABILITY.DASHBOARD_VIEW),
    ).toBe(false)
  })

  it('allows viewer roles to answer public studies but not private studies', () => {
    const publicUserStudy = userStudy({ isPublic: true })
    const privateUserStudy = userStudy()
    const guest = { id: 'guest', accessLevel: 1 }
    const publicHeuristicStudy = userStudy({
      testType: 'HEURISTIC',
      isPublic: true,
      cooperators: [
        {
          userDocId: guest.id,
          accessLevel: STUDY_ROLE.GUEST,
          accepted: true,
        },
      ],
    })
    const privateHeuristicStudy = {
      ...publicHeuristicStudy,
      isPublic: false,
    }

    expect(
      hasStudyCapability(
        publicUserStudy,
        observator,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(true)
    expect(
      hasStudyCapability(
        privateUserStudy,
        observator,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(false)
    expect(
      hasStudyCapability(
        publicHeuristicStudy,
        guest,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(true)
    expect(
      hasStudyCapability(
        privateHeuristicStudy,
        guest,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(false)
  })

  it('applies the user-study capability matrix', () => {
    const study = userStudy()

    expect(
      hasStudyCapability(study, manager, STUDY_CAPABILITY.STUDY_EDIT),
    ).toBe(true)
    expect(
      hasStudyCapability(study, manager, STUDY_CAPABILITY.REPORTS_VIEW),
    ).toBe(false)
    expect(
      hasStudyCapability(study, observator, STUDY_CAPABILITY.ANSWERS_VIEW),
    ).toBe(true)
    expect(
      hasStudyCapability(
        study,
        observator,
        STUDY_CAPABILITY.ANSWERS_EXPORT_SUMMARY,
      ),
    ).toBe(false)
    expect(
      hasStudyCapability(study, manager, STUDY_CAPABILITY.STORAGE_ACCESS),
    ).toBe(false)
    expect(hasStudyCapability(study, manager, STUDY_CAPABILITY.LOGS_VIEW)).toBe(
      true,
    )
    expect(
      hasStudyCapability(study, observator, STUDY_CAPABILITY.LOGS_VIEW),
    ).toBe(true)
    expect(
      hasStudyCapability(study, participant, STUDY_CAPABILITY.LOGS_VIEW),
    ).toBe(false)
  })

  it('lets an Observator answer and view cooperators only for moderated user studies', () => {
    const moderatedStudy = userStudy({
      subType: USER_STUDY_SUBTYPES.MODERATED,
    })
    const unmoderatedStudy = userStudy({
      subType: USER_STUDY_SUBTYPES.UNMODERATED,
    })

    expect(
      hasStudyCapability(
        moderatedStudy,
        observator,
        STUDY_CAPABILITY.COOPERATORS_VIEW,
      ),
    ).toBe(true)
    expect(
      hasStudyCapability(
        unmoderatedStudy,
        observator,
        STUDY_CAPABILITY.COOPERATORS_VIEW,
      ),
    ).toBe(false)
    expect(
      hasStudyCapability(
        moderatedStudy,
        observator,
        STUDY_CAPABILITY.COOPERATORS_VIEW,
      ),
    ).toBe(true)
    expect(
      hasStudyCapability(
        moderatedStudy,
        observator,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(true)
    expect(
      hasStudyCapability(
        unmoderatedStudy,
        observator,
        STUDY_CAPABILITY.STUDY_ANSWER,
      ),
    ).toBe(false)
  })

  it('limits a user-study Manager to User and Observator assignments', () => {
    expect(getAssignableRoles(userStudy(), manager)).toEqual([
      STUDY_ROLE.USER,
      STUDY_ROLE.OBSERVATOR,
    ])
  })

  it('limits a heuristic Manager to Evaluator and Guest assignments', () => {
    const study = userStudy({
      testType: 'HEURISTIC',
      cooperators: [
        {
          userDocId: manager.id,
          accessLevel: STUDY_ROLE.MANAGER,
          accepted: true,
        },
      ],
    })

    expect(getAssignableRoles(study, manager)).toEqual([
      STUDY_ROLE.EVALUATOR,
      STUDY_ROLE.GUEST,
    ])
    expect(getAssignableRoleOptions(study, manager)).toEqual([
      { title: 'Evaluator', value: STUDY_ROLE.EVALUATOR },
      { title: 'Guest', value: STUDY_ROLE.GUEST },
    ])
  })

  it('exposes only roles supported by the current study type', () => {
    expect(getSupportedRoleOptions(userStudy())).toEqual([
      { title: 'Admin', value: STUDY_ROLE.ADMIN },
      { title: 'Manager', value: STUDY_ROLE.MANAGER },
      { title: 'User', value: STUDY_ROLE.USER },
      { title: 'Observator', value: STUDY_ROLE.OBSERVATOR },
    ])
  })

  it('prevents a Manager from assigning or removing Manager and Admin roles', () => {
    const study = userStudy()
    const targetManager = {
      userDocId: 'other-manager',
      accessLevel: STUDY_ROLE.MANAGER,
      accepted: true,
    }
    const targetObservator = {
      userDocId: observator.id,
      accessLevel: STUDY_ROLE.OBSERVATOR,
      accepted: true,
    }

    expect(
      canManageCooperator(study, manager, targetManager, {
        action: 'remove',
      }),
    ).toBe(false)
    expect(
      canManageCooperator(study, manager, targetObservator, {
        action: 'assignRole',
        role: STUDY_ROLE.MANAGER,
      }),
    ).toBe(false)
    expect(
      canManageCooperator(study, manager, targetObservator, {
        action: 'remove',
      }),
    ).toBe(true)
  })

  it('keeps an invited Admin from managing the Study Owner', () => {
    const invitedAdmin = { id: 'admin', accessLevel: 1 }
    const study = userStudy({
      cooperators: [
        {
          userDocId: invitedAdmin.id,
          accessLevel: STUDY_ROLE.ADMIN,
          accepted: true,
        },
      ],
    })

    expect(
      canManageCooperator(
        study,
        invitedAdmin,
        { userDocId: owner.id, accessLevel: STUDY_ROLE.ADMIN },
        { action: 'remove' },
      ),
    ).toBe(false)
  })

  it('falls back to the first destination allowed by the current policy', () => {
    expect(
      getStudyFallbackPath(userStudy(), manager, 'userTest/unmoderated'),
    ).toBe('/userTest/unmoderated/manager/study-1')

    const participantStudy = userStudy({
      cooperators: [
        {
          userDocId: participant.id,
          accessLevel: STUDY_ROLE.USER,
          accepted: true,
        },
      ],
    })
    expect(
      getStudyFallbackPath(
        participantStudy,
        participant,
        'userTest/unmoderated',
      ),
    ).toBe('/testview/study-1/participant')
    expect(
      getStudyFallbackPath(userStudy(), { id: 'removed', accessLevel: 1 }),
    ).toBe('/admin')
  })

  it('allows Manager and Observator to join another moderated user session as viewers', () => {
    const study = userStudy({
      cooperators: [
        ...userStudy().cooperators,
        {
          userDocId: participant.id,
          accessLevel: STUDY_ROLE.USER,
          accepted: true,
        },
      ],
    })

    expect(canJoinModeratedUserSession(study, manager, participant.id)).toBe(
      true,
    )
    expect(canJoinModeratedUserSession(study, observator, participant.id)).toBe(
      true,
    )
    expect(isModeratedSessionViewer(study, manager, participant.id)).toBe(true)
    expect(isModeratedSessionViewer(study, observator, participant.id)).toBe(
      true,
    )
  })

  it('keeps participants from joining another user session', () => {
    const study = userStudy({
      cooperators: [
        {
          userDocId: participant.id,
          accessLevel: STUDY_ROLE.USER,
          accepted: true,
        },
      ],
    })

    expect(
      canJoinModeratedUserSession(study, participant, participant.id),
    ).toBe(true)
    expect(canJoinModeratedUserSession(study, participant, manager.id)).toBe(
      false,
    )
    expect(isModeratedSessionViewer(study, participant, manager.id)).toBe(false)
  })
})

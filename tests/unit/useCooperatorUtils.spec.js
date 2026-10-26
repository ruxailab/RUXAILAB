import {
  enrichCooperatorInviteEntry,
  getPredefinedParticipantUserRole,
  useCooperatorUtils,
} from '@/shared/composables/useCooperatorUtils'
import { STUDY_ROLE, STUDY_ROLE_LABEL } from '@/shared/utils/studyAccessPolicy'

describe('getPredefinedParticipantUserRole', () => {
  it('assigns Evaluator to Heuristic, Card Sorting, and Focus Group participants', () => {
    expect(
      getPredefinedParticipantUserRole({ testType: 'HEURISTIC' }),
    ).toBe(STUDY_ROLE.EVALUATOR)
    expect(
      getPredefinedParticipantUserRole({ testType: 'CARD_SORTING' }),
    ).toBe(STUDY_ROLE.EVALUATOR)
    expect(
      getPredefinedParticipantUserRole({ testType: 'FOCUS_GROUP' }),
    ).toBe(STUDY_ROLE.EVALUATOR)
  })

  it('falls back to User for a plain user study', () => {
    expect(getPredefinedParticipantUserRole({ testType: 'USER' })).toBe(
      STUDY_ROLE.USER,
    )
  })
})

describe('enrichCooperatorInviteEntry', () => {
  it('fills the userDocId when the email belongs to a registered user', async () => {
    const entry = 'person@example.com'
    const resolver = jest.fn().mockResolvedValue({ id: 'user-123' })

    const result = await enrichCooperatorInviteEntry(entry, {
      resolveUserByEmail: resolver,
    })

    expect(resolver).toHaveBeenCalledWith('person@example.com')
    expect(result).toMatchObject({
      email: 'person@example.com',
      userDocId: 'user-123',
    })
  })

  it('keeps the existing userDocId when it is already present', async () => {
    const entry = { email: 'person@example.com', userDocId: 'existing-id' }
    const resolver = jest.fn()

    const result = await enrichCooperatorInviteEntry(entry, {
      resolveUserByEmail: resolver,
    })

    expect(resolver).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      email: 'person@example.com',
      userDocId: 'existing-id',
    })
  })
})

describe('useCooperatorUtils role chip helpers', () => {
  const { getRoleColor, getRoleIcon } = useCooperatorUtils()

  it('styles the Admin role label used by the cooperators table', () => {
    const adminLabel = STUDY_ROLE_LABEL[STUDY_ROLE.ADMIN]

    expect(getRoleColor(adminLabel)).toBe('primary')
    expect(getRoleIcon(adminLabel)).toBe('mdi-crown')
  })

  it('gives every supported role label a dedicated color and icon', () => {
    Object.values(STUDY_ROLE_LABEL).forEach((label) => {
      expect(getRoleColor(label)).not.toBe('grey')
    })

    expect(getRoleIcon(STUDY_ROLE_LABEL[STUDY_ROLE.MANAGER])).toBe(
      'mdi-account-cog',
    )
    expect(getRoleIcon(STUDY_ROLE_LABEL[STUDY_ROLE.OBSERVATOR])).toBe('mdi-eye')
  })

  it('still accepts the long "Administrator" label', () => {
    expect(getRoleColor('Administrator')).toBe('primary')
    expect(getRoleIcon('Administrator')).toBe('mdi-crown')
  })

  it('falls back to neutral styling for unknown or missing roles', () => {
    expect(getRoleColor(undefined)).toBe('grey')
    expect(getRoleColor('Something else')).toBe('grey')
    expect(getRoleIcon(null)).toBe('mdi-account')
  })
})

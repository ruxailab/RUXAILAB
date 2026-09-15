import {
  enrichCooperatorInviteEntry,
  getPredefinedParticipantUserRole,
} from '@/shared/composables/useCooperatorUtils'
import { STUDY_ROLE } from '@/shared/utils/studyAccessPolicy'

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

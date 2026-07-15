import { enrichCooperatorInviteEntry } from '@/shared/composables/useCooperatorUtils'

describe('enrichCooperatorInviteEntry', () => {
  it('fills the userDocId when the email belongs to a registered user', async () => {
    const entry = 'person@example.com'
    const resolver = jest.fn().mockResolvedValue({ id: 'user-123' })

    const result = await enrichCooperatorInviteEntry(entry, {
      resolveUserByEmail: resolver,
    })

    expect(resolver).toHaveBeenCalledWith('person@example.com')
    expect(result).toEqual({
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
    expect(result).toEqual({
      email: 'person@example.com',
      userDocId: 'existing-id',
    })
  })
})

import {
  getCooperatorInviteValidationError,
  normalizeCooperatorInviteEntry,
} from '@/shared/composables/useCooperatorUtils'

describe('getCooperatorInviteValidationError', () => {
  it('rejects invalid email addresses', () => {
    const result = getCooperatorInviteValidationError({
      email: 'invalid-email',
      currentUserEmail: 'owner@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      registeredUsers: [],
    })

    expect(result).toBe('Please enter a valid email address.')
  })

  it('rejects inviting the logged in user', () => {
    const result = getCooperatorInviteValidationError({
      email: 'me@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      registeredUsers: [],
    })

    expect(result).toBe('You cannot invite yourself.')
  })

  it('rejects inviting the study owner', () => {
    const result = getCooperatorInviteValidationError({
      email: 'study-owner@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      registeredUsers: [],
    })

    expect(result).toBe('The study owner cannot be invited as a cooperator.')
  })

  it('rejects inviting someone already listed as a cooperator', () => {
    const result = getCooperatorInviteValidationError({
      email: 'existing@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [{ email: 'existing@example.com' }],
      registeredUsers: [],
    })

    expect(result).toBe('This email is already a cooperator for this study.')
  })

  it('allows a valid email that matches a registered user', () => {
    const result = getCooperatorInviteValidationError({
      email: 'registered@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      registeredUsers: [{ email: 'registered@example.com' }],
    })

    expect(result).toBeNull()
  })

  it('normalizes a typed invite into an email payload', () => {
    const result = normalizeCooperatorInviteEntry('new@example.com', [
      { id: 'user-1', email: 'new@example.com' },
    ])

    expect(result).toEqual({ email: 'new@example.com', userDocId: 'user-1' })
  })
})

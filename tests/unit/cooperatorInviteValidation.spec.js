import {
  getCooperatorInviteValidationError,
  normalizeCooperatorInviteEntry,
} from '@/shared/composables/useCooperatorUtils'

const t = (key) => {
  const messages = {
    'cooperators.validation.invalidEmail':
      'Please enter a valid email address.',
    'cooperators.validation.invalidFormat':
      'Please enter a valid email address.',
    'cooperators.validation.inviteSelf': 'You cannot invite yourself.',
    'cooperators.validation.inviteOwner':
      'The study owner cannot be invited as a cooperator.',
    'cooperators.validation.alreadyCooperator':
      'This email is already a cooperator for this study.',
  }

  return messages[key]
}

describe('getCooperatorInviteValidationError', () => {
  it('rejects invalid email addresses', () => {
    const result = getCooperatorInviteValidationError({
      email: 'invalid-email',
      currentUserEmail: 'owner@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      t,
    })

    expect(result).toBe('Please enter a valid email address.')
  })

  it('rejects inviting the logged in user', () => {
    const result = getCooperatorInviteValidationError({
      email: 'me@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      t,
    })

    expect(result).toBe('You cannot invite yourself.')
  })

  it('rejects inviting the study owner', () => {
    const result = getCooperatorInviteValidationError({
      email: 'study-owner@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      t,
    })

    expect(result).toBe('The study owner cannot be invited as a cooperator.')
  })

  it('rejects inviting someone already listed as a cooperator', () => {
    const result = getCooperatorInviteValidationError({
      email: 'existing@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [{ email: 'existing@example.com' }],
      t,
    })

    expect(result).toBe('This email is already a cooperator for this study.')
  })

  it('returns null for valid email', () => {
    const result = getCooperatorInviteValidationError({
      email: 'registered@example.com',
      currentUserEmail: 'me@example.com',
      studyOwnerEmail: 'study-owner@example.com',
      existingCooperators: [],
      t,
    })

    expect(result).toBeNull()
  })
})

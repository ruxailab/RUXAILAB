import {
  formatEmailList,
  isEmailSent,
  MAX_LISTED_EMAILS,
  reportEmailResult,
  reportInvitationResults,
  warnUnsentEmails,
} from '@/shared/utils/emailDelivery'
import { showSuccess, showWarning } from '@/shared/utils/toast'

jest.mock('@/shared/utils/toast', () => ({
  showSuccess: jest.fn(),
  showWarning: jest.fn(),
}))
jest.mock('@/app/plugins/i18n', () => ({
  global: {
    t: (key, params) => {
      if (key === 'common.listAndMore') {
        return `${params.list} and ${params.count} more`
      }
      return params ? `${key}: ${params.emails ?? params.users}` : key
    },
  },
}))

const addresses = (count) =>
  Array.from({ length: count }, (_, i) => `user${i + 1}@example.test`)

describe('emailDelivery', () => {
  it('only treats an explicit success as sent', () => {
    expect(isEmailSent({ success: true })).toBe(true)
    expect(isEmailSent({ success: false, message: 'Network Error' })).toBe(
      false,
    )
    expect(isEmailSent(undefined)).toBe(false)
  })

  it('warns once, listing each unsent address once', () => {
    const warned = warnUnsentEmails([
      'ana@example.test',
      'ana@example.test',
      '',
      'ben@example.test',
    ])

    expect(warned).toBe(true)
    expect(showWarning).toHaveBeenCalledTimes(1)
    expect(showWarning).toHaveBeenCalledWith(
      'errors.emailNotSent: ana@example.test, ben@example.test',
    )
  })

  it('does not warn when every email was sent', () => {
    expect(warnUnsentEmails([])).toBe(false)
    expect(warnUnsentEmails(undefined)).toBe(false)
    expect(showWarning).not.toHaveBeenCalled()
  })

  describe('formatEmailList', () => {
    it('lists every address up to the limit', () => {
      expect(MAX_LISTED_EMAILS).toBe(3)
      expect(formatEmailList(addresses(3))).toBe(
        'user1@example.test, user2@example.test, user3@example.test',
      )
    })

    it('names the first addresses and counts the rest', () => {
      expect(formatEmailList(addresses(20))).toBe(
        'user1@example.test, user2@example.test, user3@example.test and 17 more',
      )
    })
  })

  it('keeps the warning short when a large batch fails', () => {
    warnUnsentEmails(addresses(20))

    expect(showWarning).toHaveBeenCalledWith(
      'errors.emailNotSent: user1@example.test, user2@example.test, user3@example.test and 17 more',
    )
  })

  describe('reportEmailResult', () => {
    const report = (emailSent) =>
      reportEmailResult({
        emailSent,
        email: 'ana@example.test',
        successMessage: 'pages.cooperators.invitationSent',
      })

    it('shows the success message when the email was sent', () => {
      report(true)

      expect(showSuccess).toHaveBeenCalledWith(
        'pages.cooperators.invitationSent',
      )
      expect(showWarning).not.toHaveBeenCalled()
    })

    it('warns instead of reporting success when the email failed', () => {
      report(false)

      expect(showWarning).toHaveBeenCalledWith(
        'errors.emailNotSent: ana@example.test',
      )
      expect(showSuccess).not.toHaveBeenCalled()
    })

    it('shows the success message when there was no email to send', () => {
      report(null)

      expect(showSuccess).toHaveBeenCalled()
      expect(showWarning).not.toHaveBeenCalled()
    })
  })

  describe('reportInvitationResults', () => {
    it('lists only the invitations whose email went out as sent', () => {
      reportInvitationResults([
        { email: 'ana@example.test', emailSent: true },
        { email: 'ben@example.test', emailSent: false },
      ])

      expect(showSuccess).toHaveBeenCalledWith(
        'cooperators.inviteSent: ana@example.test',
      )
      expect(showWarning).toHaveBeenCalledWith(
        'errors.emailNotSent: ben@example.test',
      )
    })

    it('keeps the success message short for a large batch', () => {
      reportInvitationResults(
        addresses(5).map((email) => ({ email, emailSent: true })),
      )

      expect(showSuccess).toHaveBeenCalledWith(
        'cooperators.inviteSent: user1@example.test, user2@example.test, user3@example.test and 2 more',
      )
    })

    it('only warns when no invitation email went out', () => {
      reportInvitationResults([{ email: 'ben@example.test', emailSent: false }])

      expect(showSuccess).not.toHaveBeenCalled()
      expect(showWarning).toHaveBeenCalledTimes(1)
    })
  })
})

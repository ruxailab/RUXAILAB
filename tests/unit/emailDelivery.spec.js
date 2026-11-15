import {
  isEmailSent,
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
    t: (key, params) =>
      params ? `${key}: ${params.emails ?? params.users}` : key,
  },
}))

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

    it('only warns when no invitation email went out', () => {
      reportInvitationResults([{ email: 'ben@example.test', emailSent: false }])

      expect(showSuccess).not.toHaveBeenCalled()
      expect(showWarning).toHaveBeenCalledTimes(1)
    })
  })
})

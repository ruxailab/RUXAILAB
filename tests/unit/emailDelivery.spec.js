import { isEmailSent, warnUnsentEmails } from '@/shared/utils/emailDelivery'
import { showWarning } from '@/shared/utils/toast'

jest.mock('@/shared/utils/toast', () => ({ showWarning: jest.fn() }))
jest.mock('@/app/plugins/i18n', () => ({
  global: { t: (key, params) => `${key}: ${params?.emails}` },
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
})

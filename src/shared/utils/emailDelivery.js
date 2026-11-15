import i18n from '@/app/plugins/i18n'
import { showWarning } from '@/shared/utils/toast'

/**
 * EmailController.send() reports a failed delivery as `{ success: false }`
 * instead of throwing, so every caller has to check its result.
 * @param {{ success?: boolean }} result - EmailController.send() result
 * @returns {boolean}
 */
export const isEmailSent = (result) => result?.success === true

/**
 * Warns which recipients did not receive their email. The invitation,
 * message or session itself was saved, so this is a warning, not an error.
 * @param {string[]} [emails] - Addresses whose email could not be sent
 * @returns {boolean} Whether a warning was shown
 */
export function warnUnsentEmails(emails = []) {
  const unsent = [...new Set(emails.filter(Boolean))]
  if (!unsent.length) return false

  showWarning(
    i18n.global.t('errors.emailNotSent', { emails: unsent.join(', ') }),
  )
  return true
}

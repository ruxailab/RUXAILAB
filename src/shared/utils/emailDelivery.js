import i18n from '@/app/plugins/i18n'
import { showSuccess, showWarning } from '@/shared/utils/toast'

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

/**
 * Reports one email-backed action, such as a re-invitation or a member
 * message: the success message when the email went out, a warning when it
 * failed. `emailSent: null` means there was no email to send.
 * @param {{ emailSent: boolean|null, email: string, successMessage: string }} result
 */
export function reportEmailResult({ emailSent, email, successMessage }) {
  if (emailSent === false) {
    warnUnsentEmails([email])
  } else {
    showSuccess(successMessage)
  }
}

/**
 * Reports a batch of invitations. They are saved even when their email
 * fails, so only those whose email went out are listed as sent.
 * @param {{ email: string, emailSent: boolean }[]} invites
 */
export function reportInvitationResults(invites = []) {
  const sent = invites.filter((invite) => invite.emailSent)

  if (sent.length > 0) {
    showSuccess(
      i18n.global.t('cooperators.inviteSent', {
        users: sent.map((invite) => invite.email).join(', '),
      }),
    )
  }

  warnUnsentEmails(
    invites.filter((invite) => !invite.emailSent).map((invite) => invite.email),
  )
}

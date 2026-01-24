import axios from 'axios'

export default class EmailController {
  /**
   *
   * @param {Object} payload - Email payload object
   * @param {string} payload.to - Recipient email address
   * @param {string} payload.subject - Email subject
   * @param {string} payload.template - Email type (e.g., 'invite', 'passwordReset', 'invitationAccepted')
   * @param {Array} payload.attachments - Optional attachments
   * @param {Object} payload.data - Additional data for the email template
   * @param {boolean} payload.isUnregisteredUser - Whether the recipient is an unregistered user
   *
   * @returns {Promise<{success: boolean, message: string}>} Result of email send operation
   */
  async send(payload) {
    try {
      await axios.post(process.env.VUE_APP_CLOUD_FUNCTIONS_URL + '/sendEmail', {
        data: payload,
      })
      return { success: true, message: 'Email sent successfully.' }
    } catch (error) {
      console.error('Email sending failed:', error.message)
      return { success: false, message: 'Failed to send email. Please try again.', error: error.message }
    }
  }
}
import { fbFunctions } from '@/app/plugins/firebase'
import { httpsCallable } from 'firebase/functions'

export default class EmailController {
  /**
   *
   * @param {Object} payload - Email payload object
   * @param {string} payload.to - Recipient email address
   * @param {string} payload.subject - Email subject
   * @param {string} payload.template - Email type (e.g., 'invitation')
   * @param {Array} payload.attachments - Optional attachments
   * @param {Object} payload.data - Additional data for the email template
   *
   * @returns {Promise<{success: boolean, message: string}>} Result of email send operation
   */
  async send(payload) {
    try { 
      // Use Firebase SDK callable function instead of HTTP
      // Firebase callable wraps the argument automatically, so pass payload directly
      const sendEmailFunction = httpsCallable(fbFunctions, 'sendEmail')
      await sendEmailFunction(payload)
      return { success: true, message: 'Email sent successfully.' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

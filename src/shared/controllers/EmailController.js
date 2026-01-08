import axios from 'axios';

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
      await axios.post(process.env.VUE_APP_CLOUD_FUNCTIONS_URL + '/sendEmail', { data: payload });
      return { success: true, message: "Email sent successfully." };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: error.message };
    }
  }
}

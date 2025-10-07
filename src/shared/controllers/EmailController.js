import axios from 'axios';

export default class EmailController {
  /**
   *
   * @param to Recipient email address
   * @param subject Email subject
   * @param template Email type (e.g., 'invitation')
   * @param attachments Optional attachments
   * @param data Additional data for the email template
   *
   * @returns
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

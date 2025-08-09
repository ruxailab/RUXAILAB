import { admin, functions } from '../f.firebase.js'
import nodemailer from 'nodemailer'

export const deleteAuth = functions.onCall({
  handler: async (data) => {
    try {
      await admin.auth().deleteUser(data.id)
      return 'User deleted successfully.'
    } catch (err) {
      console.error('Error deleting user:', err)
      return err
    }
  }
})

export const sendEmail = functions.onCall({
  handler: async (data) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VUE_APP_FIREBASE_EMAIL,
        pass: process.env.VUE_APP_FIREBASE_PASSWORD,
      },
    })

    const mail = {
      from: 'Uramaki Lab',
      to: data.guest.email,
      subject: 'You have been invited to evaluate a test!',
      html: data.template,
      attachments: data.attachments ?? [],
    }

    try {
      const info = await transporter.sendMail(mail)
      return `Message sent: ${info.messageId}`
    } catch (error) {
      console.error('Error sending email:', error)
      return `Error sending email: ${error.message}`
    }
  }
})

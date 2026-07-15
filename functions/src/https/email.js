import { admin, functions } from '../f.firebase.js'
import nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from 'firebase-functions'

export const sendEmail = functions.onCall({
  handler: async (data) => {
    // Firebase callable passes the argument directly
    const content = data.data || data

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    let htmlTemplate = ''
    if (content.template === 'invite') {
      const templatePath = path.join(
        process.cwd(),
        'src/templates/mails/invitations.html',
      )

      htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
      htmlTemplate = htmlTemplate
        .replace(
          /{{invitationLink}}/g,
          content.data.invitationLink || process.env.SITE_URL,
        )
        .replace('{{message}}', content.data.message)
        .replace(/{{testTitle}}/g, content.data.testTitle)
        .replace(/{{testDescription}}/g, content.data.testDescription)
        .replace(/{{adminEmail}}/g, content.data.adminEmail)
        .replace(/{{adminName}}/g, content.data.adminName)
    } else if (content.template === 'passwordReset') {
      const actionCodeSettings = {
        url: `${process.env.SITE_URL}/signin`,
        handleCodeInApp: false,
      }

      const link = await admin
        .auth()
        .generatePasswordResetLink(content.to, actionCodeSettings)
      const templatePath = path.join(
        process.cwd(),
        'src/templates/mails/passwordReset.html',
      )
      htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
      htmlTemplate = htmlTemplate.replace('{{resetLink}}', link)
    } else if (content.template === 'emailVerification') {
      const actionCodeSettings = {
        url: `${process.env.SITE_URL}/verify-email`,
        handleCodeInApp: false,
      }

      const link = await admin
        .auth()
        .generateEmailVerificationLink(content.to, actionCodeSettings)
      const templatePath = path.join(
        process.cwd(),
        'src/templates/mails/emailVerification.html',
      )
      htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
      htmlTemplate = htmlTemplate
        .replace('{{verificationLink}}', link)
        .replace('{{userName}}', content.data.userName || 'User')
    }

    const mail = {
      from: process.env.SMTP_USER || 'no-reply@ruxailab.com',
      to: content.to,
      subject: content.subject,
      html: htmlTemplate,
      attachments: content.attachments ?? [],
    }

    try {
      await transporter.sendMail(mail)
      logger.info('Email sent successfully to', { to: content.to })
      return 'Email sent successfully.'
    } catch (err) {
      logger.error('Error sending email:', { error: err })
      return err
    }
  },
})

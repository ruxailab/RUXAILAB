import { admin, functions } from '../f.firebase.js'
import nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from 'firebase-functions'

export const sendEmail = functions.onCall({
  handler: async (data) => {
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

    switch (content.template || 'message') {
      case 'invite': {
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
          .replace(/{{title}}/g, content.data.title || '')
          .replace(/{{description}}/g, content.data.description || '')
          .replace(/{{message}}/g, content.data.message || '')
          .replace(/{{testTitle}}/g, content.data.testTitle || '')
          .replace(/{{testDescription}}/g, content.data.testDescription || '')
          .replace(/{{adminEmail}}/g, content.data.adminEmail || '')
          .replace(/{{adminName}}/g, content.data.adminName || '')

        break
      }

      case 'passwordReset': {
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

        htmlTemplate = htmlTemplate.replace(/{{resetLink}}/g, link)

        break
      }

      case 'emailVerification': {
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
          .replace(/{{verificationLink}}/g, link)
          .replace(/{{userName}}/g, content.data.userName || 'User')

        break
      }
      case 'session-invite': {
        const templatePath = path.join(
          process.cwd(),
          'src/templates/mails/sessionInvite.html',
        )

        htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

        htmlTemplate = htmlTemplate
          .replace(/{{title}}/g, content.data.title || '')
          .replace(/{{description}}/g, content.data.description || '')
          .replace(/{{studyTitle}}/g, content.data.studyTitle || '')
          .replace(/{{testDescription}}/g, content.data.studyDescription || '')
          .replace(/{{sessionTitle}}/g, content.data.sessionTitle || '')
          .replace(/{{sessionMessage}}/g, content.data.sessionMessage || '')
          .replace(/{{scheduledAt}}/g, content.data.scheduledAt || '')
          .replace(/{{invitedBy}}/g, content.data.invitedBy || '')
          .replace(
            /{{sessionLink}}/g,
            content.data.sessionLink || process.env.SITE_URL,
          )

        break
      }

      case 'message':
      default: {
        const templatePath = path.join(
          process.cwd(),
          'src/templates/mails/message.html',
        )

        htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

        htmlTemplate = htmlTemplate
          .replace(/{{title}}/g, content.data.title || '')
          .replace(/{{message}}/g, content.data.message || '')
          .replace(/{{author}}/g, content.data.author || '')
          .replace(/{{actionText}}/g, content.data.actionText || '')
          .replace(
            /{{actionLink}}/g,
            content.data.actionLink || process.env.SITE_URL,
          )

        break
      }
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

      logger.info('Email sent successfully to', {
        to: content.to,
        template: content.template || 'message',
      })

      return 'Email sent successfully.'
    } catch (err) {
      logger.error('Error sending email:', {
        to: content.to,
        template: content.template || 'message',
        error: err,
      })

      return err
    }
  },
})

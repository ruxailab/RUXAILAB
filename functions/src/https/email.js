import { admin, functions } from "../f.firebase.js";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import logger from "../utils/logger.js";

export const sendEmail = functions.onCall({
  handler: async (data) => {
    const content = data.data;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let htmlTemplate = "";
    if (content.template === 'invite') {
      let templatePath;
      if (content.isUnregisteredUser) {
        templatePath = path.join(process.cwd(), "src/templates/mails/invitation_unregistered.html");
      } else {
        templatePath = path.join(process.cwd(), "src/templates/mails/invitations.html");
      }
      
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      
      if (content.isUnregisteredUser) {
        // for unregistered user template
        htmlTemplate = htmlTemplate
          .replaceAll('{{site}}', process.env.SITE_URL)
          .replaceAll('{{invitationToken}}', content.data.token || "")
          .replaceAll('{{email}}', encodeURIComponent(content.to))
          .replaceAll('{{testTitle}}', content.data.testTitle || "Untitled Study")
          .replaceAll('{{testDescription}}', content.data.testDescription || "")
          .replaceAll('{{adminEmail}}', content.data.adminEmail || "")
          .replaceAll('{{adminName}}', content.data.adminName || "Study Administrator")
          .replaceAll('{{message}}', content.data.message || "You've been invited to participate in a study.");
      } else {
        // for registered user template
        htmlTemplate = htmlTemplate
          .replaceAll('{{site}}', process.env.SITE_URL)
          .replaceAll('{{message}}', content.data.message || "You've been invited to participate in a study.")
          .replaceAll('{{testTitle}}', content.data.testTitle || "Untitled Study")
          .replaceAll('{{testDescription}}', content.data.testDescription || "")
          .replaceAll('{{adminEmail}}', content.data.adminEmail || "")
          .replaceAll('{{adminName}}', content.data.adminName || "Study Administrator");
      }
    }
    else if (content.template === 'passwordReset') {
      const actionCodeSettings = {
        url: `${process.env.SITE_URL}/signin`,
        handleCodeInApp: false,
      }

      const link = await admin.auth().generatePasswordResetLink(content.to, actionCodeSettings);
      const templatePath = path.join(process.cwd(), "src/templates/mails/passwordReset.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replaceAll('{{resetLink}}', link);
    }
    else if (content.template === 'invitationAccepted') {
      const templatePath = path.join(process.cwd(), "src/templates/mails/invitation_accepted.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replaceAll('{{userEmail}}', content.data.userEmail || "")
        .replaceAll('{{testTitle}}', content.data.testTitle || "")
        .replaceAll('{{adminEmail}}', content.data.adminEmail || "");
    }

    const mail = {
      from: 'no-reply@ruxailab.com',
      to: content.to,
      subject: content.subject,
      html: htmlTemplate,
      attachments: content.attachments ?? [],
    };

    try {
      await transporter.sendMail(mail);
      logger.info('Email sent successfully to', { to: content.to });
      return 'Email sent successfully.';
    } catch (err) {
      logger.error('Error sending email:', { error: err });
      return err;
    }
  }
});
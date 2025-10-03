import { admin, functions } from "../f.firebase.js";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

export const sendEmail = functions.onCall({
  handler: async (data) => {
    const content = data.data;
    console.log(content);

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
      const templatePath = path.join(process.cwd(), "src/templates/mails/invitations.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replace("{{site}}", process.env.SITE_URL)
        .replace("{{message}}", content.data.message)
        .replace(/{{testTitle}}/g, content.data.testTitle)
        .replace(/{{adminEmail}}/g, content.data.adminEmail);
    }
    else if (content.template === 'passwordReset') {
      const actionCodeSettings = {
        url: "http://localhost:8080/signin",
        handleCodeInApp: false,
      }

      const link = await admin.auth().generatePasswordResetLink(content.to, actionCodeSettings);
      const templatePath = path.join(process.cwd(), "src/templates/mails/passwordReset.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replace("{{resetLink}}", link);
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
      console.log('Email sent successfully to', content.to);
      return 'Email sent successfully.';
    } catch (err) {
      console.error('Error sending email:', err);
      return err;
    }
  }
})

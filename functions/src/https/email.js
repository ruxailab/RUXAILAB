import { admin, functions } from "../f.firebase.js";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

export const sendEmail = functions.onCall({
  handler: async (data) => {
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
    if (data.data.template === 'invite') {
      const templatePath = path.join(process.cwd(), "src/templates/mails/invitations.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
    }
    else if (data.data.template === 'passwordReset') {
      const actionCodeSettings = {
        url: "http://localhost:8080/signin",
        handleCodeInApp: false,
      }

      const link = await admin.auth().generatePasswordResetLink(data.data.to, actionCodeSettings);
      const templatePath = path.join(process.cwd(), "src/templates/mails/passwordReset.html");
      htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replace("{{resetLink}}", link);
    }

    const mail = {
      from: 'no-reply@ruxailab.com',
      to: data.data.to,
      subject: data.data.subject,
      html: htmlTemplate,
      attachments: data.data.attachments ?? [],
    };

    try {
      await transporter.sendMail(mail);
      console.log('Email sent successfully to', data.data.to);
      return 'Email sent successfully.';
    } catch (err) {
      console.error('Error sending email:', err);
      return err;
    }
  }
})

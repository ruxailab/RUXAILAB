import { admin, functions } from "../f.firebase.js";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

// Firebase recommended CORS middleware
const cors = (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(200).send();
  } else {
    next();
  }
};

export const sendEmail = functions.https.onRequest((req, res) => {
  // Apply CORS middleware
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      const content = req.body.data || req.body;

      if (!content) {
        res.status(400).json({ error: "No data provided" });
        return;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      let htmlTemplate = "";
      if (content.template === "invite") {
        const templatePath = content.isUnregisteredUser
          ? path.join(process.cwd(), "src/templates/mails/invitation_unregistered.html")
          : path.join(process.cwd(), "src/templates/mails/invitations.html");        
        // template file exists or not
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found: ${templatePath}`);
        }
        
        htmlTemplate = fs.readFileSync(templatePath, "utf-8");

        if (content.isUnregisteredUser) {
          htmlTemplate = htmlTemplate
            .replace(/{{site}}/g, process.env.SITE_URL)
            .replace(/{{invitationToken}}/g, content.data.token || "")
            .replace(/{{email}}/g, encodeURIComponent(content.to))
            .replace(/{{testTitle}}/g, content.data.testTitle || "Untitled Study")
            .replace(/{{testDescription}}/g, content.data.testDescription || "")
            .replace(/{{adminEmail}}/g, content.data.adminEmail || "")
            .replace(/{{adminName}}/g, content.data.adminName || "Study Administrator")
            .replace(/{{message}}/g, content.data.message || "You've been invited to participate in a study.");
        } else {
          console.log("Sending invitation to registered user");
          htmlTemplate = htmlTemplate
            .replace(/{{site}}/g, process.env.SITE_URL)
            .replace(/{{message}}/g, content.data.message || "You've been invited to participate in a study.")
            .replace(/{{testTitle}}/g, content.data.testTitle || "Untitled Study")
            .replace(/{{testDescription}}/g, content.data.testDescription || "")
            .replace(/{{adminEmail}}/g, content.data.adminEmail || "")
            .replace(/{{adminName}}/g, content.data.adminName || "Study Administrator")
            .replace(/{{email}}/g, content.data.email || "");
        }
      } else if (content.template === "passwordReset") {
        const actionCodeSettings = {
          url: `${process.env.SITE_URL}/signin`,
          handleCodeInApp: false,
        };

        const link = await admin.auth().generatePasswordResetLink(content.to, actionCodeSettings);
        const templatePath = path.join(process.cwd(), "src/templates/mails/passwordReset.html");
        
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found: ${templatePath}`);
        }
        
        htmlTemplate = fs.readFileSync(templatePath, "utf-8");
        htmlTemplate = htmlTemplate.replace(/{{resetLink}}/g, link);
      } else if (content.template === "invitationAccepted") {
        const templatePath = path.join(process.cwd(), "src/templates/mails/invitation_accepted.html");
        
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found: ${templatePath}`);
        }
        
        htmlTemplate = fs.readFileSync(templatePath, "utf-8");
        htmlTemplate = htmlTemplate
          .replace(/{{userEmail}}/g, content.data.userEmail)
          .replace(/{{testTitle}}/g, content.data.testTitle)
          .replace(/{{adminEmail}}/g, content.data.adminEmail);
      } else {
        throw new Error("Unsupported template type");
      }

      const mail = {
        from: "no-reply@ruxailab.com",
        to: content.to,
        subject: content.subject,
        html: htmlTemplate,
        attachments: content.attachments ?? [],
      };


      try {
        await transporter.sendMail(mail);
        res.status(200).json({ success: true, message: "Email sent successfully." });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
});
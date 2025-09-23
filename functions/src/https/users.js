import { admin, functions } from '../f.firebase.js'
import nodemailer from 'nodemailer'

export const deleteAuth = functions.onCall({
  handler: async (data) => {
    try {
      const db = admin.firestore()

      const testsRef = db.collection('tests')
      const testsQuery = await testsRef
        .where("testAdmin.userDocId", "==", data.data.userId)
        .get()

      if (!testsQuery.empty) {
        for (const testDoc of testsQuery.docs) {
          const testData = testDoc.data()

          const answersDocId = testData.answersDocId
          if (answersDocId) await db.collection("answers").doc(answersDocId).delete()

          await deleteFolderFiles(testDoc.id)
          await db.collection("tests").doc(testDoc.id).delete()
        }
      }

      const userDocRef = db.collection('users').doc(data.data.userId)
      await userDocRef.delete()

      await admin.auth().deleteUser(data.data.userId)
      return 'User deleted successfully.'
    } catch (err) {
      console.error('Error deleting user:', err)
      return err
    }
  }
})

const deleteFolderFiles = async (testId) => {
  const folderPath = `tests/${testId}/`;
  const [files] = await admin.storage().bucket().getFiles({ prefix: folderPath });

  if (files.length > 0) {
    console.log(`Deletando ${files.length} arquivos da pasta ${folderPath}`);
    await Promise.all(files.map(file => file.delete()));
  }
}

export const sendEmail = functions.onCall({
  handler: async (data) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mail = {
      from: 'RUXAILAB',
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

import { admin } from './src/f.firebase.js'

admin.initializeApp()

export * from './src/https/index.js'
export * from './src/triggers/index.js'


// const functions = require('firebase-functions')
// const admin = require('firebase-admin')
// const nodemailer = require('nodemailer')
// require('dotenv').config()

// admin.initializeApp()

// exports.deleteAuth = functions.https.onCall(async (data, context) => {
//   try {
//     await admin.auth().deleteUser(data.id)
//     return 'User deleted successfully.'
//   } catch (err) {
//     console.error('Error deleting user:', err)
//     return err
//   }
// })

// exports.sendEmail = functions.https.onCall(async (data, context) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.VUE_APP_FIREBASE_EMAIL,
//       pass: process.env.VUE_APP_FIREBASE_PASSWORD,
//     },
//   })

//   const mail = {
//     from: 'Uramaki Lab',
//     to: data.guest.email,
//     subject: 'You have been invited to evaluate a test!',
//     html: data.template,
//     attachments: data.attachments ?? [],
//   }

//   try {
//     const info = await transporter.sendMail(mail)
//     return `Message sent: ${info.messageId}`
//   } catch (error) {
//     console.error('Error sending email:', error)
//     return `Error sending email: ${error.message}`
//   }
// })

// //code is in safe------------------------------------------------
// // exports.processSignUp = functions.auth.user().onCreate(async (user) => {
// //   try {
// //     await admin
// //       .firestore()
// //       .collection("users")
// //       .doc(user.uid)
// //       .set({
// //         email: user.email,
// //         accessLevel: 1,
// //         myTests: {},
// //         myAnswers: {},
// //         notifications: [],
// //       });
// //   } catch (err) {
// //     console.error("Error to create user in database ", err);
// //   }
// // });

// // exports.setUserRole = functions.https.onCall(async (data) => {
// //   try {
// //     return await admin
// //       .firestore()
// //       .collection("users")
// //       .doc(data.uid)
// //       .update({
// //         accessLevel: data.customClaims.accessLevel,
// //       });
// //   } catch (err) {
// //     return err;
// //   }
// // });

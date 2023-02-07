const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();

exports.onTestCreate = functions.firestore.document('tests/{docId}').onCreate(async (snap, context) => {
  const userId = snap.data().testAdmin.userDocId
  const test = snap.data()

  return await admin.firestore().collection('users').doc(userId).update({
    myTest: admin.firestore.FieldValue.arrayUnion({
      testDocId: snap.id,
      testTitle: test.testTitle,
      testType: test.testType,
      numberColaborators: 0,
      existReport: false,
      isComplete: false,
      testProgress: 0,
      creationDate: test.creationDate ?? null,
      upateDate: test.upateDate ?? null
    })
  })

})

exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  try {
    await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set({
        email: user.email,
        accessLevel: 1,
        myTests: [],
        myAnswers: [],
        myTemplates: [],
        notifications: [],
      });
  } catch (err) {
    console.error("Error to create user in database ", err);
  }
});

exports.setUserRole = functions.https.onCall(async (data) => {
  try {
    return await admin
      .firestore()
      .collection("users")
      .doc(data.uid)
      .update({
        accessLevel: data.customClaims.accessLevel,
      });
  } catch (err) {
    return err;
  }
});

exports.deleteAuth = functions.https.onCall(async (data, context) => {
  try {
    return await admin
      .auth()
      .deleteUser(data.id)
  } catch (err) {
    return err;
  }
});

exports.sendEmail = functions.https.onCall(async (data, context) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.VUE_APP_FIREBASE_EMAIL,
      pass: process.env.VUE_APP_FIREBASE_PASSWORD,
    },
  });

  let mail = {
    from: "Uramaki Lab",
    to: data.guest.email,
    subject: "You have been invited to evaluate a test!",
    html: data.template,
  };

  return await transporter
    .sendMail(mail)
    .then((info) => {
      console.log("Success on send email ", info);
      return `Message sent: ${info.messageId} `;
    })
    .catch((e) => {
      console.log("Error in transporter ", e);
      return `Error on sending msg: ${e}`;
    });
});

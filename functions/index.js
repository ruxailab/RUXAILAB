const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.processSignUp = functions.auth.user().onCreate(async (user) => {
    const customClaims = {
        accessLevel: 1
    }
    try {
        await admin.auth().setCustomUserClaims(user.uid, customClaims)
        admin.firestore().collection('users').doc(user.uid).set({
            email: user.email,
            accessLevel: customClaims.accessLevel,
            myTests: [],
            myCoops: [],
            myAnswers: [],
            notifications: []
        })
    } catch (err) {
        console.error("Error to create user in database ", err)
    }
})

exports.setUserRole = functions.https.onCall(async (data, context) => {
    try {
        var _ = await admin.auth().setCustomUserClaims(data.uid, data.customClaims)

        return admin.firestore().collection("users").doc(data.uid).update({
            accessLevel: data.customClaims.accessLevel
        })
    } catch (err) {
        return err
    }
})

exports.deleteAuth = functions.https.onCall(async (data, context) => {
    try {
        admin.auth().deleteUser(data.id).then(() => {
            console.log("deleted user: ", data.email);
            return;
        }).catch(err => console.error(err));

        return 0;
    } catch (err) {
        return err
    }
})

exports.sendEmail = functions.https.onCall(async (data, context) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.VUE_APP_FIREBASE_EMAIL,
                pass: process.env.VUE_APP_FIREBASE_PASSWORD
            }
        });

        let mail = {
            from: 'Uramaki Lab',
            to: data.guest.email,
            subject: 'You have been invited to evaluate a test!',
            html: data.template
        };

        transporter.sendMail(mail)
            .then(() => {
                console.log("Email sent to " + data.guest.email);
                return;
            })
            .catch(err => {
                console.log("Error on sendEmail transporter", err);
                return err;
            });

        return 0;
    } catch (err) {
        console.log("Error on sendEmail", err);
        return err;
    }

})

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.processSignUp = functions.auth.user().onCreate(async (user) =>{
    try {
        admin.firestore().collection('users').doc(user.uid).set({
            email: user.email,
            level: 0,
            tokens:[]
        })
    } catch (err) {
        console.error("Error to create user in database ",err)
    }
})
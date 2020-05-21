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
    const customClaims = {
        accessLevel: 2
    }
    try {
        await admin.auth().setCustomUserClaims(user.uid,customClaims)
        admin.firestore().collection('users').doc(user.uid).set({
            email: user.email,
            accessLevel: customClaims.accessLevel,
            tokens:[]
        })
    } catch (err) {
        console.error("Error to create user in database ",err)
    }
})

exports.setUserRole = functions.https.onCall(async (data, context) => {
    //if(context.auth.token.accessLevel!==0) return
    console.log(`Data: ${data}, Context: ${context}`)
    try {
        //var _ = await admin.auth().setCustomUserClaims(data.uid,data.costomClaims)
        return admin.firestore().collection("users").doc(data.uid).update({
            accessLevel: data.customClaims.accessLevel
        })
    } catch (err) {
        return err
    }
})
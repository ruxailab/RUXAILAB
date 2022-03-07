const functions = require('firebase-functions');
const admin = require('firebase-admin');

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
            myAnswers: [],
            myTemplates: [],
            notifications: []
        })
    } catch (err) {
        console.error("Error to create user in database ", err)
    }
})

exports.setUserRole = functions.https.onCall(async (data) => {
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
            return;
        }).catch(err => console.error(err));

        return 0;
    } catch (err) {
        return err
    }
})
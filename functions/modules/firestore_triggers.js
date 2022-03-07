const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ANSWERS
exports.onAnswerCreate = functions.firestore.document('answers/{docId}').onCreate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onAnswerUpdate = functions.firestore.document('answers/{docId}').onUpdate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onAnswerDelete = functions.firestore.document('answers/{docId}').onDelete((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

// TEMPLATES
exports.onTemplateCreate = functions.firestore.document('templates/{docId}').onCreate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onTemplateUpdate = functions.firestore.document('templates/{docId}').onUpdate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onTemplateDelete = functions.firestore.document('templates/{docId}').onDelete((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

// TESTS
exports.onTestCreate = functions.firestore.document('tests/{docId}').onCreate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onTestUpdate = functions.firestore.document('tests/{docId}').onUpdate((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})

exports.onTestDelete = functions.firestore.document('tests/{docId}').onDelete((snap, context) => {
    // object representing document is on snap.data()
    console.log(snap.data())
    //...

    return
})
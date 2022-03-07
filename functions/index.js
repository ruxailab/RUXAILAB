const functions = require('firebase-functions');
const admin = require('firebase-admin');

require('dotenv').config();

admin.initializeApp();

const mailer = require('./modules/mailer')
exports.sendEmail = mailer.sendEmail

const user = require('./modules/user')
exports.processSignUp = user.processSignUp
exports.setUserRole = user.setUserRole
exports.deleteAuth = user.deleteAuth

const firestore_triggers = require('./modules/firestore_triggers')
exports.onAnswerCreate = firestore_triggers.onAnswerCreate
exports.onAnswerUpdate = firestore_triggers.onAnswerUpdate
exports.onAnswerDelete = firestore_triggers.onAnswerDelete
exports.onTemplateCreate = firestore_triggers.onTemplateCreate
exports.onTemplateUpdate = firestore_triggers.onTemplateUpdate
exports.onTemplateDelete = firestore_triggers.onTemplateDelete
exports.onTestCreate = firestore_triggers.onTestCreate
exports.onTestUpdate = firestore_triggers.onTestUpdate
exports.onTestDelete = firestore_triggers.onTestDelete
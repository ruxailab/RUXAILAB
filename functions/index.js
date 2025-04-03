const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();

// ✅ Helper function to safely update Firestore
const updateFirestoreDocument = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).update(data);
    return { success: true };
  } catch (err) {
    console.error(`Error updating ${collection}/${docId}:`, err);
    return { success: false, error: err };
  }
};

// ✅ Firestore Trigger: On Test Creation
exports.onTestCreate = functions.firestore
  .document('tests/{docId}')
  .onCreate(async (snap) => {
    const test = snap.data();
    const userId = test?.testAdmin?.userDocId;

    if (!userId) {
      console.error("Missing 'userDocId' in test data.");
      return;
    }

    const updateData = {
      [`myTests.${snap.id}`]: {
        testDocId: snap.id,
        testTitle: test.testTitle,
        testType: test.testType,
        numberColaborators: 0,
        creationDate: test.creationDate || admin.firestore.FieldValue.serverTimestamp(),
        updateDate: admin.firestore.FieldValue.serverTimestamp(),
      },
    };

    return updateFirestoreDocument('users', userId, updateData);
  });

// ✅ Firestore Trigger: On Test Update
exports.onTestUpdate = functions.firestore
  .document('tests/{docId}')
  .onUpdate(async (change) => {
    const test = change.after.data();
    const userId = test?.testAdmin?.userDocId;

    if (!userId) {
      console.error("Missing 'userDocId' in updated test data.");
      return;
    }

    const updateData = {
      [`myTests.${change.after.id}`]: {
        testDocId: change.after.id,
        testTitle: test.testTitle,
        testType: test.testType,
        numberColaborators: test.numberColaborators || 0,
        creationDate: test.creationDate || admin.firestore.FieldValue.serverTimestamp(),
        updateDate: admin.firestore.FieldValue.serverTimestamp(),
      },
    };

    return updateFirestoreDocument('users', userId, updateData);
  });

// ✅ Secure User Deletion Function
exports.deleteAuth = functions.https.onCall(async (data) => {
  try {
    if (!data.id) throw new Error("Missing user ID");

    await admin.auth().deleteUser(data.id);
    return { success: true, message: 'User deleted successfully.' };
  } catch (err) {
    console.error('Error deleting user:', err);
    return { success: false, error: err.message };
  }
});

// ✅ Improved Email Sending with Nodemailer
exports.sendEmail = functions.https.onCall(async (data) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing email credentials in environment variables.');
    return { success: false, error: 'Email service is not configured properly.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Uramaki Lab" <no-reply@yourdomain.com>',
    to: data.guest?.email || '',
    subject: 'You have been invited to evaluate a test!',
    html: data.template || '',
    attachments: data.attachments ?? [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Email sent: ${info.messageId}` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
});

// ✅ [OPTIONAL] Create User in Firestore on Authentication Signup
exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      accessLevel: 1,
      myTests: {},
      myAnswers: {},
      notifications: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`User ${user.uid} successfully created in Firestore.`);
  } catch (err) {
    console.error("Error creating user in Firestore:", err);
  }
});

// ✅ Secure Role Assignment Function
exports.setUserRole = functions.https.onCall(async (data) => {
  try {
    if (!data.uid || !data.customClaims?.accessLevel) {
      throw new Error('Invalid request data');
    }

    await db.collection('users').doc(data.uid).update({
      accessLevel: data.customClaims.accessLevel,
    });

    return { success: true, message: 'User role updated successfully' };
  } catch (err) {
    console.error('Error setting user role:', err);
    return { success: false, error: err.message };
  }
});


const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendEmail = functions.https.onCall(async (data, context) => {
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

    return await transporter.sendMail(mail)
        .then((info) => {
            console.log("Success on send email ", info);
            return `Message sent: ${info.messageId} `
        })
        .catch((e) => {
            console.log("Error in transporter ", e);
            return `Error on sending msg: ${e}`
        })

})
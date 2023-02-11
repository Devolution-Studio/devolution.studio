const nodemailer = require('nodemailer');

var sendContactMessage = async function (name, email, message) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    var mailOptions = {
        from: email,
        to: 'teo.conan.tirault@gmail.com',
        subject: name,
        text: message,
    };

    try {
        transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

module.exports = sendContactMessage;

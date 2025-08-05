const path = require('path');
const moment = require('moment');
const nodemailer = require('nodemailer');
const { verify } = require('hcaptcha');

const rootDir = path.join(__dirname, '../');
console.log('Running from ' + rootDir);

var sendContactMessage = async function (name, email, message) {
    if (name == undefined || email == undefined || message == undefined) {
        return false;
    }

    try {
        var transporter = nodemailer.createTransport({
            host: 'ssl0.ovh.net',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        var mailOptions = {
            from: email,
            to: process.env.MAIL_USER_TO,
            subject: email + ' : ' + name,
            text: message + '\n\nFrom ' + email,
        };

        if (process.env.ENV == 'dev') return true;

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return false;
            } else {
                console.log('Email sent: ' + info.response);
                return true;
            }
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

function log(req, page, data = null) {
    if (req.headers['sec-fetch-dest'] == 'image') return;

    const formattedDate = moment().format('DD/MM/YYYY - HH:mm:ss');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const text = `[${formattedDate}] > Get page ${page} : ${ip}`;

    if (data != null) text += `, data : ${data}`;

    console.log(text);
}

async function validateCaptcha(req) {
    const token = req.body['g-recaptcha-response'];
    const result = await verify(process.env.HCAPTCHA_SERVER_KEY, token);

    if (result.success != true) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.error(`Failed captcha for ${ip}`);
    }

    return result.success === true;
}

module.exports = {
    rootDir,
    sendContactMessage,
    log,
    validateCaptcha,
};

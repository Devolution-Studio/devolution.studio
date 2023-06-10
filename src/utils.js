const fs = require('fs');
const path = require('path');
const moment = require('moment');
const nodemailer = require('nodemailer');
const request = require('request-promise-native');

const env_PROD = 'prod';

var rootDir = process.cwd();

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

    fs.appendFile(
        path.join(__dirname + '/../', process.env.LOG_FILE),
        text + '\n',
        (err) => {
            if (err) throw err;
        }
    );
}

async function validateCaptcha(req) {
    const recaptchaResponse = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SERVER_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    if (!recaptchaResponse) {
        return false;
    }

    const response = await request.post(verificationUrl);

    // Analyser la réponse de l'API reCAPTCHA
    const responseBody = JSON.parse(response);

    if (!responseBody.success) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.error(`Failed captcha for ${ip}`);
    }

    return responseBody.success;
}

module.exports = {
    rootDir,
    env_PROD,
    sendContactMessage,
    log,
    validateCaptcha,
};

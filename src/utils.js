const fs = require('fs');
const path = require('path');
const moment = require('moment');
const nodemailer = require('nodemailer');

const env_PROD = 'prod';

var rootDir = process.cwd();

var sendContactMessage = async function (name, email, message) {
    if (name == undefined || email == undefined || message == undefined) {
        return false;
    }

    var transporter = nodemailer.createTransport({
        service: 'gmail',
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

    try {
        transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

function log(req, page) {
    if (req.headers['sec-fetch-dest'] == 'image') return;

    const formattedDate = moment().format('DD/MM/YYYY - HH:mm:ss');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const text = `[${formattedDate}] > Get page ${page} : ${ip}`;
    console.log(text);

    fs.appendFile(
        path.join(__dirname + '/../', process.env.LOG_FILE),
        text + '\n',
        (err) => {
            if (err) throw err;
        }
    );
}

module.exports = {
    rootDir,
    env_PROD,
    sendContactMessage,
    log,
};

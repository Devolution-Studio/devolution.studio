const fs = require('fs');
const path = require('path');
const moment = require('moment');
const geoip = require('geoip-lite');
const browser = require('browser-detect');
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

function logX(report) {
    fs.appendFile(
        path.join(__dirname + '/../logs/x.log'),
        report + '\n\n',
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

function getXInfo(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    var info = browser(req.headers['user-agent']);
    const geo = geoip.lookup(ip);

    var report = [];
    const formattedDate = moment().format('DD/MM/YYYY HH:mm:ss');

    report.push(formattedDate + ' - ' + ip);

    if (geo != null) {
        var zoom = (geo.ll[0] + ':' + geo.ll[1]).length;
        zoom = zoom > 19 ? 19 : zoom;
        zoom = zoom < 12 ? 12 : zoom;

        report.push(
            `Geo : ${geo.country}, ${geo.city}, ${geo.region}.${
                geo.eu ? ' Europe' : ''
            } (timezone ${geo.timezone})`
        );
        report.push(
            `Map : https://www.google.com/maps/@${geo.ll[0]},${geo.ll[1]},${zoom}z`
        );
    } else {
        report.push('No geo info found for ip');
    }

    report.push(
        `Navigateur : ${info.name} ${info.versionNumber} ${
            info.mobile == true ? '(mobile)' : ''
        }`
    );
    report.push(`OS : ${info.os}`);
    report.push(`Langages : ${getLanguages(req)}`);

    const log = report.join('\n');
    logX(log);
}

function getLanguages(req) {
    const acceptLanguage = req.headers['accept-language'];

    if (acceptLanguage == undefined) return 'no languages detected';

    const languages = acceptLanguage.split(',');
    const formattedLanguages = [];

    languages.forEach((language) => {
        const [lang, q] = language.trim().split(';q=');
        const languageWithQuality = `${lang} (${q || '1'})`;
        formattedLanguages.push(languageWithQuality);
    });

    return formattedLanguages.join(', ');
}

module.exports = {
    rootDir,
    env_PROD,
    sendContactMessage,
    log,
    validateCaptcha,
    getXInfo,
};

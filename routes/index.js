var express = require('express');
var sendContactMessage = require('../contact');
var router = express.Router();

function log(req, page) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`> Get page ${page} : ${ip}`);
}

/* index page. */
router.get('/', function (req, res, next) {
    log(req, 'index');
    res.render('index', { year: new Date().getFullYear() });
});

router.get('/contact/', function (req, res, next) {
    log(req, 'contact');
    res.render('contact', { year: new Date().getFullYear() });
});

/* post send mail */
router.post('/contact/send/', async function (req, res, next) {
    log(req, 'contact/send');

    let statusCode = 200;

    if (
        !(await sendContactMessage(
            req.body.name,
            req.body.email,
            req.body.message
        ))
    ) {
        statusCode = 500;
    }

    res.send('', statusCode);
});

module.exports = router;

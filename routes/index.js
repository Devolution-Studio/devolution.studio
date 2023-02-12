var express = require('express');
var sendContactMessage = require('../contact');
var router = express.Router();

/* index page. */
router.get('/', function (req, res, next) {
    res.render('index', { year: new Date().getFullYear() });
});

router.get('/contact/', function (req, res, next) {
    res.render('contact', { year: new Date().getFullYear() });
});

/* post send mail */
router.post('/contact/send/', async function (req, res, next) {
    let statusCode = 200;
    console.log('Send contact');
    console.log(req.body.name);

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

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const utils = require('./utils');

/*
 * Set body parsing for router
 */
router.use(bodyParser.json());
router.use(express.urlencoded({ extended: true }));

/*
 * Index page
 */
router.get('/', function (req, res, next) {
    utils.log(req, 'index');
    res.render('index', { year: new Date().getFullYear() });
});

/*
 * Contact page
 */
router.get('/contact/', function (req, res, next) {
    utils.log(req, 'contact');
    res.render('contact', { year: new Date().getFullYear() });
});

/*
 * Send mail
 */
router.post('/contact/send/', async function (req, res, next) {
    utils.log(req, 'contact/send');

    let statusCode = 200;

    if (
        !(await utils.sendContactMessage(
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

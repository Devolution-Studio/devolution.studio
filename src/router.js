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
 * CGV Page
 */
router.get('/cgv/', function (req, res, next) {
    utils.log(req, 'cgv');
    res.render('cgv', {
        year: new Date().getFullYear(),
        date: process.env.CGV_LAST_UPDATE,
    });
});

router.get('/cgv/html/', function (req, res, next) {
    utils.log(req, 'cgv-html');
    res.download(
        utils.rootDir +
            '/public/files/Conditions générales de ventes - Devolution Studio.html'
    );
});

/*
 * Pricing page
 */
router.get('/tarifs/', function (req, res, next) {
    utils.log(req, 'tarifs');
    res.render('pricing', {
        year: new Date().getFullYear(),
    });
});

/*
 * Services page
 */
router.get('/services/', function (req, res, next) {
    utils.log(req, 'services');
    res.render('services', {
        year: new Date().getFullYear(),
    });
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

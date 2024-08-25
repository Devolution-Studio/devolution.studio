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
    res.render('index', {
        year: new Date().getFullYear(),
        theme: 'light',
    });
});

/*
 * Contact page
 */
router.get('/contact', function (req, res, next) {
    utils.log(req, 'contact');
    res.render('contact', {
        year: new Date().getFullYear(),
        recaptchaKey: process.env.RECAPTCHA_CLIENT_KEY,
        name: req.query.name,
        email: req.query.email,
        message: req.query.message,
        theme: 'light',
    });
});

/*
 * CGV Page
 */
router.get('/cgv/', function (req, res, next) {
    utils.log(req, 'cgv');
    res.render('cgv', {
        year: new Date().getFullYear(),
        date: process.env.CGV_LAST_UPDATE,
        theme: 'light',
    });
});

/*
 * Retractation Page
 */

router.get('/retractation/', function (req, res, next) {
    utils.log(req, 'retractation');
    res.render('retractation', {
        year: new Date().getFullYear(),
        theme: 'light',
    });
});

/*
 * Pricing page
 */
router.get('/tarifs/', function (req, res, next) {
    utils.log(req, 'tarifs');
    res.render('pricing', {
        year: new Date().getFullYear(),
        recaptchaKey: process.env.RECAPTCHA_CLIENT_KEY,
        theme: 'light',
    });
});

/*
 * Services page
 */
router.get('/services/', function (req, res, next) {
    utils.log(req, 'services');
    res.render('services', {
        year: new Date().getFullYear(),
        theme: 'light',
    });
});

/**
 * Blog list page
 */

router.get('/blog/', function (req, res, next) {
    utils.log(req, 'blog');
    res.render('blog', {
        year: new Date().getFullYear(),
        theme: 'light',
    });
});

router.get('/blog/:lang/:article', function (req, res, next) {
    const article = req.params.article;
    const lang = req.params.lang;

    utils.log(req, article);
    res.render('articles/' + article + '-' + lang, {
        year: new Date().getFullYear(),
        theme: 'dark',
    });
});

/*
 * Send mail
 */
router.post('/contact/send/', async function (req, res, next) {
    utils.log(req, 'contact/send');

    let statusCode = 500;

    if (
        (await utils.validateCaptcha(req)) &&
        (await utils.sendContactMessage(
            req.body.name,
            req.body.email,
            req.body.message
        ))
    ) {
        statusCode = 200;
    }

    res.status(statusCode).send('');
});

/*
 * X
 */

router.get('/x', async function (req, res) {
    try {
        utils.getXInfo(req, res);
    } catch (e) {
        console.error('Cannot log x');
        console.error(e);
    }
    res.redirect(302, '/');
});

module.exports = router;

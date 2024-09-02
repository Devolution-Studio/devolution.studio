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
    res.render('index', {
        year: new Date().getFullYear(),
        theme: 'light',
    });
});

/*
 * Contact page
 */
router.get('/contact', function (req, res, next) {
    res.render('contact', {
        year: new Date().getFullYear(),
        recaptchaKey: process.env.RECAPTCHA_CLIENT_KEY,
        name: req.query.name,
        email: req.query.email,
        message: req.query.message,
        theme: 'light',
        title: 'Contact',
    });
});

/*
 * CGV Page
 */
router.get('/cgv/', function (req, res, next) {
    res.render('cgv', {
        year: new Date().getFullYear(),
        date: process.env.CGV_LAST_UPDATE,
        theme: 'light',
        title: 'Conditions générales de ventes',
    });
});

/*
 * Retractation Page
 */

router.get('/retractation/', function (req, res, next) {
    res.render('retractation', {
        year: new Date().getFullYear(),
        theme: 'light',
        title: 'Rétractation',
    });
});

/*
 * Mentions légales Page
 */
router.get('/mentions-legales/', function (req, res, next) {
    res.render('mentions-legales', {
        year: new Date().getFullYear(),
        theme: 'light',
        title: 'Mentions légales',
    });
});

/*
 * Pricing page
 */
router.get('/tarifs/', function (req, res, next) {
    res.render('pricing', {
        year: new Date().getFullYear(),
        recaptchaKey: process.env.RECAPTCHA_CLIENT_KEY,
        theme: 'light',
        title: 'Tarifs',
    });
});

/*
 * Services page
 */
router.get('/services/', function (req, res, next) {
    res.render('services', {
        year: new Date().getFullYear(),
        theme: 'light',
        title: 'Services',
    });
});

/**
 * Blog list page
 */

router.get('/blog/', function (req, res, next) {
    res.render('blog', {
        year: new Date().getFullYear(),
        theme: 'light',
        title: 'Blog',
        isBlog: true,
    });
});

router.get('/blog/:lang/:article', function (req, res, next) {
    const article = req.params.article;
    const lang = req.params.lang;
    const title = (
        article.charAt(0).toUpperCase() + article.slice(1)
    ).replaceAll('-', ' ');

    res.render('articles/' + article + '-' + lang, {
        year: new Date().getFullYear(),
        theme: 'dark',
        title: title,
        isArticle: true,
    });
});

/*
 * Send mail
 */
router.post('/contact/send/', async function (req, res, next) {
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

module.exports = router;

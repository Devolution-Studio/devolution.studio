var express = require('express');
var sendContactMessage = require('../contact');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Devolution Studio' });
});

router.get('/contact/', function (req, res, next) {
    res.render('contact', { title: 'Devolution Studio' });
});

router.post('/contact/send/', function (req, res, next) {
    console.log('Send contact');
    console.log(req.body.name);

    sendContactMessage(req.body.name, req.body.email, req.body.message);

    res.status = 200;
    res.send('');
});

module.exports = router;

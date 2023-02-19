#!/usr/bin/env node

/**
 * Module dependencies.
 */
require('dotenv').config();
const path = require('path');
const utils = require('./utils');
const router = require('./router');

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressHandlebars = require('express-handlebars');

/*
 * Express setup
 */
const app = express();
app.use('/', router);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(utils.rootDir, 'public')));

if (process.env.ENV == utils.env_PROD) {
    app.use(
        logger('combined', {
            skip: function (req, res) {
                return res.statusCode < 400;
            },
        })
    );
} else {
    app.use(logger(process.env.ENV));
}

/*
 * Handlebars setup
 */
expressHandlebars.create({});
app.engine(
    'handlebars',
    expressHandlebars.engine({
        layoutsDir: utils.rootDir + '/views/layouts/',
        partialsDir: utils.rootDir + '/views/partials/',
    })
);

app.set('view engine', 'handlebars');
app.set('views', utils.rootDir + '/views');

/*
 * Catch 404 and forward to error handler
 */
app.get('*', function (req, res) {
    res.status(req.status || 404);
    res.render('404');
});

module.exports = app;

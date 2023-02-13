const env_PROD = 'prod';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressHandlebars = require('express-handlebars');
const indexRouter = require('./routes/index');

// Express setup
const app = express();
app.use('/', indexRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.ENV == env_PROD) {
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

// Handlebars setup
expressHandlebars.create({});
app.engine(
    'handlebars',
    expressHandlebars.engine({
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/',
    })
);

app.set('view engine', 'handlebars');
app.set('views', './views');

// catch 404 and forward to error handler
app.get('*', function (req, res) {
    res.status(req.status || 404);
    res.render('404');
});

module.exports = app;

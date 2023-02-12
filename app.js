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
app.use(logger(process.env.ENV));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

module.exports = app;

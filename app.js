'use strict'
const express = require('express'),
      session = require('cookie-session'),
      flash = require('express-flash'),
      fileupload = require('express-fileupload'),
      visitCounter = require('express-visit-counter'),
      createError = require('http-errors'),
      path = require('path'),
      logger = require('morgan'),
      nunjucks = require('nunjucks'),
      dotenv = require('dotenv'),
      {Run} = require('./config/www'),
      app = express();

app.use(express.static(path.join(__dirname, 'static')));
nunjucks.configure('app/views', {
    autoescape: true,
    express: app
});

dotenv.config();

app.set('trust proxy', 1);
app.set('view engine', 'html');

app.use(fileupload({
    createParentPath: true
}));

app.use(session({
    secret: process.env.SECRET_KEY,
    name: 'apiccookie',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 6000000
    }
}));

app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(visitCounter.initialize());
app.use(require('./config/route'));

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

Run(app);
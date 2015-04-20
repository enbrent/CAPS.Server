var express = require('express')
  , path = require('path')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , flash = require('connect-flash');

var routes = require('./routes/index');

// Mongoose
mongoose = require('mongoose');
//mongoose.connect("mongodb://localhost:21112/CAPS_DB");
mongoose.connect("mongodb://brent:b12345@ds041651.mongolab.com:41651/caps_db");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("OPEN DB WITH MONGOOSE");
});

// Passport/Login
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , session = require('express-session')
  , mongostore = require('connect-mongo')(session)
  , scribe = require('scribe-js')();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
//app.use(logger('dev'));
app.use(scribe.express.logger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'ayy lmao',
    resave: true,
    saveUninitialized: true,
    store: new mongostore({ mongooseConnection: db })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

var isAuthenticated = function(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/');
}

var userLoggedIn = function(req, res, next)  {
    if(req.isAuthenticated())
        return res.redirect('/home');
    next();
}
// Tests
app.get('/debug', routes.get.debug);
app.get('/genconfirm', routes.get.genconfirm);
app.get('/genreset', routes.get.genreset);
app.get('/ping', routes.get.ping);
app.get('/registertest', routes.get.registertest);
app.post('/registertest', routes.post.registertest);
// Main pages
app.get('/', userLoggedIn, routes.get.index);
app.get('/home', isAuthenticated, routes.get.home);
// User authentication
app.get('/register', routes.get.register);
app.get('/reset/*', routes.get.reset);
app.get('/resetpass', routes.get.resetpass);
app.get('/logoff', routes.get.logoff);
app.get('/textin', routes.get.textin);
app.post('/login', routes.post.login);
app.post('/register', routes.post.register);
app.post('/sendverifyphone', routes.post.sendverifyphone);
app.post('/verifyphone', routes.post.verifyphone);
app.post('/changepass', routes.post.changepass);
app.post('/changepriority', routes.post.changepriority);
app.post('/changeinfo', routes.post.changeinfo);
// Board functions
app.get('/rgs', routes.get.rgs);
app.get('/alert', routes.get.alert);
// Temp
app.get('/verify/*', routes.get.verify);
// Android & Phone
app.post('/reply', routes.post.reply);
app.get('/logina', routes.get.logina);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Configure globals.
routes.configure(function() {
    routes.set("db", db);
    routes.set("passport", passport);
    routes.set("mongoose", mongoose);
});

// Initiate authentication scripts.
require('./routes/authenticate')(passport, LocalStrategy);

module.exports = app;

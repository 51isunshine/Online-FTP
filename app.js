/**
 * @created: dylan.zhang
 * @Date: 2016.02.01
 * @name app.js
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'),
    session = require("express-session");
    swig = require('swig'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash');
var csrf = require('csurf');

var app = express();

// user-define
var app_config = require('./config.js'),
    routes = require('./routes/index.js'),
    account = require('./module/User.js'),
    admin = require('./routes/admin.js'),
    upload = require('./routes/upload.js'),
    xmu = require("./xmu/xmu.js");

var querystring=require('querystring');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'dylan', resave: true, httpOnly: true,saveUninitialized: true, cookie: {maxAge: 6000000}}));
//app.use(csrf({ cookie: true }));

app.engine('html', swig.renderFile);
//app.set('view engine', 'ejs');

swig.setFilter('abstract', function (input) {
    var temp = "";
    if(input.length>180){
        temp = input.substring(0,180);
        return temp;
    }
    return input;
});
swig.setFilter('equal2String', function (input) {
    if((typeof input)!="string"){
        input = String.toString(input);
    }
    var name = input.toLowerCase();
    if("dylan"==name||"张治"==name||"豆豆"==name||"doudou"==name||"test"==name||"蔡莉"==name||"张馨语"==name){
        return "原创";
    }
    return input;
});
swig.setFilter('dir_goBack',function(input){
    input = querystring.unescape(input);
    var len = input.lastIndexOf("/");
    var temp = input.substring(0,len);
    return querystring.escape(temp);
});
app.set('view engine', 'html');
app.set('env', app_config.env);
app.set('port', app_config.port);

require('./utils/passport.js')(passport);
require('./module/xmu/xmu_passport.js')(passport);
mongoose.connect(app_config.mongodb);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(favicon(path.join(__dirname, 'public','img', 'favicon.ico')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger("dev"));

app.use('/', routes);
app.use('/article', routes);
app.use('/user/', admin);
app.use('/upload/',upload);
app.use('/xmu/',xmu);

app.use(function (req, res) {
    res.end(req.csrfToken() || 'none')
})

//app.use(multipart({uploadDir: __dirname + '/public/uploads'}));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

process.on('uncaughtException', function (err,next) {
    console.error((new Date()).toUTCString() + ' uncaughtException found:',
        err.stack || 'no stack info', 'exiting...');
    console.log()
    app.route("/");
    process.exit(1);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    // handle CSRF token errors here
    res.status(403);
    res.render('error', {
        message: err.message,
        error: {}
    });
})

app.listen(app.get('port'), function () {
    console.log('listening on port ' + app.get('port'));
});

module.exports = app;

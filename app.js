/**
 * @created: dylan.zhang
 * @Email: dylan.zhang@ringcentral.com
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
//var csrf = require('csurf');
var app = express();

// user-define
var app_config = require('./config.js'),
    routes = require('./routes/index.js');

var querystring=require('querystring');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'online-ftp', resave: true, httpOnly: true,saveUninitialized: true, cookie: {maxAge: 6000000}}));
//app.use(csrf({ cookie: true }));

app.engine('html', swig.renderFile);

swig.setFilter('equal2String', function (input) {
    if((typeof input)!="string"){
        input = String.toString(input);
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
mongoose.connect(app_config.mongodb);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(favicon(path.join(__dirname, 'public','img', 'favicon.ico')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger("dev"));

app.use('/xmu', routes);

app.use(function (req, res) {
    //res.end(req.csrfToken() || 'none')
    res.render('error.html', {
        message: "张治的个人网站|私房菜",
        error: {},
        title: "张治的个人网站|私房菜",
        website: "张治的个人网站"
    });
});


process.on('uncaughtException', function (err,next) {
    console.error((new Date()).toUTCString() + ' uncaughtException found:',
        err.stack || 'no stack info', 'exiting...');
    console.log()
    app.route("/");
    process.exit(1);
});

app.listen(app.get('port'), function () {
    console.log('listening on port ' + app.get('port'));
});

module.exports = app;

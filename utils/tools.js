/**
 * @author Dylan.zhang
 */

var nodemailer = require('nodemailer'),
    _ = require('lodash');

var config = require('../config.js');
var transporter = nodemailer.createTransport(config.smtp);

var defaultMail = {
    from: "admin.dylan"+'<' + config.smtp.auth.user + '>',
    subject: '欢迎光顾',
    html: '<b>欢迎访问</b>'
};

function sendMail(mail){
    mail = _.merge({}, defaultMail, mail);
    transporter.sendMail(mail, function(error, info){
        if(error) return console.log('mail sent error', config.smtp, mail, error);
        console.log('Message sent: ' + info.response);
    });
}

module.exports = {
    send:sendMail
}
/**
 * @author Dylan.zhang
 * @Date 2016 02-16
 */

var nodemailer = require('nodemailer'),
    _ = require('lodash');

var config = require('../config.js'),
    property = require('../routes/property.js');
var transporter = nodemailer.createTransport(config.smtp);

var defaultMail = {
    from: property.emailName+'<' + config.smtp.auth.user + '>',
    subject: '欢迎光顾',
    //to: 'asdfg@163.com, qwert@qq.com',
    //text: 'test text',
    html: '<b>欢迎访问</b>'+property.websiteName
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
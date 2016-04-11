/**
 * Created by dylan.zhang on 4/5/16.
 */
var LocalStrategy = require('passport-local').Strategy;

var Login = require('./../module/login.js'),
    crypto = require('crypto');

var config = require('../../config.js'),
    tools = require('../../utils/tools.js');

module.exports = function(passport){
    passport.serializeUser(function(user,done){
        //done(null,user.id);
        done(null,user);
    });
    passport.deserializeUser(function(id,done){
        //Login.findById(id,function(err,user){
        //    console.log(user);
        //    done(err,user);
        //})
        done(null, id);
    });

    passport.use('xmu-signin',new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },function(req,username,password,done){
        Login.findOne({username:username},function(err,user){
            if (err) {
                console.log(err);
                return done(err, false, req.flash('loginMessage', "Unknow error."));
            }
            if (!user) {
                console.log(!user);
                return done(null, false, req.flash('loginMessage', "找不到" + username));
            }
            //console.log(user);
            if (!user.validPassword(password)){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }
            //console.log(user);
            //req.logout();
            return done(null, user);
        })
    }));

    passport.use('xmu-signup',new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },function(req,username,password,done){
        Login.findOne({email: req.body.email}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, req.flash('signupMessage', '此邮箱 ' + req.body.email + ' 已被注册.'));
            } else {
                Login.findOne({username:req.body.username},function(err,user){
                    if(err){
                        return done(err);
                    }
                    if (user) {
                        return done(null, false, req.flash('signupMessage', '此用户名 ' + req.body.username + ' 已被注册.'));
                    }
                    var newUser = new Login({username: req.body.username});
                    crypto.randomBytes(20,function(err,buf){
                        newUser.activeToken = newUser._id + buf.toString('hex');
                        newUser.activeExpires = Date.now() + 24 * 3600 * 1000; //24 hours
                        newUser.email = req.body.email;
                        newUser.password = newUser.generateHash(password);

                        var link = config.schema + config.outerHost + ":" + config.port + '/xmu/active/' + newUser.activeToken;
			if(link.indexOf(":"+config.port)){
				var host = link.split(":"+config.port);
				var temp="";
				for(var i=0;i<host.length;i++){
					temp+=host[i];
				}
				link = temp;
			}
                        console.log("active link: "+link);

                        tools.send({
                            to: req.body.email,
                            subject: "欢迎注册 ",
                            html: '请点击 <a href="' + link + '">此处</a> 激活。'
                        });
                        newUser.save(function (err, user) {
                            if (err) {
                                return done(err);
                            }
                            //res.send('已发送邮件至' + user.email + '，请在24小时内按照邮件提示激活。');
                            done(null, user, req.flash('loginMessage', '已发送邮件至' + user.email + '，请在24小时内按照邮件提示激活。'));
                        });
                    });
                })
            }
        });
    }));
}

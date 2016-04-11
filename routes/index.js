/**
 * Created by dylan.zhang.
 */
var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    _path_ = require('path'),
    util = require('util'),
    mime=require("./../utils/mime.js").mime,
    querystring = require("querystring"),
    xmu_upload=require('./../module/upload_file.js'),
    xmu_bbs = require('./../module/upload_bbs.js'),
    Login = require('./../module/login.js')
    passport = require('passport'),
    multiparty = require("multiparty");
require("mongoose-query-paginate");
var config = require('../config.js'),
    tools = require('../utils/tools.js'),
    crypto = require('crypto');

var csrf = require('csurf'),
    csrfProtection = csrf({ cookie: true });

var dirs = {
    root: _path_.join(__dirname,"../","public/upload/xmu")
}

function authRequired(req, res, next) {
    if (req.user && req.user.flag===0) return next();
    res.redirect('/xmu/signin?next=' + req.originalUrl);
}

router.post('/bbs',authRequired,function(req,res,next){
    xmu_bbs.create({
        bbs_content:req.body.msg_abstract,
        user:req.user.username
    },function(err,post){
        if (err) return next(err);
        else{
            return res.redirect('/xmu/2015');
        }

    });
}).get('/bbs',authRequired,function(req,res,next){
    res.redirect('/xmu/2015');
});

var upload_root_dir_name={
    "default":"默认目录",
    "javascript":"JS",
    "temp":"临时目录",
    "classmate":"同学录"

}

router.post("/uploadfile",function(req,res,next){
    var root = _path_.join(__dirname,"../","public/upload/xmu"),
        upload_form = new multiparty.Form({uploadDir: root});

    upload_form.parse(req,function(err,fields,files){
        var file_name=fields.file_name_name,
            file_label = fields.file_label,
            file_desc_name = fields.file_desc_name;
        if(err){
            console.log("error"+err);
            return next(err)
        }
        var  upload_file = files.file[0];//originalFilename,path
	    var buf_temp = new Buffer(_path_.join(root,upload_root_dir_name[file_label]),"UTF-8");
        console.log(buf_temp.toString()+"; root path");
	    root =_path_.join(buf_temp.toString());

        var extName = file_name+_path_.extname(upload_file.path);
	    var buf = new Buffer(upload_root_dir_name[file_label],"UTF-8");
        try{
            var is_out = fs.createReadStream(upload_file.path);
                    var os_out = fs.createWriteStream(root+"/"+extName);
                            is_out.pipe(os_out);
                            is_out.on('end',function(){
                    fs.unlinkSync(upload_file.path);
                       res.end(buf.toString()+"/"+extName);
                     });
        }catch(err){
            console.log(err);
        }
    });

}).get('/upload_file',authRequired,csrfProtection,function(req,res,next){
    res.redirect('/xmu/2015');
});

router.get('/path',csrfProtection,function(req,res,next){
    var nums = req.query.nums+"";
    var root = querystring.unescape(nums),
        path = _path_.join(__dirname,"../","public/upload/xmu",root);
    fs.exists(path,function(exists){
        if(!exists){
            util.error('找不到文件'+path);
            res.end("");
        }else{
            fs.stat(path,function(err,stat){
                if(stat.isFile()){
                    res.end("");
                }else if(stat.isDirectory()){
                    var dirList = fs.readdirSync(path);
                    res.end(dirList.length+"");
                }
            });
        }
    })

});

router.get('/2015',authRequired,csrfProtection,function(req,res,next){
    var url_query = req.query;
    if(isEmpty(url_query)){
        showDirectory(dirs.root,req,res,next);
    }else{
        var urlPath = req.query.path,
            filename=_path_.join(dirs.root,urlPath);
        fs.exists(filename,function(exists){
            if(!exists){
                util.error('找不到文件'+filename);
                write404(req,res);
            }else{
                fs.stat(filename,function(err,stat){
                    if(stat.isFile()){
                        showFile(filename,req,res);
                    }else if(stat.isDirectory()){
                        showDirectory(filename,req,res,next);
                    }
                });
            }
        });
    }
});

router.get('/signup',csrfProtection, function (req, res, next) {
    res.render('./xmu/signup', {
        title: "厦大2015级软件工程硕士",
        website: "XMU",
        message: req.flash('signupMessage'),
        csrfToken: req.csrfToken()
    });
}).post('/signup',csrfProtection,passport.authenticate('xmu-signup',{
    successRedirect:'/xmu/signin',
    failureRedirect:"/xmu/signup",
    failureFlash:true
}));

router.get('/forget',csrfProtection, function (req, res, next) {
    res.render('./xmu/forget.html', {
        title: "找回密码",
        website: "XMU",
        message: req.flash('forgetMessage'),
        csrfToken: req.csrfToken()
    });
}).post('/forget', csrfProtection,function (req, res, next) {
    Login.findOne({email: req.body.email}, function (err, user) {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.render('./xmu/forget.html', {
                title: "找回密码",
                website: property.websiteName,
                message: '未找到此邮箱: ' + req.body.email + ",请重新输入",
                csrfToken: req.csrfToken()
            });
        }
        crypto.randomBytes(20, function (err, buf) {
            user.resetPasswordToken = buf.toString('hex');
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.resetFlag = 1;
            var link = config.schema + config.outerHost + ':' + config.port + '/xmu/reset/' + user.resetPasswordToken;

            if(link.indexOf(":"+config.port)){
                var host = link.split(":"+config.port);
                var temp="";
                for(var i=0;i<host.length;i++){
                    temp+=host[i];
                }
                link = temp;
            }


            user.save(function (err, user) {
                if (err) return next(err);
                tools.send({
                    to: req.body.email,
                    subject: '重置您的密码',
                    html: '请在一个小时内点击 <a href="' + link + '">此处</a> 完成重置。'
                });
                console.log("reset link: " + link);

                res.send("<head><title>请进入邮箱重置密码</title></head>" +
                    "<body>" +
                    "<h4 style='text-align: center'>已发送邮件至" + user.email + "请按照邮件提示重置密码。</h4>" +
                    "</body>");
            });

        });
    });
});

router.get(('/active/:activeToken'),function (req, res, next) {
    Login.findOne({
        activeToken: req.params.activeToken,
        activeExpires: {$gt: Date.now()}
    }, function (err, user) {
        if (err) return next(err);
        if (!user) {
            return res.send("<h2>激活失败</h2>您的激活链接无效，请重新 <a href='/xmu/signup'>注册</a>")
        }

        user.active = true;
        user.save(function (err, user) {
            if (err)return next(err);
            res.send("<h2>激活成功</h2> " + user.username + " 请前往 <a href='/xmu/signin'>登陆</a>");
        });
    })
});

router.get(('/reset/:token'),csrfProtection, function (req, res, next) {
    Login.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, function (err, user) {
        if (err) return next(err);
        if (!user) {
            res.render('./xmu/forget.html', {
                title: "找回密码",
                website: "XMU",
                message: "重置链接无效或已过期",
                csrfToken: req.csrfToken()
            });
            return;
        }
        res.render('./xmu/reset.html', {
            title: "重置您的密码",
            website: "XMU",
            username: user.username,
            csrfToken: req.csrfToken()
        });
    });
});

router.post("/reset/:token",csrfProtection, function (req, res, next) {
    Login.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()},
        username: req.body.username,
        resetFlag: 1
    }, function (err, user) {
        if (!user) {
            res.render('./xmu/forget.html', {
                title: "找回密码",
                website: "XMU",
                message: "重置链接无效或已过期",
                csrfToken: req.csrfToken()
            });
            return;
        }
        var password = user.generateHash(req.body.password);

        console.log("after reseting:" + req.body.password);

        user.password = password;
        user.resetFlag = 0;

        user.save(function (err, user) {
            if (err) return next(err);
            res.render('./xmu/signin', {
                title: "登陆 - ",
                website: "XMU",
                message: "重置密码成功，请登陆",
                csrfToken: req.csrfToken()
            });
        });
    });
});

router.get('/signin',csrfProtection,function (req, res, next) {
    res.render('./xmu/signin', {
        title: "登陆",
        website: "XMU",
        message: req.flash('loginMessage'),
        csrfToken: req.csrfToken()
    });
}).post('/signin',csrfProtection,passport.authenticate('xmu-signin', {
    successRedirect: '/xmu/2015',
    failureRedirect: '/xmu/signin',
    failureFlash: true
}));

function isEmpty(value) {
    return Object.keys(value).length === 0;
}

function showFile(filename,req,res){
    fs.readFile(filename,'binary',function(err,file){
        var contentType=mime.lookupExtension(_path_.extname(filename));
        res.writeHead(200,{
            "Content-Type":contentType,
            "Content-Length":Buffer.byteLength(file,'binary')
        });
        res.write(file,"binary");
        res.end();
    })
}

function showDirectory(parent,req,res,next){
    fs.stat(parent,function(err,stat){
        if(err){
            throw err;
        }
        if(stat.isDirectory()){
            fs.readdir(parent,function(err,files){
                var url_query = req.query;
                var page_option = {
                    perPage: 3,
                    delta: 2,
                    page: req.query.page || 1
                };
                xmu_bbs.find({}).sort({upload_time: -1})
                    .paginate(page_option, function (err, pager) {
                        if (err) return next(err);
                        res.render('./xmu/html.html', {
                            title: _path_.basename(parent),
                            msg_files: files,
                            parent:querystring.escape(_path_.relative(dirs.root,parent)),
                            encode_parent:_path_.relative(dirs.root,parent),
                            csrfToken: req.csrfToken(),
                            username:req.user.username,
                            msg_pagers: pager
                        });

                    });
            })
        }
    })
}

router.get(('/bbs_page/:page'),csrfProtection, function (req, res, next) {
    var _page = parseInt(req.params.page);
    var page_option = {
        perPage: 8,
        delta: 2,
        page: _page
    };
    xmu_bbs.find({}).sort({upload_time: -1})
        .paginate(page_option, function (err, pager) {
            if (err) return next(err);
            //console.log(pager);
            res.render('./xmu/bbs.html',{msg_pagers: pager},function(err, html){
                res.send(html);
            });
        });
});

function write404(req,res){
    var body="文件不存在:-(";
    res.writeHead(404,{
        "Content-Type":"text/html;charset=utf-8",
        "Content-Length":Buffer.byteLength(body,'utf8')
    });
    res.write(body);
    res.end();
}

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect('/xmu/signin');
});
module.exports = router;

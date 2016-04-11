/**
 * Created by dylan.zhang on 4/5/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var  bcrypt = require('bcrypt-nodejs');
var loginSchema = new Schema({
    username: {type: String/*, required: true*/},
    password: {type: String/*, required: true*/},
    email:{type: String/*, required: true*/},
    title:{
        type:String,
        default:"未命名"
    },
    description:{
        type:String,
        default:""
    },
    contact:{
        type:String,
        default:""
    },
    active:{
        type:Boolean,
        default:true
    },
    createDate:{
        type:Date,
        default:Date.now()
    },
    activeToken:String,
    activeExpires:String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetFlag:Number,
    flag:{
        type:Number,
        default:0
    }, // 用于接收不到邮件,0 表示成功，1表示未成功。
    loginData:{
        type:Date
    }

});

loginSchema.path('email').validate(function (email) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
}, '请输入有效的电子邮件地址');

loginSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
}

loginSchema.methods.validPassword = function(password){
    //console.log(this.password);
    return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('xmu_login',loginSchema);
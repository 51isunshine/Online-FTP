/**
 * Created by dylan.zhang.
 */

function simpleValidate(){
    var username = $('[name=username]').val().trim(),
        password = $('[name=password]').val(),
        email = $('[name=email]').val().trim();
    console.log(username.length);
    if(username.length<4||username.length>=20){
        infoMsg('用户名不符合规则，请重新设置');
        return false;
    }
    if(!validateEmail(email)){
        infoMsg('邮件不合法');
        return false;
    }
    if(password.length === 0){
        infoMsg('密码不能为空');
        return false;
    }
    return true;
}

function infoMsg(msg){
    $('.alert').hide();
    $('.alert-danger').html(msg).show();
}
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function signUp(){
    if(!simpleValidate()) return false;
    var pwd1 = $('[name=password]').val();
    var pwd2 = $('#pwd2').val();
    if(pwd1!==pwd2){
        infoMsg("两次输入的密码不一致");
        return false;
    }
    $('.alert').hide();
    $('.alert-danger').html("正在注册...").show();
    return true;
}

function reSet(){
    var pwd1 = $('[name=password]').val();
    console.log(pwd1);
    if(pwd1.length === 0){
        infoMsg('密码不能为空');
        return false;
    }
    var pwd2 = $('#pwd2').val();
    if(pwd1!==pwd2){
        infoMsg("两次输入的密码不一致");
        return false;
    }
    $('.alert').hide();
    $('.alert-danger').html("正在重置...").show();
    return true;
}

/**
 * @created: Dylan.zhang
 * @date: 2016 02-01
 * @type {{env: (string|string), schema: string, host: string, port: number, outerHost: string, outerPort: number, mongodb: string, smtp: {host: string, port: number, auth: {user: string, pass: string}}}}
 */
module.exports = {
    //env: process.env.NODE_ENV || 'production',
    env:'development'||'production',
    schema:'http://',
    host:'127.0.0.1',
    port:3000,
    outerHost:'idylan.cn',
    outerPort:80,
    mongodb:'mongodb://localhost/iDylan',
    smtp:{
        host: 'smtp.163.com',
        port: 25,
        auth: {
            user: 'zhangzhi_2008fei@163.com',
            pass: '906864%2008fei'
        }
    }
}

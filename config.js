/**
 * @created: Dylan.zhang
 * @type {{env: (string|string), schema: string, host: string, port: number, outerHost: string, outerPort: number, mongodb: string, smtp: {host: string, port: number, auth: {user: string, pass: string}}}}
 */
module.exports = {
    env:'development'||'production',
    schema:'http://',
    host:'127.0.0.1',
    port:3009,
    outerHost:'127.0.0.1'|'idylan.cn',
    outerPort:"3009"|"",
    mongodb:'mongodb://localhost/online-ftp',
    smtp:{
        host: 'smtp.163.com',
        port: 25,
        auth: {
            user: 'your_email@163.com',
            pass: 'email.name'
        }
    }
}

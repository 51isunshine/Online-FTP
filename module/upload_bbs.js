/**
 * Created by dylan.zhang on 4/4/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var xmu_bbs_schema = new Schema({
    bbs_content:{
        type:String,
        required:true
    },
    upload_time:{
        type:Date,
        default:Date.now
    },
    user:{
        type:String
    }
});

module.exports = mongoose.model("xmu_bbs",xmu_bbs_schema);
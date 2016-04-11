/**
 * Created by dylan.zhang on 4/4/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var xmu_upload_schema = new Schema({
    file_name:{
        type:String,
        required:true
    },
    file_path:{
        type:String
    },
    file_desc:{
        type:String
    },
    upload_time:{
        type:Date,
        default:Date.now
    },
    user:{
        type:String
    }
});

module.exports = mongoose.model("xmu_upload",xmu_upload_schema);
const mongoose = require('mongoose');
module.exports=mongoose.model('newBook',new mongoose.Schema({
    name : String,
    publication : String,
    pub_year:Number,
    author:String,
    edition:Number,
    prize:Number,
    copy:Number,
    supplier:String,
    delivered:{type:Boolean,default:false}
}));

const mongoose = require('mongoose');
module.exports=mongoose.model('book',new mongoose.Schema({
    name : String,
    publication : String,
    pub_year:Number,
    author:String,
    edition:Number,
    prize:Number,
    copy:Number,
    supplier:String
}));

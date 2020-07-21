//class schema
const mongoose = require('mongoose');
module.exports=mongoose.model('class',new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : String,
    roomNumber : Number
}));

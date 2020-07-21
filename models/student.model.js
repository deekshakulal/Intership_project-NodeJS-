//student schema
const mongoose = require('mongoose');

module.exports=mongoose.model('Student',new mongoose.Schema({
    fullName: String,
    gender  : String,
    email   : { type: String,   unique: true    },
    phone   : String,
    class_id :  { type : mongoose.Schema.Types.ObjectId , ref : 'class' }
}));

//student schema
const mongoose = require('mongoose');

module.exports=mongoose.model('newStudent',new mongoose.Schema({
    fullName: String,
    gender  : String,
    email   : { type: String,   unique: true    },
    phone   : String,
    batch_id :  { type : mongoose.Schema.Types.ObjectId , ref : 'batch' }
}));
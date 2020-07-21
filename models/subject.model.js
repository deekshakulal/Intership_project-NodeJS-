//class schema
const mongoose = require('mongoose');
module.exports=mongoose.model('subject',new mongoose.Schema({
    name : String
}));

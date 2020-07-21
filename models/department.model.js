const mongoose = require('mongoose');
module.exports=mongoose.model('department',new mongoose.Schema({
    name : String,
}));

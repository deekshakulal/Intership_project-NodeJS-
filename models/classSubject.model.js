//class schema
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('classsubjects',new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    class_id : { type : ObjectID , ref : 'class' },
    subject_id : { type : ObjectID , ref : 'subject' }
}));

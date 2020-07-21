const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('batch',new mongoose.Schema({
    subject_id : ObjectID,
    batch_name:    String,
    price:{
        type:Number,
        default:100
    },
    studentIDs:[]
}));
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;
module.exports=mongoose.model('fillBooks',new mongoose.Schema({
    bookID:ObjectID,
    delivered:{type:Boolean,default:false}
}));

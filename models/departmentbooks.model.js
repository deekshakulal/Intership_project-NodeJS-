const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('departmentBooks',new mongoose.Schema({
    department_id : ObjectID,
    book_ids :[]
}));
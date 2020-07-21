const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('bookBorrow',new mongoose.Schema({
    student_id : ObjectID,
    book_id:ObjectID,
    issueDate:Date,
    dueDate:Date
}));
//class schema
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('absentLog',new mongoose.Schema({
    attendanceLog_id : ObjectID,
    student_id :  ObjectID
}));

//class schema
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const timeTable = new mongoose.Schema({
    classSubject_id : { type : ObjectID , ref : 'classsubjects' },
    time : String
})

module.exports=mongoose.model('usertimetables',new mongoose.Schema({
    user_id : ObjectID,
    
    mon :[ timeTable ],
    tue :[ timeTable ],
    wed :[ timeTable ],
    thr :[ timeTable ],
    fri :[ timeTable ],
    sat :[ timeTable ]    
}));


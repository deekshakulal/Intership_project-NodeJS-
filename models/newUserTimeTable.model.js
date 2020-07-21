//class schema
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const timeTable = new mongoose.Schema({
    batch_id : { type : ObjectID , ref : 'batch' },
    time : String
})

module.exports=mongoose.model('newusertimetables',new mongoose.Schema({
    user_id : ObjectID,
    
    mon :[ timeTable ],
    tue :[ timeTable ],
    wed :[ timeTable ],
    thr :[ timeTable ],
    fri :[ timeTable ],
    sat :[ timeTable ]    
}));


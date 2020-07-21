const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
module.exports=mongoose.model('studentSubject',new mongoose.Schema({
    student_id : ObjectID,
    subjects : [],
    fees:Number,
    status:{
        paid:{
            type:Boolean,
            default: false
        },
        amount:{
            type:Number,
            default: function(){
                        if(this.status.paid) 
                            return this.fees
                        else 
                            return 0
                        }
            }
        },
    pending:{
        type:Boolean,
        default: function(){
                    if(this.fees==this.status.amount) 
                        return false
                    else 
                        return true
                }
            }
}));
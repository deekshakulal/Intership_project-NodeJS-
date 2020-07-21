//otp schema
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;
let otpSchema = new mongoose.Schema({
    email :{type: String,unique:true},
    otp : String,
   expireAt: {type:Date,
       default:Date.now()
    }  
  });

otpSchema.index({expireAt:1},{expireAfterSeconds:360})
//{createdAt:{type:Date,expires:'30s',default:Date.now}
module.exports=mongoose.model('otp',otpSchema);


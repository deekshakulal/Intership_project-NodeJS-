const jwt = require('jsonwebtoken');
//const fs = require('fs');

const User = require('../models/user.model');
const UserTT = require('../models/userTimeTable.model');
const ClassSubject = require('../models/classSubject.model');
const Subject = require('../models/subject.model');
const Class = require('../models/class.model');
const AttendanceLog = require('../models/attendanceLog.model');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Response = require('../response');

const randomString = require('randomstring');

const mail = require('../middleware/mail');

const OTP = require('../models/otp.model');


module.exports.login = async (req, res) => {
    try {
        //Comment: use any 1 approach (either object.assign (refer signup API) or variable method)
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        const resData = { userToken: token };
        new Response(200).setData(resData).send(res);
    } catch (error) {
        new Response(401).send(res);
    }
}

module.exports.signup = (req, res, next) => {
    var user = new User();
            //Comment: use any 1 approach (either variable method (refer login API or this))
    Object.assign(user, req.body);
    user.save()
        .then(value => {
            //comment: response code is 200?
            new Response(201).send(res);
        })
        .catch (err => {
            if(err.name==='ValidationError')
                new Response(400).setError('Required Field Missing').send(res)
            else    
                new Response(409).send(res);
        
        });
}

module.exports.profile = async (req, res, next) => {
    try {
        //Comment : why _id:false, _v:false??
        const userDetails = await User.findOne({ _id: req.userID }, { _id: false, __v: false, password: false, token: false });
        new Response(200).setData(userDetails).send(res);
    }
    catch (err) {
        new Response(404).send(res);
    }
}

module.exports.profileUpdate=async (req,res,next)=>{
    var bodyinput = req.body;
    if (bodyinput['password'])
        bodyinput['password'] = await bcrypt.hash(bodyinput['password'], Math.random())
    User.findOneAndUpdate({ _id: req.userID }, { $set: bodyinput })
        .then(value => {
            new Response(200).send(res);
        })
        .catch(err => {
            if (bodyinput['email'])
                new Response(409).send(res)
            else
                new Response(422).send(res);
        })
}

module.exports.forgotPassword = async (req, res, next) => {
    var userEmail = req.body.email;
    User.findOne({ email: userEmail }, { email: true })
        .then(retrievedValue => {
            if (!retrievedValue) throw ('email not found')
            const temporaryPassword = randomString.generate({
                charset: userEmail
            }, reason => { });

            mail(userEmail, temporaryPassword);

            const searchFilter = { email: userEmail }
            const dataToBeUpdated = {
                otp: temporaryPassword,
                expireAt: Date.now()
            }
            OTP.findOneAndUpdate(searchFilter, dataToBeUpdated, {
                new: true,
                upsert: true

            }).then(value => {
                new Response(200).send(res);
            }, reason => {
                new Response(404).send(res);
            })

        }, reason => {
            new Response(409).send(res);
        })
        .catch(err => {
            new Response(409).send(res);
        })

}

module.exports.newPassword = async (req, res, next) => {

    const existingOTP = await OTP.findOne({ email: req.body.email }, { otp: true })
    if(!existingOTP) new Response(409).send(res)
    
    else if ((existingOTP.otp === req.body.otp)) {
        var recievedPassword = req.body.password;
        if (recievedPassword)
            recievedPassword = await bcrypt.hash(recievedPassword, Math.random())
        User.findOneAndUpdate({ email: req.body.email }, { password: recievedPassword })
            .then(value => {
                OTP.deleteOne({ email: req.body.email }).then(updated => {
                    new Response(200).send(res);
                })
            }, reason => {
                new Response(422).send(res);
            });
    }
    else {
        new Response(400).setError('Invalid OTP').send(res);
    }
}

const ObjectId = mongoose.Types.ObjectId;

const getTimeStamp = (date) => {return Math.floor(date.getTime() / 1000).toString(16);}
function attendanceTaken( user_id, classSubject_id, fromDate){

    return new Promise((resolve,reject) => {
        const toDate = new Date(fromDate);
        fromDate.setHours(0,0,0,0);
        toDate.setHours(23,59,59,999);

        const fromDate_id = getTimeStamp(fromDate) + "0000000000000000";
        const toDate_id   = getTimeStamp(toDate)   + "0000000000000000";
        AttendanceLog.find({
            _id: {$gte : ObjectId(fromDate_id),$lte : ObjectId(toDate_id)},
            user_id: ObjectId(user_id),
            classSubject_id:classSubject_id
            
        })
        .then(attendanceLog => {
            if(attendanceLog.length > 0){
                resolve(attendanceLog[0]._id);
            }else{
                resolve();
            }
        })
    })
}

module.exports.timeTable = async (req, res)=> {

    var data = [] ;
    var i=0;
    const weekDay = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat'];
    var date = new Date();
    

    if(req.body.date){ date = new Date(req.body.date); }
    var today  = date.getDay();

    await UserTT.findOne({ user_id : req.userID }, { [weekDay[today]] : true }).then(result => {

        if(!result[weekDay[today]]){ return new Response(404).send(res);}

        result[weekDay[today]].forEach(element => {
            ClassSubject.aggregate([
            {$match : { _id : element.classSubject_id}},
            {$group : {_id : {_id : '$_id',class_id : '$class_id',subject_id : '$subject_id'}}},
            
            {$lookup :  {
                'from': Class.collection.name.toString().trim(),
                'localField': 'class_id',
                'foreignField': 'ObjectId(_id)',
                'as': 'csids'
              }},
              
            {$lookup : {
                'from' : Subject.collection.name.toString().trim(),
                'localField' : 'subject_id',
                'foreignField' : 'ObjectId(_id)',
                'as' : 'sids'
            }},
           
],async  (err, response) => {
    
    if(!err){

        var obj = {};

        response[0].csids.forEach(a => {
            
                if(a._id.equals(response[0]._id.class_id)){
                    
                    obj.classSubjectId = response[0]._id._id;
                    obj.className = a.name;
                    obj.roomNumber = a.roomNumber;
                }
        });

        response[0].sids.forEach(a => {
            if(a._id.equals(response[0]._id.subject_id)){
                obj.subjectName = a.name;
            }
        });
        obj.time = element.time;
        obj.attendanceLogID = await attendanceTaken(req.userID, element.classSubject_id, date);
        if(obj.attendanceLogID)obj.classSubjectId = undefined
        data.push(obj);
        obj = {};
        ++i;
        if(i===result[weekDay[today]].length){new Response(200).setData(data).send(res);}

    }
    });
            
            
    });


}).catch(error => { new Response(404).send(res)});
}

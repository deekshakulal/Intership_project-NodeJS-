const User = require('../models/user.model');
const UserTimeTable = require('../models/userTimeTable.model')
const newUserTimeTable = require('../models/newUserTimeTable.model')
const Student = require('../models/newStudent.model');
const Subject = require('../models/subject.model');
const Batch = require('../models/batch.model');
const subjectstudents = require('../models/studentSubject.model');
const Response=require('../response')
const NewAttendanceLog=require('../models/newAttendanceLog.model')
var crypto = require('crypto');
const getTimeStamp = (date) => {return Math.floor(date.getTime() / 1000).toString(16)}
const AttendanceLog = require('../models/newAttendanceLog.model');
const NEXMO_API_KEY = '019301b0';
const NEXMO_API_SECRET ='1maZVeSWIRtyXHBo';
const Nexmo = require('nexmo');
const from = 'Nexmo';
const nexmo = new Nexmo({
    apiKey: NEXMO_API_KEY,
    apiSecret: NEXMO_API_SECRET
  })
const Book = require('../models/book.model')
const newBook= require('../models/newBook.model')
const FillBooks=require('../models/fillBooks.model')

module.exports.deleteUser = async (req, res, next) => {
    var userid = req.body.id;
    User.findOneAndDelete({ _id: userid })
        .then(value => {
            if (!value) throw new Response(404).send(res);
            new Response(200).send(res);
            console.log("Deleted Successfully!")
        })
        .catch(err => {
            new Response(404).send(res);
        })

}
module.exports.deleteStudent = async (req, res, next) => {
    const studentid = req.body.id;
    Student.findOneAndDelete({ _id: studentid }, { _id: true })
        .then(value => {
            if(!value) throw new Response(404).send(res);
            new Response(200).send(res);
            console.log("Deleted Successfully!")
        },reason=>{
            new Response(404).send(res);
})
}


module.exports.addSubject = async (req, res, next) => {
    var subject = new Subject({
        name: req.body.name
    });
    subject.save()
        .then(value => {
            new Response(201).send(res);
        }, reason => {
            new Response(422).send(res);
        })
}

module.exports.deleteSubject=async(req,res,next)=>{
    const subjectid=req.body.id;
         Subject.findOneAndDelete({_id:subjectid},{_id:true})
         .then(value => {
              if(!value) throw new Response(404).send(res);
            console.log("Deleted Successfully!") 
            new Response(200).send(res);
             
         },reason=>{new Response(404).send(res);})
             
 }

module.exports.registerStudent=async(req,res,next)=>{
    var fees=0
    var newbatch=false
    var student=new Student()
    var subs=req.body.subjects;
    Object.assign(student,req.body)
    student.save()
    .then(value => {
        subs.forEach(async (element) => {
            const exist=await Batch.findOne({subject_id:element}).sort({_id:-1})  //if the batch already exists
            if(exist){
                if(exist.studentIDs.length<2){ //check for the number of students in the batch. if exceeding, create new batch of the same subject and ask for the price, if not , push the student id to batch
                    exist.studentIDs.push(value._id)
                    Save(exist,value._id,exist.batch_name.slice(0,exist.batch_name.length-2))
                }else{
                    newbatch=true
                    Subject.find({_id:element})
                    .then(val=>{
                        let batch=new Batch({
                        subject_id : element,
                        batch_name: val[0].name+" "+String.fromCharCode((exist.batch_name.charCodeAt(exist.batch_name.length-1))+1), //to get alphabets
                        studentIDs:value._id,
                        price:req.body.price
                        })
                        Save(batch,value._id,val[0].name)
                        Object.assign(student)
                    })
                }
            }else{
                newbatch=true // so front end should show the message for admin about the price whether to increase or not .
                Subject.find({_id:element})
                .then(val=>{
                        let batch=new Batch({
                        subject_id : element,
                        batch_name: val[0].name+" A",
                        studentIDs:value._id,
                        price:req.body.price
                    })
                    
                    Save(batch,value._id,val[0].name)
                    
                })
            }
        })
    })
        .catch(err => {
            if (err.name === 'ValidationError')
                new Response(400).setError('Required Field Missing').send(res)
            else
                new Response(409).send(res);
        })
    function Save(collection,sid,sub){
        collection.save()
        .then(val=>{
            console.log(val)
            fees=fees+val.price
            subjectstudents.findOneAndUpdate({student_id:sid},{$push:{subjects:{subject:sub,batch_name:val.batch_name}},fees:fees},{new:true,upsert:true})
            .then(val=>{
                new Response(200).send(res);
            },reason=>
            {
                new Response(422).send(res);
            })
        },reason=>
        {
            new Response(404).send(res);
        })
    }
}
//to view the fees details of the student 
module.exports.view=async (req,res,next)=>{
        var studentid=req.body.studentid
        await subjectstudents.find({student_id:studentid})
        .then( async val=>{
            console.log(val)
            var data={}
            data.details=val[0].subjects
            data.totalFees=val[0].fees
            data.status=val[0].status
            data.pending=val[0].pending
            //new Response(200).setData(data).send(res)
            if(req.body.paid=="true" && req.body.amount){
                await subjectstudents.findOneAndUpdate({student_id:studentid},{status:{paid:req.body.paid,amount:req.body.amount}}) //if partially paid 
                .then(val=>{
                    console.log(val)
                    data.status=val.status
                    data.pending=val.pending
                    new Response(200).setData(data).send(res)
                    
                },reason=>
                {
                    new Response(422).send(res);
                })
            }
            else if(req.body.paid=="true" && !(req.body.amount)){
                await subjectstudents.findOneAndUpdate({student_id:studentid},{status:{paid:req.body.paid}}) //if fully paid 
                .then(val=>{
                    console.log(val)
                    data.status=val.status
                    data.pending=val.pending
                    new Response(200).setData(data).send(res);
                    
                },reason=>
                {
                    new Response(422).send(res);
                }) 
            }
            else
                new Response(200).setData(data).send(res);
        },reason=>
        {
            new Response(404).send(res);
        })


}

module.exports.assignTimeTable = async (req, res, next) => {
    try {
        const isUserExisting = await User.findOne({ _id: req.body.user_id })
        if (isUserExisting) {
            const updatedTimeTable = await UserTimeTable.findOneAndUpdate({ user_id: req.body.user_id }, req.body, { new: true, upsert: true });
            if (updatedTimeTable) new Response(200).setData(updatedTimeTable).send(res)
        }
        else {
            new Response(404).setError("User Not Found").send(res)
        }
    }
    catch (error) {
        new Response(422).send(res)
    }
}

module.exports.getStudentDetails = async (req, res, next) => {
    try {
        const studentDetails = await Student.findOne({ _id: req.body.studentID }, { _id: false, class_id: false })
        if (studentDetails)
            new Response(200).setData(studentDetails).send(res)
        else {
            new Response(404).setError('Student not Found').send(res)
        }
    }
    catch (error) {
        new Response(422).send(res)
    }
}

module.exports.getAttendance = async (req,res) => {
    try {
            var absent = await AttendanceLog.findOne({_id:req.body.attendanceLogID,user_id:req.userID},{studentIDs:true,batch_id:true});
            const studentids = await Batch.find({_id:absent.batch_id},{studentIDs:true,_id:false});
            const students =await Student.find({_id:{"$in":studentids[0].studentIDs}},{fullName:true})
            console.log(students)
            let ab ={};
            absent.studentIDs.forEach(ele =>{
                ab[ele] = true;
            })
            console.log(ab)
            let resData =[]
            students.forEach(ele =>{
                console.log(ele)
                resData.push({
                    studentName : ele.fullName,
                    absent : ab[ele._id]?true:false
                })
            })
            new Response(200).setData(resData).send(res);
        }
    catch(err) {
        new Response(404).send(res);
     }

    }

    module.exports.addAttendance = async (req,res,next) => {
        let data = req.body;
        let attendanceLog = new AttendanceLog({
            _id: getTimeStamp(new Date(req.body.date))+crypto.randomBytes(8).toString("hex"),
            user_id:    req.userID,
            batch_id : data.batchID,
            studentIDs : data.studentIDs
            
        });
         var studentIDs = data.studentIDs
         console.log(studentIDs,req.userID)
        attendanceLog.save()
            .then(val => {
                console.log(val)
                Batch.find({_id:data.batchID},function(err,result){
                    if (err) throw new Response(404).send(res);
                    Subject.find({_id:result[0].subject_id},function(err,result){
                        if (err) throw new Response(404).send(res);
                        var sub_name=result[0].name;
                        Student.find({"_id":{"$in":studentIDs}},{phone:true,fullName:true})
                            .then(val=>{
                                new Response(200).send(res)
                                sms(val,sub_name)
                            })
                    })
                })   
        },reason => {
            new Response(422).send(res); 
        })
    }
    function sms(val,sub_name){
       val.forEach(element=>{
        var to=element.phone;
        const text = element.fullName+' is absent today for '+ sub_name
        nexmo.message.sendSms(from, to, text, (err, responseData) => {
            if (err) {
                console.log(err);
            }else {
                if(responseData.messages[0]['status'] === "0") {
                    console.log("Message sent successfully.");
                } else {
                    console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                }
            }
        })
    })
    }



    module.exports.list = async (req,res)=>{
        await Batch.findOne({_id : req.body.batchID},{studentIDs:true,_id:false}).then(values => {
            Student.find({_id:{"$in":values.studentIDs}})
            .then(value =>{
                    var list = [];
                   (value.forEach(element => { list.push({
                    "studentID":element._id,
                    "name":element.fullName
                    }) }));
                   new Response(200).setData(list).send(res);
               }).catch(reason => {
                   new Response(404).send(res);
               });        
        }).catch(error => {
            new Response(404).setData('Student list not found for the class').send(res);
        });
    }

    module.exports.studentProfileUpdate=async (req,res,next)=>{
        var bodyinput = req.body;
        Student.findOneAndUpdate({ _id: req.body.studentID }, { $set: bodyinput })
            .then(value => {
                new Response(200).send(res);
            })
            .catch(err => {
                if (bodyinput['email'])
                    new Response(409).send(res)
                else
                    new Response(422).send(res);
            })
            if(req.body.amount){
                subjectstudents.findOne({student_id:req.body.studentID}) //if partially paid 
                .then(async val=>{
                await subjectstudents.findOneAndUpdate({student_id:req.body.studentID},{status:{paid:true,amount:(val.status.amount+req.body.amount)}}) //if partially paid 
            .then(val=>{
                console.log(val)
         })
    })
}
    }

    module.exports.assignTimeTableBatch = async (req, res, next) => {
        try{
        const isUserExisting = await User.findOne({ _id: req.body.user_id })
        if (isUserExisting) {
            const updatedTimeTable = await newUserTimeTable.findOneAndUpdate({ user_id: req.body.user_id }, req.body, { new: true, upsert: true });
            if (updatedTimeTable) new Response(200).setData(updatedTimeTable).send(res)
        }
        else {
            new Response(404).setError("User Not Found").send(res)
        }
    }catch(error){
        new Response(422).send(res)
    }
}


module.exports.refillRequests = async (req, res, next) => {
    try {
        const refill = await FillBooks.find({}, { __v: false })
        const newBooks = await newBook.find({}, { __v: false })
        if (refill.length != 0 || newBooks.length != 0) {
            const booksToBeBought = {
                old:[],
                newOne:[]
            }


            refill.forEach(async element => {
                if (element.delivered === false) {
                    booksToBeBought.old.push(element)
                    const updatedRefillRequests = await FillBooks.findOneAndUpdate({ _id: element._id }, { delivered: true })
                    
                   // console.log(booksToBeBought)
                }
            })
            newBooks.forEach(async element1 => {
                if (element1.delivered === false) {
                    booksToBeBought.newOne.push(element1)
                    const updatedNewRequests = await newBook.findOneAndUpdate({ _id: element1._id }, { delivered: true }, { __v: false })
                    
                    //console.log(booksToBeBought)
                }
            })
            //console.log(booksToBeBought)
            if (booksToBeBought.old.length == 0 && booksToBeBought.newOne.length == 0) {
                new Response(400).setError('No new Requests').send(res)
            } else {
                new Response(200).setData(booksToBeBought).send(res)
            }
        } else
            new Response(400).setError('No new Requests').send(res)
    } catch (error) {
        console.log(error)
        new Response(404).send(res)
    }

}

module.exports.getAttendanceHistory = async (req, res, next) => {
    try {
        const batchID = await NewAttendanceLog.find({ studentIDs: [req.body.studentID] }, { _id: true, batch_id: true })
        const attendanceDetails = []
        var itemsProcessed=0
        if (batchID.length != 0) {
            batchID.forEach(async element => {
                const batch = await Batch.findOne({ _id: element.batch_id }, { _id: false, batch_name: true });
                attendanceDetails.push({ date: element._id.getTimestamp(), batchName: batch.batch_name })
                itemsProcessed++
                if(itemsProcessed===batchID.length)
                sendResponse(attendanceDetails)
            })
           function sendResponse(attendanceDetails){
            if(attendanceDetails.length!=0){
            new Response(200).setData(attendanceDetails).send(res)
            }else
            new Response(400).setError('Invalid Batch').send(res)
            }
        }else
        new Response(404).setError('Student not found').send(res)
    }
    catch (error) {
        console.log(error)
        new Response(422).send(res)
    }
}

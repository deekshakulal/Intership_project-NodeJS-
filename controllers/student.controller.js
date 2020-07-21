const Student = require('../models/student.model');
const classSubject = require('../models/classSubject.model');
const mongoose = require('mongoose');

const Response = require('../response.js');
// const Mongoose = mongoose.Schema;

module.exports.list = async (req,res)=>{
    await classSubject.findOne({_id : req.body.classSubjectID}).then(values => {
        Student.find({class_id : values.class_id})
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


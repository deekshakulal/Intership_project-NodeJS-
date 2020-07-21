const Book = require('../models/book.model');
const Department=require('../models/department.model');
const departmentBooks=require('../models/departmentbooks.model');
const FillBooks=require('../models/fillBooks.model')
const BookBorrow=require('../models/bookBorrow.model');
const NewBook=require('../models/newBook.model');
const Response = require('../response');
const mongoose = require('mongoose');
const date = require('date-and-time');
module.exports.addBooks = (req, res, next) => {
    var book = new Book();
    Object.assign(book, req.body);
    book.save()
        .then(value => {
            new Response(200).send(res);
        }
        )
        .catch(err => {
                new Response(422).send(res);

        })
}
module.exports.addDepartment = (req, res, next) => {
    var department = new Department();
    Object.assign(department, req.body);
    department.save()
        .then(value => {
            new Response(200).send(res)
        })
        .catch(err => {
            new Response(422).send(res);
        })
}
module.exports.booksInDepartment = (req, res, next) => {
    let data = req.body;
    departmentBooks.findOneAndUpdate({ department_id: data.department_id }, { $push: { book_ids: data.book_ids } }, { new: true, upsert: true })
        .then(val => {
            new Response(200).send(res)
        })
        .catch(err => {
            new Response(404).send(res);
        })
}
module.exports.deleteBooks = (req, res, next) => {
    let id = req.body.id
    Book.findOneAndDelete({ _id: id })
        .then(val => {
            if (!val) throw new Response(404).send(res);
            new Response(200).send(res)
        })
        .catch(err => {
            new Response(404).send(res);
        })
}


module.exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find();
        if (departments) {
            new Response(200).setData(departments).send(res)
        } else
            new Response(404).setError("No Departments Exist").send(res)
    } catch (error) {
        new Response(422).send(res)
    }
}


module.exports.borrowBook=async(req,res,next)=>{
    try{
    const existingBook=await Book.findOne({_id:req.body.book_id})
    var scount=await BookBorrow.find({student_id:req.body.student_id})
    console.log(scount.length);
    if(existingBook){
        if(existingBook.copy!=0 )
        {
            if(scount.length<3){
                let bcount=existingBook.copy-1;
                let bookBorrow=new BookBorrow({
                    student_id:req.body.student_id,
                    book_id:req.body.book_id,
                    issueDate:new Date(),
                    dueDate:date.addDays(new Date(),15)
                });
                bookBorrow.save()
                console.log(bookBorrow)
                await Book.findOneAndUpdate({_id:req.body.book_id},{$set:{"copy":bcount}})
                new Response(200).send(res);
            }
            else{
                new Response(404).setData("Maximum 3 Books you can borrow").send(res)
            }
        }
        else{
           new Response(404).setError("Books are unavailable").send(res)
           const book= new FillBooks({
               bookID:req.body.book_id
           })
           book.save().then(result=>{
               console.log(result)
           },reason=>{
               console.log(reason)
           })
        }
    }
    else
    {
        new Response(404).setError("Book Doesn't Exist").send(res)
    }
}
catch(error){
    new Response(422).send(res)
}
}
module.exports.getBooks = async (req, res, next) => {
    try {
        if(req.body.departmentID)
        {
            const books = await departmentBooks.findOne({ department_id: req.body.departmentID }, { book_ids: true, _id: false })
            const booklist=await Book.find({"_id":{"$in":books.book_ids}})
            if (booklist) {
                new Response(200).setData(booklist).send(res)
            }else
                new Response(404).setError("Department Doesn't Exist").send(res)
        }
        else{
            const books=await Book.find();
            if(books){
                new Response(200).setData(books).send(res)
            }else{
                new Response(404).setError("Books Doesn't Exist").send(res)
            }
        }
    }
    catch (error) {
        new Response(422).send(res)
    }
}
module.exports.returnBooks = async(req,res,next) => {
    try{
        const existingBorrower=await BookBorrow.findOne({_id:req.body.id})
        if(existingBorrower){
            var timeDiff = (new Date().getTime() - existingBorrower.dueDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000*3600* 24))-1;
            console.log(diffDays)
            let books=await Book.findOne({_id:existingBorrower.book_id})
            let bcount=books.copy+1;
            console.log(bcount)
            await BookBorrow.findOneAndDelete({_id:req.body.id })
            await Book.findOneAndUpdate({_id:existingBorrower.book_id},{$set:{"copy":bcount}})
            if(diffDays>0)
            {
                var fineamount=5*diffDays
                new Response(200).setData("Fine amount is "+fineamount+" Rupees").send(res)
            }
            else{
                new Response(200).send(res)
            }
        }
        else{
            new Response(404).setError("Borrower Doesn't Exist").send(res)
        }
    }
    catch(error)
    {
        new Response(422).send(res)
    }
}
module.exports.newBooks = (req, res, next) => {
    var newBook = new NewBook();
    Object.assign(newBook, req.body);
    newBook.save()
        .then(value => {
            new Response(200).send(res);
        }
        )
        .catch(err => {
                new Response(422).send(res);

        })
}
module.exports.updateBookCopies=async(req,res,next)=>{
    try{
        const existingBook= await Book.findOne({_id:req.body.book_id})
        var bcount=req.body.copy+existingBook.copy
        if(existingBook){
            await Book.findOneAndUpdate({_id:req.body.book_id},{$set:{"copy":bcount}})
            new Response(200).send(res);
        }
        else{
            new Response(404).setError("Book Doesn't Exist").send(res)
        }
    }
    catch(error){
        new Response(422).send(res)
    }
}
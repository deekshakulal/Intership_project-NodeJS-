const router = require('express').Router();
const libraryController = require('../controllers/library.controller');

router.post('/addBooks',libraryController.addBooks);
router.post('/addDepartments',libraryController.addDepartment);
router.post('/adddeptBooks',libraryController.booksInDepartment);
router.post('/deleteBooks',libraryController.deleteBooks);
router.post('/getDepartments',libraryController.getDepartments)
router.post('/getBooks',libraryController.getBooks)
router.post('/borrowBooks',libraryController.borrowBook)
router.post('/returnBook',libraryController.returnBooks)
router.post('/getnewBooks',libraryController.newBooks)
router.post('/updatebookCopies',libraryController.updateBookCopies);
module.exports = router;
const router = require('express').Router();
const adminController = require('../controllers/admin.controller');

router.delete('/deleteUser',adminController.deleteUser);
router.delete('/deleteStudent',adminController.deleteStudent);
router.post('/addSubject',adminController.addSubject);
router.delete('/deleteSubject',adminController.deleteSubject)
router.post('/registerStudent',adminController.registerStudent);
router.post('/assignTimeTable',adminController.assignTimeTable);
router.post('/getStudentDetails',adminController.getStudentDetails);
router.post('/viewFee',adminController.view);
router.post('/attendance',adminController.addAttendance);
router.post('/getAttendance',adminController.getAttendance)
router.post('/list',adminController.list);
router.post('/assignTimeTableBatch',adminController.assignTimeTableBatch);
router.post('/studentProfileUpdate',adminController.studentProfileUpdate);
router.post('/getRefillRequests',adminController.refillRequests);
router.post('/getAttendanceHistory',adminController.getAttendanceHistory)
module.exports = router;
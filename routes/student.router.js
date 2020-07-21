const router = require('express').Router();
// const auth  = require('../middleware/auth');
const studentController = require('../controllers/student.controller')

//student routing
router.post('/list',studentController.list);

module.exports = router;

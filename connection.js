const mongoose = require('mongoose')
//fixex all deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


//Register schema to models here
require('./models/user.model')
//require('./models/absentLog.model')
require('./models/attendanceLog.model')
require('./models/class.model')
require('./models/classSubject.model')
require('./models/student.model')
require('./models/subject.model')
require('./models/userTimeTable.model')

module.exports.connectionToDatabase = () => {
    mongoose.connect( process.env.DB_URL)
        .then   (val => {   console.log('Connected to DB');     })
        .catch  (err => {   console.log('Not Connected to DB'); });
}
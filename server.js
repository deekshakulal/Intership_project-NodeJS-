
const express = require('express');
const environmentSettings = require('dotenv');
const cors = require('cors');
const appRouter = require('./routes');
const bodyParser = require('body-parser');
// db connectorn
const connection = require('./connection');

const app = express();

// get all the environment variables to the current Node session or main thread context
environmentSettings.config();

let PORT = 3000;

if(process.env.SERVER_PORT !== '')
    PORT = process.env.SERVER_PORT;

connection.connectionToDatabase();

app.use(require('./middleware/auth'));

//modules for express
app.use(cors());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//will automatically search for index.js in './routes' folder
app.use(appRouter);
app.listen(PORT, function(){
    console.log('Listening on port ' + PORT)
});

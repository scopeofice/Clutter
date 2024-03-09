const express = require('express');
const path = require('path');
const cors = require('cors')
const fileRoute = require('./routes/file');
const dotenv = require("dotenv")
const bodyParser = require("body-parser");
const conectDB = require('./db/db');

const app = express();

dotenv.config({
  path:  './Config/config.env'
})
conectDB();
app.use(cors());
app.use(fileRoute);

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(express.static(path.join(__dirname, 'build')));


const PORT = process.env.PORT || 3030 ;

app.listen(PORT, () => {
  console.log('server started on port 3030');
});

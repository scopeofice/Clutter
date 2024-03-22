const express = require('express');
const path = require('path');
const cors = require('cors')
const fileRoute = require('./routes/file');
const dotenv = require("dotenv")
// const connection = require("./db/db")



const app = express();

dotenv.config({
  path:  './Config/config.env'
})

// connection();

app.use(cors());
app.use(fileRoute);

app.use(express.json());


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3030 ;

app.listen(PORT, () => {
  console.log('server started on port 3030');
});

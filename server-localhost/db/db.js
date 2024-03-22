const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

connection.connect((error)=>{
  if(error){
      console.log("error occoured"+JSON.stringify(error))
  }else{
      console.log("connection successful")        
  }
});

module.exports = connection;

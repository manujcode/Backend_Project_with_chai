
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import {connectDB} from './db/dbConnect.js';
// import express from 'express';
// const app = express();





connectDB()
.then(() => {
   app.listen(process.env.PORT|| 8000,()=>{
         console.log(`server is running on port  ${process.env.PORT|| 8000}`)
   })
})
.catch((err) => {
    console.log('database failed', err);


});


 
  

import dotenv from 'dotenv';
dotenv.config();
import {connectDB} from './db/dbConnect.js';
import express from 'express';
const app = express();





connectDB();

try{
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port 3000');
    });
}
catch(err){
    console.log('Error starting server', err);
}
 
  
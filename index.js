import { config } from 'dotenv';
config();
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoute from './routes/authRoute.js'

const app=express();
const PORT=process.env.PORT||5000;
const mongoLink=process.env.MONGODB_URI||"mongodb://127.0.0.1:27017";

try{
    mongoose.connect(mongoLink,{
        dbName: "sehatSyncDB"
    });
    const db = mongoose.connection;
    db.once('open', () => {console.log('Connected to MongoDB!')});
}catch(err){
    console.log("Connection to database failed", err);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoute);


app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
});
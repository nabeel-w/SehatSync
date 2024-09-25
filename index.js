import express from "express";
import bodyParser from "body-parser";
import authRoute from './routes/authRoute.js'
import adminRoute from './routes/adminRoute.js'
import { connectDb } from './utils/db.js'
import { config } from 'dotenv';
config();

const app=express();
const PORT=process.env.PORT||5000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoute);
app.use('/admin', adminRoute)


app.listen(PORT,()=>{
    connectDb();
    console.log(`Server started at port ${PORT}`);
});
import mongoose from "mongoose";
import { config } from 'dotenv';
config();

export const connectDb = async()=>{
    try{
        const mongoLink=process.env.MONGODB_URI||"mongodb://127.0.0.1:27017";
        await mongoose.connect(mongoLink,{
            dbName: "sehatSyncDB"
        });
        console.log('Connected to MongoDB successfully!');
    }catch(err){
        console.log("Connection to database failed", err);
        throw err;
    }
};

export const disconnectDb = async () =>{
    await mongoose.connection.close();
};
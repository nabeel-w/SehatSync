import mongoose from "mongoose";
import { config } from 'dotenv';
config();

export const connectDb = ()=>{
    try{
        const mongoLink=process.env.MONGODB_URI||"mongodb://127.0.0.1:27017";
        mongoose.connect(mongoLink,{
            dbName: "sehatSyncDB"
        });
        const db = mongoose.connection;
        db.once('open', () => {console.log('Connected to MongoDB!')});
    }catch(err){
        console.log("Connection to database failed", err);
    }
};

export const disconnectDb = async () =>{
    await mongoose.connection.close();
};
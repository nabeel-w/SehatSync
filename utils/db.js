import mongoose from "mongoose";
import { config } from 'dotenv';
config();

export const connectDb = async (TEST_ENV = false) => {
    try {
        const mongoLink = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
        if (!TEST_ENV)
            await mongoose.connect(mongoLink, {
                dbName: "sehatSyncDB"
            });
        else
            await mongoose.connect(mongoLink, {
                dbName: "testDB"
            });
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.log("Connection to database failed", err);
        throw err;
    }
};

export const disconnectDb = async () => {
    await mongoose.connection.close();
};
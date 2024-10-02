import express from "express";
import bodyParser from "body-parser";
import authRoute from './routes/authRoute.js';
import adminRoute from './routes/adminRoute.js';
import bedRoute from './routes/bedRoute.js';
import doctorRoute from './routes/doctorRoute.js';
import hospitalRoute from './routes/hospitalRoute.js';
import bookingRoute from './routes/bookingRoute.js';
import { connectDb } from './utils/db.js'
import { config } from 'dotenv';
config();

const app=express();
const PORT=process.env.PORT||5000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoute);
app.use('/admin', adminRoute);
app.use('/bed', bedRoute);
app.use('/doctor', doctorRoute);
app.use('/hospital', hospitalRoute);
app.use('/booking',bookingRoute);

function startServer() {
    connectDb()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server started at port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Failed to start server due to DB connection issue", err);
        });
}

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;
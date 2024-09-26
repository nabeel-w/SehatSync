import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getDoctors, getHospitals } from "../controller/hospitalController.js";

const router = express.Router();

router.post('/get-hospitals', authMiddleware, getHospitals);
router.post('/get-doctors', authMiddleware, getDoctors)


export default router;
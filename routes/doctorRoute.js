import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getPrivateDoctor } from "../controller/doctorController.js";

const router = express.Router();

router.post('/get-clinics', authMiddleware, getPrivateDoctor);

export default router;
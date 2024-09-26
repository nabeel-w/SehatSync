import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { availableBeds } from "../controller/bedController.js";

const router = express.Router();

router.post('/get-beds', authMiddleware, availableBeds)


export default router;
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { bookBed, bookDoctor } from "../controller/bookingController.js";

const router = express.Router();

router.post('/book-bed', authMiddleware, bookBed);
router.post('/book-appointment', authMiddleware, bookDoctor);

export default router;
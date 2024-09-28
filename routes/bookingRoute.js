import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { bookBed, bookDoctor, bookingCancel } from "../controller/bookingController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { bookBedSchema, bookDoctorSchema, bookingCancelSchema } from "../validation/bookingValidation.js";

const router = express.Router();

router.post('/book-bed', authMiddleware, validate(bookBedSchema), bookBed);
router.post('/book-appointment', authMiddleware, validate(bookDoctorSchema), bookDoctor);
router.post('/booking-cancel', authMiddleware, validate(bookingCancelSchema), bookingCancel);

export default router;
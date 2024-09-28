import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getDoctors, getHospitals } from "../controller/hospitalController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { getDoctorsSchema, getHospitalsSchema } from "../validation/hospitalValidation.js";

const router = express.Router();

router.post('/get-hospitals', authMiddleware, validate(getHospitalsSchema), getHospitals);
router.post('/get-doctors', authMiddleware, validate(getDoctorsSchema), getDoctors);


export default router;
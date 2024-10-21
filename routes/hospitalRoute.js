import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getDoctors, getHospitalByName, getHospitals } from "../controller/hospitalController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { getDoctorsSchema, getHospitalByNameSchema, getHospitalsSchema } from "../validation/hospitalValidation.js";

const router = express.Router();

router.post('/get-hospitals', authMiddleware, validate(getHospitalsSchema), getHospitals);
router.post('/get-doctors', authMiddleware, validate(getDoctorsSchema), getDoctors);
router.post('/get-hospital-name', authMiddleware, validate(getHospitalByNameSchema), getHospitalByName);


export default router;
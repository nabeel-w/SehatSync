import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getDoctorByName, getPrivateDoctor } from "../controller/doctorController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { getDoctorByNameSchema, getPrivateDoctorSchema } from "../validation/doctorValidation.js";

const router = express.Router();

router.post('/get-clinics', authMiddleware, validate(getPrivateDoctorSchema), getPrivateDoctor);
router.post('/get-doctor-name', authMiddleware, validate(getDoctorByNameSchema), getDoctorByName);

export default router;
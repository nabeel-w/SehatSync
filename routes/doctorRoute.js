import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { getPrivateDoctor } from "../controller/doctorController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { getPrivateDoctorSchema } from "../validation/doctorValidation.js";

const router = express.Router();

router.post('/get-clinics', authMiddleware, validate(getPrivateDoctorSchema), getPrivateDoctor);

export default router;
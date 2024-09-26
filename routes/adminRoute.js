import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import adminMiddleware from "../middleware/adminMiddleware.js"
import { adminSignin } from "../controller/adminAuthController.js";
import { addDoctor, addHospital, getDocNameId, initHospitalBeds, setAppointment, updateAppointment } from "../controller/hospitalController.js";
import { addPrivateClinic, initDoctor } from "../controller/doctorController.js";

const router = express.Router();

router.post('/login', adminSignin);
router.post('/add-hospital', authMiddleware, adminMiddleware, addHospital);
router.post('/add-doctor-to-hospital', authMiddleware, adminMiddleware, addDoctor);
router.post('/init-beds', authMiddleware, adminMiddleware, initHospitalBeds );
router.post('/set-appointment', authMiddleware, adminMiddleware, setAppointment);
router.patch('/update-appointment', authMiddleware, adminMiddleware, updateAppointment);
router.post('/get-doctors-id',authMiddleware, adminMiddleware, getDocNameId);
router.post('/add-doctor',authMiddleware, adminMiddleware, initDoctor);
router.patch('/add-clinic',authMiddleware,adminMiddleware, addPrivateClinic);

export default router;
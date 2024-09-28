import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import adminMiddleware from "../middleware/adminMiddleware.js"
import { adminSignin } from "../controller/adminAuthController.js";
import { addDoctor, addHospital, getBedBookings, getDocNameId, getDoctorBookings, initHospitalBeds, setAppointment, updateAppointment } from "../controller/hospitalController.js";
import { addPrivateClinic, getClinicBookings, initDoctor, updateClinicTiming } from "../controller/doctorController.js";
import { updateBedType } from "../controller/bedController.js";
import { bookingCancel } from "../controller/bookingController.js";

const router = express.Router();

router.post('/login', adminSignin);
router.post('/add-hospital', authMiddleware, adminMiddleware, addHospital);
router.post('/add-doctor-to-hospital', authMiddleware, adminMiddleware, addDoctor);
router.post('/init-beds', authMiddleware, adminMiddleware, initHospitalBeds );
router.post('/set-appointment', authMiddleware, adminMiddleware, setAppointment);
router.patch('/update-appointment', authMiddleware, adminMiddleware, updateAppointment);
router.post('/get-doctors-id', authMiddleware, adminMiddleware, getDocNameId);
router.post('/add-doctor', authMiddleware, adminMiddleware, initDoctor);
router.patch('/add-clinic', authMiddleware, adminMiddleware, addPrivateClinic);
router.patch('/update-timing', authMiddleware, adminMiddleware, updateClinicTiming);
router.patch('/update-bed-type', authMiddleware, adminMiddleware, updateBedType);
router.post('/get-bed-booking', authMiddleware, adminMiddleware, getBedBookings);
router.post('/get-doctor-booking', authMiddleware, adminMiddleware, getDoctorBookings);
router.post('/get-clinic-booking', authMiddleware, adminMiddleware, getClinicBookings);
router.post('/cancel-booking', authMiddleware, adminMiddleware, bookingCancel);

export default router;
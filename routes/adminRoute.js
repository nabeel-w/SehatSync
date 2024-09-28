import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import adminMiddleware from "../middleware/adminMiddleware.js"
import { adminSignin } from "../controller/adminAuthController.js";
import { addDoctor, addHospital, getBedBookings, getDocNameId, getDoctorBookings, initHospitalBeds, setAppointment, updateAppointment } from "../controller/hospitalController.js";
import { addPrivateClinic, getClinicBookings, initDoctor, updateClinicTiming } from "../controller/doctorController.js";
import { updateBedType } from "../controller/bedController.js";
import { bookingCancel } from "../controller/bookingController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { adminSigninSchema } from "../validation/adminAuthValidation.js"
import { addDoctorSchema, addHospitalSchema, getBedBookingsSchema, getDocNameIdSchema, getDoctorBookingsSchema, initHospitalBedsSchema, setAppointmentSchema, updateAppointmentSchema } from "../validation/hospitalValidation.js";
import { addPrivateClinicSchema, getClinicBookingsSchema, initDoctorSchema, updateClinicTimingSchema } from "../validation/doctorValidation.js";
import { updateBedTypeSchema } from "../validation/bedValidation.js";
import { bookingCancelSchema } from "../validation/bookingValidation.js";

const router = express.Router();

router.post('/login', validate(adminSigninSchema), adminSignin);
router.post('/add-hospital', authMiddleware, adminMiddleware, validate(addHospitalSchema),addHospital);
router.post('/add-doctor-to-hospital', authMiddleware, adminMiddleware, validate(addDoctorSchema), addDoctor);
router.post('/init-beds', authMiddleware, adminMiddleware, validate(initHospitalBedsSchema), initHospitalBeds );
router.post('/set-appointment', authMiddleware, adminMiddleware, validate(setAppointmentSchema), setAppointment);
router.patch('/update-appointment', authMiddleware, adminMiddleware, validate(updateAppointmentSchema), updateAppointment);
router.post('/get-doctors-id', authMiddleware, adminMiddleware, validate(getDocNameIdSchema), getDocNameId);
router.post('/add-doctor', authMiddleware, adminMiddleware, validate(initDoctorSchema), initDoctor);
router.patch('/add-clinic', authMiddleware, adminMiddleware, validate(addPrivateClinicSchema), addPrivateClinic);
router.patch('/update-timing', authMiddleware, adminMiddleware, validate(updateClinicTimingSchema), updateClinicTiming);
router.patch('/update-bed-type', authMiddleware, adminMiddleware, validate(updateBedTypeSchema), updateBedType);
router.post('/get-bed-booking', authMiddleware, adminMiddleware, validate(getBedBookingsSchema), getBedBookings);
router.post('/get-doctor-booking', authMiddleware, adminMiddleware, validate(getDoctorBookingsSchema), getDoctorBookings);
router.post('/get-clinic-booking', authMiddleware, adminMiddleware, validate(getClinicBookingsSchema), getClinicBookings);
router.post('/cancel-booking', authMiddleware, adminMiddleware, validate(bookingCancelSchema), bookingCancel);

export default router;
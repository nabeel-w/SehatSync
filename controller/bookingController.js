import Booking from "../model/Booking.js";
import Doctor from "../model/Doctor.js";
import Hospital from "../model/Hospital.js";
import Bed from "../model/Bed.js";
import User from "../model/User.js"
import mongoose from "mongoose";

export const bookBed = async (req, res) => {
    const { hospitalId, bedId, patientName, contactNumber, checkInDate } = req.body;
    const userId = req.user.userId;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newBooking = new Booking({
            patientName,
            patientContact: contactNumber,
            checkInDate,
            hospital: hospitalId,
            bed: bedId,
            bookingType: 'Bed Booking',
            status: 'Pending',
        });
        const bed = await Bed.findOneAndUpdate({ _id: bedId, hospital: hospitalId, status: 'Available' }, { status: 'Occupied', booking: newBooking._id }, { session, new: true });
        const hospital = await Hospital.findOneAndUpdate({ _id: hospitalId, bedsAvailable: { $gt: 0 } }, { $inc: { bedsAvailable: -1 } }, { session, new: true })
        if (!bed || !hospital) {
            return res.status(400).json({ message: 'Bed not available' });
        }
        newBooking.status = 'Confirmed';
        const user = await User.findById(userId).session(session);
        user.Bookings.push(newBooking._id);
        await newBooking.save({ session });
        await user.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'Booking confirmed', newBooking });

    } catch (error) {
        try {
            await session.abortTransaction();
            console.error('Transaction aborted due to error:', error);
        } catch (rollbackError) {
            console.error('Error while aborting transaction:', rollbackError);
        } finally {
            session.endSession();
        }
        return res.status(500).json({ message: 'Server error during Booking bed' });
    }
}

export const bookDoctor = async (req, res) => {
    const { hospitalId, doctorId, patientName, contactNumber, appointmentDate } = req.body;
    const userId = req.user.userId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const bookingObject = hospitalId ? { patientName, patientContact: contactNumber, doctor: doctorId, hospital: hospitalId, appointmentDate, bookingType: 'Doctor Appointment' } :
            { patientName, patientContact: contactNumber, doctor: doctorId, appointmentDate, bookingType: 'Clinic Appointment' };
        const hospitalAppointment = hospitalId ? true : false;
        const newBooking = new Booking(bookingObject);
        const doctor = await Doctor.findById(doctorId).session(session);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor Id Invalid' });
        }
        let maxAppointments, currentAppointments;
        if (hospitalAppointment) {
            const hospitalIndex = doctor.hospital.findIndex(h => h.hospitalId.toString() === hospitalId);
            if (hospitalIndex === -1) {
                return res.status(404).json({ message: 'Hospital Id invalid' });
            }
            maxAppointments = doctor.hospital[hospitalIndex].maxAppointment;
            currentAppointments = doctor.hospital[hospitalIndex].Appointments.length;

            if (currentAppointments >= maxAppointments) {
                return res.status(400).json({ message: 'No available appointment slots in the hospital' });
            }
            doctor.hospital[hospitalIndex].Appointments.push(newBooking._id);
        }
        else {
            maxAppointments = doctor.privateClinic.maxAppointment;
            currentAppointments = doctor.privateClinic.Appointments.length;

            if (currentAppointments >= maxAppointments) {
                return res.status(400).json({ message: 'No available appointment slots in the clinic' });
            }
            doctor.privateClinic.Appointments.push(newBooking._id);
        }
        newBooking.status = 'Confirmed';
        await doctor.save({ session });
        await newBooking.save({ session });
        const user = await User.findById(userId).session(session);
        user.Bookings.push(newBooking._id);
        await user.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'Appointment booked successfully', newBooking });


    } catch (error) {
        try {
            await session.abortTransaction();
            console.error('Transaction aborted due to error:', error);
        } catch (rollbackError) {
            console.error('Error while aborting transaction:', rollbackError);
        } finally {
            session.endSession();
        }

        return res.status(500).json({ message: 'Server error during appointment booking' });
    }
}
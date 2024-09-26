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
        if (!bed) {
            return res.status(400).json({ message: 'Bed not available' });
        }
        newBooking.status = 'Confirmed';
        const user = await User.findById(userId);
        user.Bookings.push(newBooking._id);
        await newBooking.save({ session });
        await user.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'Booking confirmed', newBooking });

    } catch (error) {
        try {
            await Bed.findOneAndUpdate(
                { _id: bedId, status: 'Occupied' }, 
                { status: 'Available' }, 
                { session }
            );
        } catch (unlockError) {
            console.error('Failed to unlock bed:', unlockError);
        }
        await session.abortTransaction();
        session.endSession();
        console.error('Error during Booking bed:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
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
            await session.abortTransaction();
            return res.status(400).json({ message: 'Bed not available' });
        }
        newBooking.status = 'Confirmed';
        // Save new booking and update user bookings in parallel to minimize waiting time.
        const saveBooking = newBooking.save({ session });
        const updateUser = User.findByIdAndUpdate(
            userId,
            { $push: { Bookings: newBooking._id } },
            { session }
        );

        await Promise.all([saveBooking, updateUser]);
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
        // Construct booking object with conditional values.
        const bookingObject = {
            patientName,
            patientContact: contactNumber,
            doctor: doctorId,
            appointmentDate,
            bookingType: hospitalId ? 'Doctor Appointment' : 'Clinic Appointment',
            hospital: hospitalId || null
        };
        const newBooking = new Booking(bookingObject);

        // Fetch only necessary fields of the doctor (using projection).
        const doctor = await Doctor.findById(doctorId, 'hospital privateClinic').session(session);
        if (!doctor) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Doctor Id Invalid' });
        }

        let maxAppointments, currentAppointments;
        let appointmentsFieldPath;

        // Determine whether it's a hospital or clinic appointment.
        if (hospitalId) {
            const hospitalIndex = doctor.hospital.findIndex(h => h.hospitalId.toString() === hospitalId);
            if (hospitalIndex === -1) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Hospital Id invalid' });
            }

            maxAppointments = doctor.hospital[hospitalIndex].maxAppointment;
            currentAppointments = doctor.hospital[hospitalIndex].Appointments.length;
            appointmentsFieldPath = `hospital.${hospitalIndex}.Appointments`;
        } else {
            maxAppointments = doctor.privateClinic.maxAppointment;
            currentAppointments = doctor.privateClinic.Appointments.length;
            appointmentsFieldPath = 'privateClinic.Appointments';
        }

        // Check if there's availability.
        if (currentAppointments >= maxAppointments) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'No available appointment slots' });
        }

        // Push newBooking._id directly into the appointments array in the doctor document.
        await Doctor.updateOne(
            { _id: doctorId },
            { $push: { [appointmentsFieldPath]: newBooking._id } },
            { session }
        );

        newBooking.status = 'Confirmed';

        // Save new booking and update user bookings in parallel to minimize waiting time.
        const saveBooking = newBooking.save({ session });
        const updateUser = User.findByIdAndUpdate(
            userId,
            { $push: { Bookings: newBooking._id } },
            { session }
        );

        await Promise.all([saveBooking, updateUser]);

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
};


export const bookingCancel = async (req, res) => {
    const { bookingId } = req.body;
    const userId = req.user.userId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const booking = await Booking.findById(bookingId, 'bookingType bed doctor hospital').session(session);
        const user = await User.findOne({ Bookings: { $in: [bookingId] } }, '_id').session(session);
        if (!booking || !user) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid Booking Id" });
        }
        else if (user._id.toString() !== userId || req.user.role !== 'Admin') {
            await session.abortTransaction();
            return res.status(404).json({ message: "Booking Access Forbidden" });
        }
        const bookingType = booking.bookingType;
        switch (bookingType) {
            case 'Bed Booking':
                const bed = await Bed.findByIdAndUpdate(booking.bed, { status: 'Available', booking: undefined }, { session, new: true });
                const hospital = await Hospital.findByIdAndUpdate(booking.hospital, { $inc: { bedsAvailable: 1 } }, { session, new: true });
                if (!bed || !hospital) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Invalid Bed Booking' });
                }
                break;
            case 'Clinic Appointment':
                const doctorAppointment = await Doctor.findByIdAndUpdate(booking.doctor, { $pull: { 'privateClinic.Appointments': bookingId } }, { session, new: true });
                if (!doctorAppointment) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: "Invalid Clinic Appointment Booking" });
                }
                break;
            case 'Doctor Appointment':
                const doctor = await Doctor.findOneAndUpdate(
                    {
                        _id: booking.doctor,
                        "hospital.hospitalId": booking.hospital  // Find the specific hospital by hospitalId
                    },
                    {
                        $pull: { "hospital.$.Appointments": bookingId }  // Use the positional `$` operator to filter Appointments within the matched hospital
                    },
                    { session, new: true }
                );
                if (!doctor) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: "Invalid Appointment Booking" });
                }
                break;
            default:
                return res.status(400).json({ message: "Invalid Booking Type" });
        }
        booking.status = 'Cancelled';
        await booking.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Booking Cancelled Successfully" });
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

export const getBookings = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        const bookings = await Booking.find({ _id: { $in: user.Bookings } })
            .select('hospital doctor bed appointmentDate checkInDate bookingType status')
            .populate('hospital', 'name contactNumber address')
            .populate('doctor', 'name specialty contactNumber hospital.hospitalTimings privateClinic')
            .populate('bed', 'ward bedNumber type')
            .exec();

        return res.status(200).json({ bookings: bookings.length ? bookings : [] });
    } catch (error) {
        console.error('Error during fetching Bookings Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
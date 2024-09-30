import Booking from "../model/Booking.js";
import Doctor from "../model/Doctor.js"

export const initDoctor = async (req, res) => {
    const { name, specialtiy, contactNum } = req.body;

    try {
        const found = await Doctor.findOne({ contactNumber: contactNum });
        if (found)
            return res.status(400).json({ message: "Doctor with this contact number exists" });
        const doctor = new Doctor({
            name: name,
            specialty: specialtiy,
            contactNumber: contactNum,
        })
        await doctor.save();
        return res.status(200).json({ message: "Doctor created Successfully", doctor });

    } catch (error) {
        console.error('Error during adding Doctor:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addPrivateClinic = async (req, res) => {
    const { doctorId, clinicName, address, timings, numAppointments } = req.body;

    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor)
            return res.status(400).json({ message: "Invalid Doctor Id" });
        else if (doctor.privateClinic.clinicName !== undefined)
            return res.status(400).json({ message: "Private Clinic Information already exists" });
        const clinic = {
            clinicName: clinicName,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
            },
            clinicTimings: {
                start: timings.start,
                end: timings.end,
            },
            maxAppointment: numAppointments,
        }
        doctor.privateClinic = clinic;
        await doctor.save();

        return res.status(200).json({ message: "Private Clinic Data set succcessfully" });
    } catch (error) {
        console.error('Error during adding Private Clinc:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const updateClinicTiming = async (req, res) => {
    const { doctorId, timings } = req.body;
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor)
            return res.status(400).json({ message: "Invalid Doctor Id" });
        else if (doctor.privateClinic.clinicName === undefined)
            return res.status(400).json({ message: "Private Clinic Information doesn't exists" });
        const clinicTime = {
            start: timings.start,
            end: timings.end,
        }
        doctor.privateClinic.clinicTimings = clinicTime;
        await doctor.save();
        return res.status(200).json({ message: "Private Clinic Data updated succcessfully" });
    } catch (error) {
        console.error('Error during updating Private Clinc:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getPrivateDoctor = async (req, res) => {
    const { city, lastId } = req.body;
    try {
        const limit = 10;
        const query = lastId ? { 'privateClinic.address.city': city, _id: { $gt: lastId } } : { 'privateClinic.address.city': city };
        const doctors = await Doctor.find(query)
            .select('name specialty contactNumber privateClinic _id')
            .limit(limit)
            .sort({ _id: 1 });
        return res.status(200).json({ doctors: doctors.length ? doctors : [] });

    } catch (error) {
        console.error('Error during fetching doctors:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getClinicBookings = async (req, res) => {
    const { doctorId } = req.body;
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor)
            return res.status(400).json({ message: "Invalid Doctor Id" });
        const bookings = await Booking.find({ doctor: doctorId, bookingType: 'Clinic Appointment', status: 'Confirmed' })
            .select('_id patientName patientContact appointmentDate')

        return res.status(200).json({ bookings: bookings.length ? bookings : [] });
    } catch (error) {
        console.error('Error during retrieving Clinic Appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
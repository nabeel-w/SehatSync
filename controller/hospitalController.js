import Hospital from "../model/Hospital.js";
import Doctor from "../model/Doctor.js"
import Bed from "../model/Bed.js";
import Booking from "../model/Booking.js";


export const addHospital = async (req, res) => {
    const { name, phoneNumber, address, totalBeds, emergencyServices } = req.body;

    try {
        const hospitalFound = await Hospital.findOne({ contactNumber: phoneNumber })
        if (hospitalFound)
            return res.status(400).json({ message: "Hospital Already Exists" })
        const hospital = new Hospital({
            name: name,
            contactNumber: phoneNumber,
            address: address,
            totalBeds: totalBeds,
            emergencyServices: emergencyServices,
        });

        await hospital.save();
        return res.status(201).json({ message: 'Hospital Added Successfully' })
    }
    catch (error) {
        console.error('Error during adding Hospital:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addDoctor = async (req, res) => {
    const { doctorId, hospitalId, timing, numAppointments } = req.body;

    try {
        const hospital = await Hospital.findById(hospitalId);
        const doctor = await Doctor.findById(doctorId);

        const hospitalData = { hospitalId: hospitalId, hospitalTimings: timing, maxAppointment: numAppointments };

        if (!hospital || !doctor)
            return res.status(400).json({ message: "Invalid Hospital or Doctor ID" });
        if (hospital.doctors.includes(doctor._id) || doctor.hospital.some((_) => _.hospitalId.toString() === hospitalId))
            return res.status(400).json({ message: "Doctor is already associated with this hospital" });

        hospital.doctors.push(doctor._id);
        doctor.hospital.push(hospitalData);
        await hospital.save();
        await doctor.save();

        return res.status(201).json({ message: "Doctor added susccessfully" })

    } catch (error) {
        console.error('Error during updating Hospital Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const initHospitalBeds = async (req, res) => {
    const { hospitalId, wardData } = req.body;

    try {
        const hospitalExists = await Hospital.exists({ _id: hospitalId });
        if (!hospitalExists) {
            return res.status(400).json({ message: "Invalid Hospital ID" });
        }
        const bedsFound = await Bed.find({ hospital: hospitalId })
        if (bedsFound.length !== 0)
            return res.status(400).json({ message: "Hospital Beds Data already Exists" });

        const bedsToCreate = [];
        wardData.forEach(ward => {
            for (let i = 0; i < ward.numBed; i++) {
                bedsToCreate.push({
                    hospital: hospitalId,
                    ward: ward.name,
                    bedNumber: i + 1,
                });
            }
        });

        await Bed.insertMany(bedsToCreate);
        return res.status(201).json({ message: "Beds added susccessfully" })
    } catch (error) {
        console.error('Error during updating Hospital Bed Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getHospitals = async (req, res) => {
    const { city, emergency, lastId } = req.body

    try {
        const limit = 10;
        const query = lastId ? { emergencyServices: emergency, 'address.city': city, bedsAvailable: { $gt: 0 }, _id: { $gt: lastId } } : { emergencyServices: emergency, 'address.city': city, bedsAvailable: { $gt: 0 } }
        const hospitals = await Hospital.find(query)
            .select('name address contactNumber bedsAvailable _id')
            .limit(limit)
            .sort({ _id: 1 })
        return res.status(200).json({ hospitals: hospitals.length ? hospitals : [] });

    } catch (error) {
        console.error('Error during fetching hospital Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const setAppointment = async (req, res) => {
    const { hospitalId, appointmentTime, numAppointments, docterId } = req.body;

    try {
        const doctor = await Doctor.findById(docterId);
        if (!doctor)
            return res.status(400).json({ message: "Invalid Doctor ID" });
        else if (doctor.hospital.some(h => h.hospitalId.toString() === hospitalId))
            return res.status(400).json({ message: "Hospital Timing Already Exists" });
        else {
            const hospitalData = {
                hospitalId: hospitalId,
                hospitalTimings: {
                    start: appointmentTime.start,
                    end: appointmentTime.end,
                },
                maxAppointment: numAppointments,
            }
            doctor.hospital.push(hospitalData);
            await doctor.save();

            return res.status(200).json({ message: "Appointment Data set successfully" });
        }
    } catch (error) {
        console.error('Error during updating hospital appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const updateAppointment = async (req, res) => {
    const { hospitalId, appointmentTime, numAppointments, docterId } = req.body;

    try {
        const doctor = await Doctor.findById(docterId);
        if (!doctor)
            return res.status(400).json({ message: "Invalid Doctor ID" });
        const hospitalIndex = doctor.hospital.findIndex(h => h.hospitalId.equals(hospitalId));
        if (hospitalIndex === -1)
            return res.status(400).json({ message: "Hospital Timing doesn't Exists" });
        else {
            doctor.hospital[hospitalIndex].hospitalTimings = { start: appointmentTime.start, end: appointmentTime.end };
            doctor.hospital[hospitalIndex].maxAppointment = numAppointments;

            await doctor.save();
            return res.status(200).json({ message: "Appointment Data updated successfully" });
        }

    } catch (error) {
        console.error('Error during updating hospital appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getDoctors = async (req, res) => {
    const { hospitalId } = req.body;

    try {
        const hospital = await Hospital.findById(hospitalId);
        const doctors = [];
        if (!hospital)
            return res.status(400).json({ message: "Invalid Hopsital Id" });
        else if (hospital.doctors.length === 0)
            return res.status(400).json({ message: "No Doctors Found" });
        hospital.doctors.forEach(async d => {
            const doc = await Doctor.findById(d).select('_id name specialty contactNumber hospital');
            doctors.push(doc);
        });
        return res.status(200).json({ doctors });

    } catch (error) {
        console.error('Error during retrieving doctors Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getDocNameId = async (req, res) => {
    const { hospitalId } = req.body;

    try {
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital)
            return res.status(400).json({ message: "Invalid Hopsital Id" });
        const doctors = await Doctor.find({ 'hospital.hospitalId': { $ne: hospitalId } }).select('_id name specialty contactNumber');
        return res.status(200).json({ doctors: doctors.length ? doctors : [] });

    } catch (error) {
        console.error('Error during retrieving doctors Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getBedBookings = async (req, res) => {
    const { hospitalId } = req.body;
    try {
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital)
            return res.status(400).json({ message: "Invalid Hopsital Id" });
        const bookings = await Booking.find({ hospital: hospitalId, bookingType: 'Bed Booking', status: 'Confirmed' })
            .select('_id patientName patientContact bed checkInDate');
        return res.status(200).json({ bookings: bookings.length ? bookings : [] });

    } catch (error) {
        console.error('Error during retrieving Bed Booking Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getDoctorBookings = async (req, res) =>{
    const { hospitalId, doctorId } = req.body;
    try {
        const hospital = await Hospital.findById(hospitalId);
        const doctor = await Doctor.findById(doctorId);
        if (!hospital || !doctor)
            return res.status(400).json({ message: "Invalid Hopsital OR Doctor Id" });
        const bookings = await Booking.find({ hospital: hospitalId, doctor: doctorId, bookingType: 'Doctor Appointment', status: 'Confirmed' })
        .select('_id patientName patientContact doctor appointmentDate');

        return res.status(200).json({ bookings: bookings.length ? bookings : [] });
    } catch (error) {
        console.error('Error during retrieving Doctor Appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
import Hospital from "../model/Hospital.js";
import Doctor from "../model/Doctor.js"
import Bed from "../model/Bed.js";
import mongoose from "mongoose";

export const addHospital = async (req, res) => {
    const { name, phoneNumber, address, totalBeds, emergencyServices } = req.body;

    if (!name || !phoneNumber || !address || !totalBeds || emergencyServices === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
    }

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

    if (!doctorId || !hospitalId || !timing || !numAppointments) {
        return res.status(400).json({ message: 'All fields are required' });
    }

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

    if (!hospitalId || !wardData) {
        return res.status(400).json({ message: 'All fields are required' });
    }

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

    if (!city || emergency === undefined)
        return res.status(400).json({ message: 'Some Params are missing' });

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

export const setAppointment = async (req,res)=>{
    const { hospitalId, appointmentTime, numAppointments, docterId } = req.body;

    try {
        const doctor= await Doctor.findById(docterId);
        if(!doctor)
            return res.status(400).json({ message: "Invalid Doctor ID" });
        else if(doctor.hospital.some(h=>h.hospitalId.toString() === hospitalId))
            return res.status(400).json({message: "Hospital Timing Already Exists"});
        else{
            const hospitalData = {
                hospitalId: new mongoose.Types.ObjectId(hospitalId),
                hospitalTimings: {
                    start: appointmentTime.start,
                    end: appointmentTime.end,
                },
                maxAppointment: numAppointments,
            }
            doctor.hospital.push(hospitalData);
            await doctor.save();

            return res.status(200).json({message: "Appointment Data set successfully"});
        }
    } catch (error) {
        console.error('Error during updating hospital appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const updateAppointment = async (req,res)=>{
    const { hospitalId, appointmentTime, numAppointments, docterId } = req.body;

    try {
        const doctor= await Doctor.findById(docterId);
        if(!doctor)
            return res.status(400).json({ message: "Invalid Doctor ID" });
        const hospitalIndex = doctor.hospital.findIndex(h => h.hospitalId.equals(hospitalId));
        if(hospitalIndex === -1)
            return res.status(400).json({message: "Hospital Timing doesn't Exists"});
        else{
            doctor.hospital[hospitalIndex].hospitalTimings = { start: appointmentTime.start, end: appointmentTime.end };
            doctor.hospital[hospitalIndex].maxAppointment = numAppointments;

            await doctor.save();
            return res.status(200).json({message: "Appointment Data updated successfully"});
        }
        
    } catch (error) {
        console.error('Error during updating hospital appointment Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
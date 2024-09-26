import Doctor from "../model/Doctor.js"

export const initDoctor = async (req, res) =>{
    const { name, specialtiy, contactNum } = req.body;

    try {
        const found = await Doctor.findOne({ contactNumber: contactNum });
        if(found)
            return res.status(400).json({ message: "Doctor with this contact number exists" });
        const doctor = new Doctor({
            name: name,
            specialty: specialtiy,
            contactNumber: contactNum,
        })
        await doctor.save();
        return res.status(200).json({ message: "Doctor created Successfully" });
        
    } catch (error) {
        console.error('Error during adding Doctor:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addPrivateClinic = async (req, res) =>{
    const { doctorId, clinicName, address, timings, numAppointments  } = req.body;

    try {
        const doctor = await Doctor.findById(doctorId);
        if(!doctor)
            return res.status(400).json({ message: "Invalid Doctor Id" });
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
            maxAppointment : numAppointments,
        }
        doctor.privateClinic= clinic;
        await doctor.save();
        
        return res.status(200).json({ message: "Private Clinic Data set succcessfully" });
    } catch (error) {
        console.error('Error during adding Private Clinc:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
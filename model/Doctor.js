import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialty: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    hospital: [{
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: false,
        },
        hospitalTimings: {
            start: { type: String }, // Example: '09:00 AM'
            end: { type: String },   // Example: '01:00 PM'
        },
        maxAppointment: { type: Number },
    }],
    privateClinic: {
        clinicName: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
        },
        clinicTimings: {
            start: { type: String }, // Example: '02:00 PM'
            end: { type: String },   // Example: '06:00 PM'
        },
        maxAppointment: { type: Number },
    },
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

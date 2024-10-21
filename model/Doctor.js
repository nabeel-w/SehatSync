import mongoose from 'mongoose';
import axios from 'axios';
import { config } from 'dotenv';
config();

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
        unique: true,
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
        Appointments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    }],
    privateClinic: {
        clinicName: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
            lat: { type: Number, required: false },
            lng: { type: Number, required: false },
        },
        clinicTimings: {
            start: { type: String }, // Example: '02:00 PM'
            end: { type: String },   // Example: '06:00 PM'
        },
        maxAppointment: { type: Number },
        Appointments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    },
}, { timestamps: true });

doctorSchema.pre('save', async function (next) {
    const doctor = this;
    
    if (!doctor.isModified('privateClinic.address')) {
      return next();
    }
  
    try {
      const apiKey = process.env.GEOENCODING_API_KEY;
      const clinicAddress = `${doctor.privateClinic.address.street},${doctor.privateClinic.address.city},${doctor.privateClinic.address.state}`
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(clinicAddress)}&key=${apiKey}`;
      
      const response = await axios.get(geocodeUrl);
      const data = response.data;
  
      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        doctor.privateClinic.address.lat = location.lat;
        doctor.privateClinic.address.lng = location.lng;
      } else {
        return next(new Error(`Geocoding failed: ${data.status}`));
      }
      
      next();
    } catch (error) {
      return next(error);
    }
  });

doctorSchema.index({ name: 1 });
doctorSchema.index({ 'privateClinic.address.city': 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

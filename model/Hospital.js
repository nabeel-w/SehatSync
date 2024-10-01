import mongoose from 'mongoose';
import axios from 'axios';
import { config } from 'dotenv';
config();

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  contactNumber: {
    type: String,
    required: true,
    unique: true
  },
  totalBeds: {
    type: Number,
    required: true,
  },
  bedsAvailable: {
    type: Number,
    default: function (){
      return this.totalBeds;
    },
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  }],
  emergencyServices: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

hospitalSchema.pre('save', async function (next) {
  const hospital = this;
  
  if (!hospital.isModified('address')) {
    return next();
  }

  try {
    const apiKey = process.env.GEOENCODING_API_KEY;
    const hospitalAddresss = `${hospital.address.street},${hospital.address.city},${hospital.address.state}`
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(hospitalAddresss)}&key=${apiKey}`;
    
    const response = await axios.get(geocodeUrl);
    const data = response.data;

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      hospital.address.lat = location.lat;
      hospital.address.lng = location.lng;
    } else {
      return next(new Error(`Geocoding failed: ${data.status}`));
    }
    
    next();
  } catch (error) {
    return next(error);
  }
});


const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;

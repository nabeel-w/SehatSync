import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    patientName: {
      type: String,
      required: true,
    },
    patientContact: {
      type: String,
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['Doctor Appointment', 'Bed Booking', 'Clinic Appointment'],
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: function () {
        return this.bookingType === 'Doctor Appointment' || this.bookingType === 'Clinic Appointment';
      },
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: function () {
        return this.bookingType === 'Doctor Appointment' || this.bookingType === 'Bed Booking';
      },
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      required: function () {
        return this.bookingType === 'Bed Booking';
      },
    },
    appointmentDate: {
      type: Date,
      required: function () {
        return this.bookingType === 'Doctor Appointment' || this.bookingType === 'Clinic Appointment';
      },
    },
    checkInDate: {
      type: Date,
      required: function () {
        return this.bookingType === 'Bed Booking';
      },
    },
    checkOutDate: {
        type: Date,
    }, // Optional, only for bed bookings
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Visited'],
      default: 'Pending',
    },
  }, { timestamps: true });
  
  const Booking = mongoose.model('Booking', bookingSchema);
  export default Booking;
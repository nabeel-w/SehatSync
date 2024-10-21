import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  ward: {
    type: String,
    enum: ['ICU', 'General', 'Pediatrics'],
    required: true,
  },
  bedNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['General', 'ICU', 'Ventilator', 'Private', 'Semi-Private'], // Different types of beds available
    required: true,
    default: 'General',
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Available',
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: function () {
        return this.status==='Occupied';
    }
  },
}, { timestamps: true });

bedSchema.index({ hospital: 1 });
bedSchema.index({ status: 1 });

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;

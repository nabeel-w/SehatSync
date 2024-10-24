import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true  },
  email: { type: String, required: true, unique: true },
  password : { type:String },
  name: { type: String, required: true },
  picture: { type: String },
  refreshToken: { type: String },
  role : { type: String, enum: ['User', 'Admin'], default: 'User', required: true },
  Bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ Bookings: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
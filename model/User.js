import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true  },
  email: { type: String, required: true, unique: true },
  password : { type:String },
  name: { type: String, required: true },
  picture: { type: String },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
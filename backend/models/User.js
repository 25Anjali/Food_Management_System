import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  contactNumber: { type: String },
  address: { type: String },
  organizationName: { type: String }, // Optional for NGOs/Collectors
  latitude: { type: Number },
  longitude: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);

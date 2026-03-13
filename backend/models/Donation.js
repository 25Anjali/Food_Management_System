import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  foodName: { type: String, required: true },
  quantity: { type: String, required: true }, // e.g., '10 kg', '50 meals'
  estimatedCost: { type: Number },
  preparationTime: { type: String },
  notes: { type: String },
  location: { type: String, required: true }, // address string
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  expiryTime: { type: Date, required: true },
  contactInfo: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'requested', 'accepted-by-collector', 'accepted', 'rejected', 'in-transit', 'collected', 'delivered'], 
    default: 'pending' 
  },
  isCostAgreed: { type: Boolean, default: false },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

donationSchema.index({ latitude: 1, longitude: 1 });


export default mongoose.model('Donation', donationSchema);

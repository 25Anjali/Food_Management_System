import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Claim', claimSchema);

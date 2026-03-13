import express from 'express';
import { protect, ngosMode } from '../middleware/auth.js';
import Claim from '../models/Claim.js';
import Donation from '../models/Donation.js';

const router = express.Router();

// NGO claims a donation
router.post('/', protect, ngosMode, async (req, res) => {
  try {
    const { donationId, notes } = req.body;
    
    const donation = await Donation.findById(donationId);
    if (!donation || donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation not available' });
    }

    const newClaim = new Claim({
      donation: donationId,
      ngo: req.user._id,
      notes,
      status: 'approved' // Automatically approved for simplicity, or could be 'pending' for donor to approve
    });

    const savedClaim = await newClaim.save();
    
    // Update donation status
    donation.status = 'claimed';
    await donation.save();

    res.status(201).json(savedClaim);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get NGO's claims
router.get('/my', protect, ngosMode, async (req, res) => {
  try {
    const claims = await Claim.find({ ngo: req.user._id }).populate('donation');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all claims (admin or stats view)
router.get('/', protect, async (req, res) => {
  try {
    const claims = await Claim.find().populate('donation').populate('ngo', 'name email');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

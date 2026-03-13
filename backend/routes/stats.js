import express from 'express';
import { protect, adminMode } from '../middleware/auth.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Claim from '../models/Claim.js';

const router = express.Router();

router.get('/', protect, adminMode, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const activeDonors = await User.countDocuments({ role: 'donor' });
    const activeNGOs = await User.countDocuments({ role: 'ngo' });

    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const activeDonations = await Donation.countDocuments({ status: { $in: ['accepted', 'in-transit'] } });
    const collectedDonations = await Donation.countDocuments({ status: { $in: ['collected', 'delivered'] } });
    
    const totalClaims = await Claim.countDocuments();

    res.json({
      usersCount,
      activeDonors,
      activeNGOs,
      donations: {
        total: totalDonations,
        pending: pendingDonations,
        active: activeDonations,
        collected: collectedDonations
      },
      totalClaims
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint to get all users for admin
router.get('/users', protect, adminMode, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

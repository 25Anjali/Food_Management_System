import express from 'express';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protect, adminMode } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/users', protect, adminMode, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all donations with details (Admin only)
router.get('/donations', protect, adminMode, async (req, res) => {
  try {
    const donations = await Donation.find({})
      .populate('donor', 'name email contactNumber')
      .populate('collector', 'name email contactNumber organizationName');
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System Analytics (Admin only)
router.get('/analytics', protect, adminMode, async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.find({ status: 'delivered' });
    
    const foodSaved = completedDonations.length;
    const totalValue = completedDonations.reduce((acc, curr) => acc + (Number(curr.estimatedCost) || 0), 0);

    res.json({
      totalDonations,
      foodSaved,
      totalValue,
      totalUsers: await User.countDocuments(),
      totalNGOs: await User.countDocuments({ role: 'ngo' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

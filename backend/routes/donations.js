import express from 'express';
import jwt from 'jsonwebtoken';
import { protect, donorMode } from '../middleware/auth.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';

const router = express.Router();

// Get all available donations (with optional awareness of requested donations)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius, location } = req.query;
    
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore token error for public route
      }
    }

    let query = {
      $or: [
        { status: 'pending' }
      ]
    };

    if (userId) {
      query.$or.push({ status: 'requested', collector: userId });
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    } else if (lat && lng) {
      const radiusInKm = radius ? parseFloat(radius) : 10;
      const degPerKm = 1 / 111;
      query.latitude = { $gte: parseFloat(lat) - radiusInKm * degPerKm, $lte: parseFloat(lat) + radiusInKm * degPerKm };
      query.longitude = { $gte: parseFloat(lng) - radiusInKm * degPerKm, $lte: parseFloat(lng) + radiusInKm * degPerKm };
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name email contactNumber')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create donation
router.post('/', protect, donorMode, async (req, res) => {
  try {
    const newDonation = new Donation({ ...req.body, donor: req.user._id, status: 'pending' });
    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's donations (Donor or Collector)
router.get('/my', protect, async (req, res) => {
  try {
    const query = req.user.role === 'donor' 
      ? { donor: req.user._id } 
      : { collector: req.user._id };
    
    const donations = await Donation.find(query)
      .populate('donor', 'name email contactNumber address')
      .populate('collector', 'name email contactNumber organizationName');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept a donation (for NGOs/Collectors)
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const { isCostAgreed } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    
    // Can accept if pending OR if specifically requested from them
    const isRequestedForMe = donation.status === 'requested' && donation.collector?.toString() === req.user._id.toString();
    if (donation.status !== 'pending' && !isRequestedForMe) {
      return res.status(400).json({ message: 'Donation not available' });
    }

    donation.collector = req.user._id;
    donation.status = 'accepted-by-collector';
    donation.isCostAgreed = isCostAgreed || false;
    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject a donation (for NGOs/Collectors when requested)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    
    if (donation.collector?.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    donation.status = 'rejected';
    donation.collector = null; // Free up for others or allow donor to re-assign
    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Confirm a collector (for Donors)
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    
    if (donation.donor.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    if (donation.status !== 'accepted-by-collector') {
       return res.status(400).json({ message: 'No collector has accepted this yet' });
    }

    donation.status = 'accepted';
    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update donation status (Donor or Collector)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Authorization check
    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isCollector = donation.collector && donation.collector.toString() === req.user._id.toString();

    if (!isDonor && !isCollector && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    donation.status = status;
    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get available collectors
router.get('/collectors/near', protect, async (req, res) => {
  try {
    const collectors = await User.find({ role: 'ngo' })
      .select('name organizationName contactNumber latitude longitude location address');

    res.json(collectors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign a collector to a donation (Donor initiated invitation)
router.put('/:id/assign', protect, async (req, res) => {
  try {
    const { collectorId } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    donation.collector = collectorId;
    donation.status = 'requested';
    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

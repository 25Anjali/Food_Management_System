import express from 'express';
import Message from '../models/Message.js';
import Donation from '../models/Donation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { donationId, content } = req.body;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is either the donor or the collector
    if (donation.donor.toString() !== req.user._id.toString() && 
        (!donation.collector || donation.collector.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to send message for this donation' });
    }

    const message = await Message.create({
      donation: donationId,
      sender: req.user._id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a donation
router.get('/:donationId', protect, async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is either the donor or the collector
    if (donation.donor.toString() !== req.user._id.toString() && 
        (!donation.collector || donation.collector.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    const messages = await Message.find({ donation: donationId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

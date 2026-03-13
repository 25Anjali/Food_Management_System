import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, contactNumber, address } = req.body;
    
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, password: hashedPassword, role, contactNumber, address
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Update user profile (including location)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address || user.address;
      user.organizationName = req.body.organizationName || user.organizationName;
      user.latitude = req.body.latitude || user.latitude;
      user.longitude = req.body.longitude || user.longitude;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        token: generateToken(updatedUser._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get public profile (for NGOs/Collectors)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name organizationName contactNumber address role createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

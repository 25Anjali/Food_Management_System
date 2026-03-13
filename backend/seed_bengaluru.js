import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Donation from './models/Donation.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-waste-mgmt';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing dummy data if needed (optional - skipping to be safe)
    
    const pwd = await bcrypt.hash('password123', 10);

    // Seed NGOs
    const ngos = [
      {
        name: 'Indiranagar Food Bank',
        email: 'ngo.indira@test.com',
        password: pwd,
        role: 'ngo',
        organizationName: 'Indiranagar Relief',
        contactNumber: '9111111111',
        address: '100 Feet Rd, Indiranagar, Bengaluru',
        latitude: 12.9784,
        longitude: 77.6408
      },
      {
        name: 'Koramangala Community Kitchen',
        email: 'ngo.kora@test.com',
        password: pwd,
        role: 'ngo',
        organizationName: 'Koramangala Helpers',
        contactNumber: '9222222222',
        address: '80 Feet Rd, Koramangala 4th Block, Bengaluru',
        latitude: 12.9344,
        longitude: 77.6244
      },
      {
        name: 'Whitefield Food Center',
        email: 'ngo.white@test.com',
        password: pwd,
        role: 'ngo',
        organizationName: 'Whitefield Charity',
        contactNumber: '9333333333',
        address: 'Whitefield Main Rd, Bengaluru',
        latitude: 12.9698,
        longitude: 77.7500
      }
    ];

    for (const ngo of ngos) {
      await User.findOneAndUpdate({ email: ngo.email }, ngo, { upsert: true });
    }
    console.log('NGOs seeded.');

    // Seed a Donor to own the donations
    const donor = await User.findOneAndUpdate(
      { email: 'donor.blr@test.com' },
      { 
        name: 'Bengaluru Donor', 
        email: 'donor.blr@test.com', 
        password: pwd, 
        role: 'donor',
        contactNumber: '9000000000'
      },
      { upsert: true, new: true }
    );

    // Seed Donations
    const donations = [
      {
        donor: donor._id,
        foodName: 'Yelachenahalli Relief Meals',
        foodType: 'Veg Meals',
        quantity: '50 units',
        estimatedCost: 2500,
        location: 'Yelachenahalli Metro, Bengaluru',
        latitude: 12.8953,
        longitude: 77.5750,
        status: 'pending',
        contactInfo: '123-456-7890',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'Jayanagar Excess Snacks',
        foodType: 'Snacks',
        quantity: '20 kg',
        estimatedCost: 1500,
        location: '4th Block, Jayanagar, Bengaluru',
        latitude: 12.9279,
        longitude: 77.5824,
        status: 'pending',
        contactInfo: '123-456-7890',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'MG Road Corporate Lunch',
        foodType: 'North Indian',
        quantity: '100 units',
        estimatedCost: 5000,
        location: 'MG Road, Bengaluru',
        latitude: 12.9756,
        longitude: 77.6067,
        status: 'pending',
        contactInfo: '999-888-7777',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'Malleshwaram Temple Prasad',
        foodType: 'South Indian',
        quantity: '30 kg',
        estimatedCost: 2000,
        location: 'Malleshwaram, Bengaluru',
        latitude: 12.9988,
        longitude: 77.5714,
        status: 'pending',
        contactInfo: '888-777-6666',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'Electronic City Tech Buffet',
        foodType: 'Multi-cuisine',
        quantity: '80 units',
        estimatedCost: 6000,
        location: 'Phase 1, Electronic City, Bengaluru',
        latitude: 12.8452,
        longitude: 77.6632,
        status: 'pending',
        contactInfo: '777-666-5555',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'Banashankari Bakery Excess',
        foodType: 'Bakery Items',
        quantity: '15 units',
        estimatedCost: 1000,
        location: 'Banashankari 3rd Stage, Bengaluru',
        latitude: 12.9250,
        longitude: 77.5467,
        status: 'pending',
        contactInfo: '666-555-4444',
        expiryTime: new Date(Date.now() + 86400000)
      },
      {
        donor: donor._id,
        foodName: 'HSR Layout Event Leftover',
        foodType: 'North Indian',
        quantity: '40 meals',
        estimatedCost: 4000,
        location: 'Sector 2, HSR Layout, Bengaluru',
        latitude: 12.9128,
        longitude: 77.6388,
        status: 'pending',
        contactInfo: '555-444-3333',
        expiryTime: new Date(Date.now() + 86400000)
      }
    ];

    await Donation.deleteMany({ donor: donor._id }); // Refresh donations for this donor
    await Donation.insertMany(donations);
    console.log('Donations seeded.');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

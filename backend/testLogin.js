#!/usr/bin/env node

// Script to test login functionality
// Usage: node testLogin.js <email> <password>

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const { generateToken } = require('./middleware/auth');

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide email and password');
  console.log('Usage: node testLogin.js <email> <password>');
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Test login
const testLogin = async () => {
  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log('User found:', user.name);
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (isMatch) {
      const token = generateToken(user._id);
      console.log('Login successful!');
      console.log('Token:', token);
    } else {
      console.log('Login failed: Invalid password');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error during login test:', error.message);
    process.exit(1);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await testLogin();
  mongoose.connection.close();
};

run();
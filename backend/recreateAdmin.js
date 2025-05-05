const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Create admin user
const recreateAdmin = async () => {
  try {
    // First check if admin already exists
    const existingAdmin = await User.findOne({ username: 'devmac' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Deleting existing admin...');
      await User.deleteOne({ username: 'devmac' });
      console.log('Existing admin deleted.');
    }
    
    // Create new admin with plain text password (will be hashed by the pre-save hook)
    const admin = await User.create({
      username: 'devmac',
      email: 'admin@portfolio.com',
      password: 'devmac12',
      role: 'admin'
    });
    
    console.log('Admin user created successfully:', admin.username);
    
    // Verify the admin user was created
    const verifyAdmin = await User.findOne({ username: 'devmac' });
    console.log('Admin user verified:', verifyAdmin ? 'Yes' : 'No');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
recreateAdmin();

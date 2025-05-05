const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Test login function
const testLogin = async () => {
  try {
    const username = 'devmac';
    const password = 'devmac12';
    
    console.log(`Testing login with username: ${username}, password: ${password}`);
    
    // Find the user
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      console.error('User not found in database');
      process.exit(1);
    }
    
    console.log('User found:', {
      id: user._id,
      username: user.username,
      passwordHash: user.password.substring(0, 15) + '...',
      role: user.role
    });
    
    // Test password match
    console.log('Testing password match...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('Login test successful!');
    } else {
      console.error('Login test failed: Password does not match');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error in testLogin:', error);
    process.exit(1);
  }
};

// Run the function
testLogin();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Create admin user with pre-hashed password
const createAdminWithHash = async () => {
  try {
    // This is a pre-hashed version of 'devmac12' using bcrypt
    const hashedPassword = '$2a$10$rrCvVeuB2aDpQDwSJUxg6.mIId7iCVG0xjM9TJ.9d5.4qTK6F8eLe';
    
    // Delete any existing admin users
    await mongoose.connection.collection('users').deleteMany({ username: 'devmac' });
    console.log('Deleted any existing admin users');
    
    // Insert new admin user directly into the collection
    await mongoose.connection.collection('users').insertOne({
      username: 'devmac',
      email: 'admin@portfolio.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('Admin user created successfully with username: devmac and password: devmac12');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdminWithHash();

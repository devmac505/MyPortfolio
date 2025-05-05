const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Force create admin user
const forceCreateAdmin = async () => {
  try {
    console.log('Starting admin user creation process...');
    
    // Delete any existing admin users
    const deleteResult = await mongoose.connection.collection('users').deleteMany({ username: 'devmac' });
    console.log('Delete result:', deleteResult);
    
    // Generate password hash
    console.log('Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('devmac12', salt);
    console.log('Password hash generated:', hashedPassword);
    
    // Insert new admin user directly
    const insertResult = await mongoose.connection.collection('users').insertOne({
      username: 'devmac',
      email: 'admin@portfolio.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('Insert result:', insertResult);
    console.log('Admin user created successfully with username: devmac and password: devmac12');
    
    // Verify the admin was created
    const admin = await mongoose.connection.collection('users').findOne({ username: 'devmac' });
    console.log('Admin user verification:', admin ? 'Success' : 'Failed');
    if (admin) {
      console.log('Admin details:', {
        id: admin._id,
        username: admin.username,
        passwordHash: admin.password.substring(0, 15) + '...',
        role: admin.role
      });
      
      // Test password match
      const isMatch = await bcrypt.compare('devmac12', admin.password);
      console.log('Password match test:', isMatch ? 'Success' : 'Failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error in forceCreateAdmin:', error);
    process.exit(1);
  }
};

// Run the function
forceCreateAdmin();

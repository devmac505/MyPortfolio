const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Create default admin user if none exists
exports.createDefaultAdminIfNone = async () => {
  try {
    // First, try to find the admin user
    const existingAdmin = await User.findOne({ username: 'devmac' });

    // If admin exists, delete it to ensure we have a fresh admin
    if (existingAdmin) {
      console.log('Admin user found. Recreating to ensure correct credentials...');
      await User.deleteOne({ username: 'devmac' });
    } else {
      console.log('No admin users found. Creating default admin user...');
    }

    // Create new admin user
    await User.create({
      username: 'devmac',
      email: 'admin@portfolio.com',
      password: 'devmac12',
      role: 'admin'
    });

    console.log('Default admin user created successfully');

    // Verify the admin was created
    const verifyAdmin = await User.findOne({ username: 'devmac' });
    if (verifyAdmin) {
      console.log('Admin user verified in database');
    } else {
      console.error('Failed to verify admin user in database');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log(`Login attempt: username=${username}, password=${password}`);

    // Validate input
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide username and password'
      });
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      console.log(`Login failed: User '${username}' not found`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials - User not found'
      });
    }

    console.log(`User found: ${user.username}, ID: ${user._id}`);

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`Login failed: Password does not match for user '${username}'`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials - Password incorrect'
      });
    }

    // Create token
    const token = generateToken(user);
    console.log(`Login successful: Token generated for user '${username}'`);

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Register user (admin only)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    // Create token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

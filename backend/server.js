const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files
const path = require('path');
const rootDir = path.join(__dirname, '..');
console.log('Serving static files from:', rootDir);
console.log('Images directory:', path.join(rootDir, 'images'));

// Serve the root directory
app.use(express.static(rootDir));

// Serve images directory explicitly
app.use('/images', express.static(path.join(rootDir, 'images')));

// Add a route to check if images are accessible
app.get('/check-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(rootDir, 'images', filename);

  if (require('fs').existsSync(imagePath)) {
    res.send({ exists: true, path: imagePath });
  } else {
    res.send({ exists: false, path: imagePath });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Create default admin user
const { createDefaultAdminIfNone } = require('./controllers/authController');
createDefaultAdminIfNone();

// Import routes
console.log('Importing routes...');
let toolsRoutes, servicesRoutes, projectsRoutes, skillsRoutes, notesRoutes, authRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  console.log('Imported auth routes');
} catch (err) {
  console.error('Error importing auth routes:', err);
}

try {
  toolsRoutes = require('./routes/tools');
  console.log('Imported tools routes');
} catch (err) {
  console.error('Error importing tools routes:', err);
}

try {
  servicesRoutes = require('./routes/services');
  console.log('Imported services routes');
} catch (err) {
  console.error('Error importing services routes:', err);
}

try {
  projectsRoutes = require('./routes/projects');
  console.log('Imported projects routes');
} catch (err) {
  console.error('Error importing projects routes:', err);
}

try {
  skillsRoutes = require('./routes/skills');
  console.log('Imported skills routes');
} catch (err) {
  console.error('Error importing skills routes:', err);
}

try {
  notesRoutes = require('./routes/notes');
  console.log('Imported notes routes');
} catch (err) {
  console.error('Error importing notes routes:', err);
}

// Use routes
console.log('Setting up API routes...');
if (authRoutes) {
  console.log('Registering auth routes at /api/auth');
  app.use('/api/auth', authRoutes);
} else {
  console.log('Auth routes not available');
}
if (toolsRoutes) app.use('/api/tools', toolsRoutes);
if (servicesRoutes) app.use('/api/services', servicesRoutes);
if (projectsRoutes) app.use('/api/projects', projectsRoutes);
if (skillsRoutes) app.use('/api/skills', skillsRoutes);
if (notesRoutes) app.use('/api/notes', notesRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Portfolio API is running');
});

// Debug routes
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug route is working',
    routes: {
      auth: !!authRoutes,
      tools: !!toolsRoutes,
      services: !!servicesRoutes,
      projects: !!projectsRoutes,
      skills: !!skillsRoutes,
      notes: !!notesRoutes
    }
  });
});

// Direct auth test route
app.post('/api/direct-auth-test', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Direct auth test:', { username, password });

    const User = require('./models/User');
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Password does not match'
      });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Direct auth test error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Direct notes route for testing
app.get('/api/test-notes', async (req, res) => {
  try {
    const Note = require('./models/Note');
    const notes = await Note.find().sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Error in test-notes route:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

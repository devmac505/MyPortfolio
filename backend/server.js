const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add CORS preflight for uploads
app.options('/api/uploads', cors());
// Increase JSON payload limit to 50MB for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
const rootDir = path.join(__dirname, '..');

// Serve the root directory
app.use(express.static(rootDir));

// Serve images directory explicitly
app.use('/images', express.static(path.join(rootDir, 'images')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Create default admin user
const { createDefaultAdminIfNone } = require('./controllers/authController');
createDefaultAdminIfNone();

// Import routes
const routes = {
  auth: './routes/authRoutes',
  tools: './routes/tools',
  services: './routes/services',
  projects: './routes/projects',
  skills: './routes/skills',
  notes: './routes/notes',
  uploads: './routes/uploads'
};

// Load and use routes
Object.entries(routes).forEach(([name, path]) => {
  try {
    console.log(`Loading route: ${name} from ${path}`);
    const router = require(path);
    const routePath = `/api/${name === 'auth' ? 'auth' : name}`;
    console.log(`Registering route: ${routePath}`);
    app.use(routePath, router);
    console.log(`Successfully registered route: ${routePath}`);
  } catch (err) {
    console.error(`Error loading ${name} routes:`, err.message);
    console.error(err.stack);
  }
});

// Root route - serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

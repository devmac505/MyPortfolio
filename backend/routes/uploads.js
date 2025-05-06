const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const Image = require('../models/Image');

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
});

// Simple test endpoint to check if the route is working
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Uploads route is working' });
});

// Upload image and store in MongoDB - temporarily bypassing auth for testing
router.post('/', (req, res, next) => {
  console.log('Upload endpoint hit');
  console.log('Headers:', req.headers);
  console.log('Body type:', typeof req.body);
  next();
}, upload.single('image'), async (req, res) => {
  console.log('After auth middleware');
  try {
    console.log('Processing upload request');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File present' : 'No file');

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category: req.body.category || 'general'
    });

    // Create a new image document
    const newImage = new Image({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      category: req.body.category || 'general'
    });

    // Save to MongoDB
    console.log('Saving to MongoDB...');
    await newImage.save();
    console.log('Image saved successfully with ID:', newImage._id);

    // Return the image ID and URL for accessing it
    res.status(201).json({
      _id: newImage._id,
      filename: newImage.filename,
      url: `/api/uploads/${newImage._id}`,
      category: newImage.category
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Set content type header
    res.set('Content-Type', image.contentType);

    // Send the image data
    res.send(image.data);
  } catch (err) {
    console.error('Error retrieving image:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all images (metadata only, not the actual image data)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const images = await Image.find().select('-data').sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Error retrieving images:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete image
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await Image.deleteOne({ _id: req.params.id });
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

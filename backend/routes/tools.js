const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const { protect, authorize } = require('../middleware/auth');

// Get all tools
router.get('/', async (req, res) => {
  try {
    const tools = await Tool.find().sort({ createdAt: -1 });
    res.json(tools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single tool
router.get('/:id', async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    res.json(tool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a tool
router.post('/', protect, authorize('admin'), async (req, res) => {
  const tool = new Tool({
    name: req.body.name,
    image: req.body.image
  });

  try {
    const newTool = await tool.save();
    res.status(201).json(newTool);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a tool
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });

    if (req.body.name) tool.name = req.body.name;
    if (req.body.image) tool.image = req.body.image;

    const updatedTool = await tool.save();
    res.json(updatedTool);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a tool
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });

    await tool.remove();
    res.json({ message: 'Tool deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

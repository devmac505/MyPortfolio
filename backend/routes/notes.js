const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect, authorize } = require('../middleware/auth');

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new note
router.post('/', async (req, res) => {
  try {
    const { author, content, color, position } = req.body;

    // Create new note
    const newNote = new Note({
      author: author || 'Anonymous',
      content,
      color: color || '#f9d77e',
      position
    });

    // Save to database
    const note = await newNote.save();

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a note (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await Note.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Note removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please add a note content'],
    trim: true,
    maxlength: [500, 'Note cannot be more than 500 characters']
  },
  author: {
    type: String,
    default: 'Anonymous',
    trim: true,
    maxlength: [50, 'Author name cannot be more than 50 characters']
  },
  color: {
    type: String,
    default: '#f9d77e', // Default yellow color
    trim: true
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NoteSchema);

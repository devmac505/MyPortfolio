const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    default: 'Anonymous'
  },
  message: {
    type: String,
    required: true
  },
  color: {
    type: String,
    enum: ['yellow', 'blue', 'green', 'pink', 'purple'],
    default: 'yellow'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NoteSchema);

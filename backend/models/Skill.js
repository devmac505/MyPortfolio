const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', SkillSchema);

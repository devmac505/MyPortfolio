const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a skill
router.post('/', async (req, res) => {
  const skill = new Skill({
    category: req.body.category,
    icon: req.body.icon,
    skills: req.body.skills
  });

  try {
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a skill
router.put('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    if (req.body.category) skill.category = req.body.category;
    if (req.body.icon) skill.icon = req.body.icon;
    if (req.body.skills) skill.skills = req.body.skills;

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a skill
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    await Skill.deleteOne({ _id: req.params.id });
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

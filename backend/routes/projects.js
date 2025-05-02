const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a project
router.post('/', async (req, res) => {
  const project = new Project({
    title: req.body.title,
    image: req.body.image,
    description: req.body.description,
    demoUrl: req.body.demoUrl,
    githubUrl: req.body.githubUrl,
    tags: req.body.tags
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.body.title) project.title = req.body.title;
    if (req.body.image) project.image = req.body.image;
    if (req.body.description) project.description = req.body.description;
    if (req.body.demoUrl !== undefined) project.demoUrl = req.body.demoUrl;
    if (req.body.githubUrl !== undefined) project.githubUrl = req.body.githubUrl;
    if (req.body.tags) project.tags = req.body.tags;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

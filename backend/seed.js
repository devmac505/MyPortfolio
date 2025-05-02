const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const Tool = require('./models/Tool');
const Service = require('./models/Service');
const Project = require('./models/Project');
const Skill = require('./models/Skill');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Sample data for seeding
const tools = [
  { name: 'HTML5', image: 'images/tools/html5.png' },
  { name: 'CSS3', image: 'images/tools/css3.png' },
  { name: 'JavaScript', image: 'images/tools/javascript.png' },
  { name: 'React', image: 'images/tools/react.png' },
  { name: 'Node.js', image: 'images/tools/nodejs.png' },
  { name: 'MongoDB', image: 'images/tools/mongodb.png' }
];

const services = [
  {
    title: 'Web Development',
    icon: 'bi-code-slash',
    description: 'Custom website development using modern technologies and best practices.'
  },
  {
    title: 'Responsive Design',
    icon: 'bi-phone',
    description: 'Mobile-friendly websites that look great on all devices.'
  },
  {
    title: 'API Development',
    icon: 'bi-diagram-3',
    description: 'Building robust APIs for your web and mobile applications.'
  }
];

const projects = [
  {
    title: 'Portfolio Website',
    image: 'images/projects/portfolio.jpg',
    description: 'My personal portfolio website built with MERN stack.',
    demoUrl: '#',
    githubUrl: 'https://github.com/devmac505',
    tags: ['React', 'Node.js', 'MongoDB', 'Express']
  },
  {
    title: 'E-commerce Platform',
    image: 'images/projects/ecommerce.jpg',
    description: 'A full-featured e-commerce platform with payment integration.',
    demoUrl: '#',
    githubUrl: 'https://github.com/devmac505',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe']
  }
];

const skills = [
  {
    category: 'Frontend',
    icon: 'bi-laptop',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Bootstrap', 'Responsive Design']
  },
  {
    category: 'Backend',
    icon: 'bi-server',
    skills: ['Node.js', 'Express', 'MongoDB', 'RESTful APIs', 'Authentication']
  },
  {
    category: 'Tools',
    icon: 'bi-tools',
    skills: ['Git', 'GitHub', 'VS Code', 'Postman', 'Heroku', 'Netlify']
  }
];

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Tool.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Skill.deleteMany({});

    console.log('Cleared existing data');

    // Insert new data
    await Tool.insertMany(tools);
    await Service.insertMany(services);
    await Project.insertMany(projects);
    await Skill.insertMany(skills);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

// Run the seed function
seedData();

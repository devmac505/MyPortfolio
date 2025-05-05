/**
 * Backend Troubleshooting Script
 * 
 * This script checks for common issues with the backend and attempts to fix them.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting backend troubleshooting...');

// Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from .env.example...');
  try {
    const envExamplePath = path.join(__dirname, 'backend', '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('Created .env file successfully.');
    } else {
      console.log('No .env.example file found. Creating basic .env file...');
      const basicEnv = `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://admin:password1234@cluster0.q4evcxs.mongodb.net/MyPortfolio?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_for_portfolio_dashboard_2024
JWT_EXPIRE=24h`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('Created basic .env file successfully.');
    }
  } catch (error) {
    console.error('Error creating .env file:', error.message);
  }
}

// Check if node_modules exists in backend
const backendNodeModulesPath = path.join(__dirname, 'backend', 'node_modules');
if (!fs.existsSync(backendNodeModulesPath)) {
  console.log('Installing backend dependencies...');
  try {
    execSync('cd backend && npm install', { stdio: 'inherit' });
    console.log('Backend dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing backend dependencies:', error.message);
  }
}

// Check if mock-data directory exists
const mockDataPath = path.join(__dirname, 'mock-data');
if (!fs.existsSync(mockDataPath)) {
  console.log('Creating mock-data directory...');
  try {
    fs.mkdirSync(mockDataPath);
    console.log('Created mock-data directory successfully.');
  } catch (error) {
    console.error('Error creating mock-data directory:', error.message);
  }
}

console.log('\nTroubleshooting complete!');
console.log('\nTo start the backend server, run:');
console.log('cd backend && npm start');
console.log('\nIf you continue to have issues, please refer to the TROUBLESHOOTING.md file.');

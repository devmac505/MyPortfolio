# DevMac Portfolio Website

A personal portfolio website built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Responsive design that works on all devices
- Dark theme
- Interactive freedom wall for visitors to leave notes
- Admin dashboard for content management
- JWT authentication for admin access
- MongoDB database for storing portfolio data
- Contact form for sending messages

## Project Structure

- `/` - Root directory with frontend HTML, CSS, and JavaScript files
- `/backend` - Node.js/Express backend API
- `/dashboard` - Admin dashboard interface
- `/images` - Image assets for the website

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/portfolio-website.git
   cd portfolio-website
   ```

2. Install dependencies:
   ```
   npm run install:all
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Add your MongoDB connection string and JWT secret

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment

1. Set the NODE_ENV to production in the backend .env file
2. Deploy the backend to a hosting service like Heroku, Render, or DigitalOcean
3. Deploy the frontend to a static hosting service like Netlify, Vercel, or GitHub Pages
4. Update the API_URL in portfolio.js to point to your deployed backend

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: (Add your deployment platforms here)

## License

MIT

## Author

Mark Anthony Custodio

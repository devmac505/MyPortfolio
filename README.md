# Portfolio Website

A personal portfolio website built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Responsive design
- Admin dashboard for content management
- Dynamic content loading for tools, services, projects, and skills
- Interactive freedom wall for visitors to leave comments
- Contact form
- JWT authentication for admin access

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd portfolio-website
   ```

2. Install dependencies:
   ```
   npm run install:all
   ```

3. Create a `.env` file in the backend directory:
   ```
   cp backend/.env.example backend/.env
   ```

4. Update the `.env` file with your MongoDB connection string and other configuration options.

## Running the Application

### Development Mode

To run both frontend and backend in development mode:

```
npm run dev
```

To run only the backend:

```
npm run dev:backend
```

To run only the frontend:

```
npm run dev:frontend
```

### Production Mode

To start the application in production mode:

```
npm start
```

## Database Seeding

To seed the database with initial data:

```
npm run seed
```

## Admin Access

The default admin credentials are:
- Username: devmac
- Password: devmac12

You can access the admin dashboard by clicking the Admin button in the navbar and logging in with these credentials.

### Admin Login Issues

If you're having trouble logging in with the admin credentials, please refer to the `ADMIN-LOGIN-FIX.md` file for detailed troubleshooting steps. You can run the following script to recreate the admin user:

```
cd backend
node forceCreateAdmin.js
```

## Project Structure

- `/backend` - Express server and API
  - `/controllers` - Request handlers
  - `/middleware` - Custom middleware
  - `/models` - MongoDB models
  - `/routes` - API routes
- `/images` - Static images
- `index.html` - Main HTML file
- `style.css` - Main CSS file
- `portfolio.js` - Main JavaScript file
- `freedom-wall-new.js` - Freedom wall functionality

## License

MIT

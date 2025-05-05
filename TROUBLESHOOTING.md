# Troubleshooting Guide

## API Connection Issues

If you're seeing errors like `Failed to load resource: net::ERR_CONNECTION_REFUSED` in the browser console, it means the frontend can't connect to the backend API. Here's how to fix it:

### 1. Check if the backend server is running

The backend server should be running on port 5000. To start it:

```bash
cd backend
npm install
npm start
```

### 2. Check your MongoDB connection

Make sure your MongoDB connection string in the `.env` file is correct:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your actual MongoDB Atlas credentials.

### 3. Check for other issues

If you're still having problems, check the following:

- Make sure all dependencies are installed: `npm run install:all`
- Check if there are any errors in the backend logs
- Make sure port 5000 is not being used by another application

### 4. Using mock data

The website has been configured to use mock data if the API is not available. This allows you to see the website content even if the backend is not running. The mock data is stored in the `mock-data` directory.

## Running the Application

### Development Mode

To run both frontend and backend in development mode:

```bash
npm run dev
```

To run only the backend:

```bash
npm run dev:backend
```

To run only the frontend:

```bash
npm run dev:frontend
```

### Production Mode

To start the application in production mode:

```bash
npm start
```

## Database Seeding

To seed the database with initial data:

```bash
npm run seed
```

# Admin Login Fix

If you're having issues logging in with the admin credentials (username: `devmac`, password: `devmac12`), follow these steps to fix the issue:

## Option 1: Use the Force Create Admin Script

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the force create admin script:
   ```
   node forceCreateAdmin.js
   ```

   This script will:
   - Delete any existing admin user with the username 'devmac'
   - Create a new admin user with username 'devmac' and password 'devmac12'
   - Verify that the admin user was created successfully
   - Test that the password works correctly

3. Start the backend server:
   ```
   npm start
   ```

4. Try logging in again with:
   - Username: `devmac`
   - Password: `devmac12`

## Option 2: Test the Login Process

If you want to diagnose the issue without recreating the admin user:

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the test login script:
   ```
   node testLogin.js
   ```

   This script will:
   - Find the admin user in the database
   - Test if the password 'devmac12' matches the stored password hash
   - Output detailed information about the login process

## Option 3: Check the Server Logs

When you try to log in, the server now outputs detailed information about the login process. Check the server logs to see what's happening:

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Try logging in through the frontend

3. Check the server logs for messages like:
   - `Login attempt: username=devmac, password=devmac12`
   - `User found: devmac, ID: ...`
   - `Comparing passwords: entered=devmac12, stored hash=...`
   - `Password match result: true/false`

This information will help you identify where the login process is failing.

## Common Issues

1. **Database Connection**: Make sure your MongoDB connection string in the `.env` file is correct.

2. **Password Hashing**: The password is hashed before being stored in the database. If the hashing algorithm or salt has changed, the stored hash might not match.

3. **User Not Found**: The admin user might not exist in the database. Use the force create admin script to create it.

4. **Case Sensitivity**: Make sure you're entering the username and password exactly as they are defined (lowercase 'devmac' and 'devmac12').

If you continue to have issues, please contact the developer for assistance.
